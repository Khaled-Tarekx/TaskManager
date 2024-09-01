import Task from './models';

import { notifyUserOfUpcomingDeadline } from './utills';
import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
	compareMembersWorkspace,
} from '../../utills/helpers';

import {
	Status,
	type assignTaskParams,
	type createTaskDTO,
	type updateTaskDTO,
} from './types';
import { Member } from '../workspaces/models';
import {
	TaskNotFound,
	TaskCreationFailed,
	TaskDeletionFailed,
	TaskUpdatingFailed,
	MailFailedToSend,
	TaskMarkedCompleted,
	CompleteTaskDependenciesFirst,
	AssigneeNotFound,
} from './errors/cause';
import { MemberNotFound } from '../workspaces/members/errors/cause';

export const getTasks = async () => {
	return Task.find({});
};
// return getOrSetCache('tasks', Task, (model) => model.find({}));

export const getTask = async (taskId: string) => {
	validateObjectIds([taskId]);
	return findResourceById(Task, taskId, TaskNotFound);
};

export const createTask = async (
	taskData: createTaskDTO,
	user: Express.User,
	attachment: Express.Multer.File | undefined
) => {
	const {
		dead_line,
		dependants,
		priority,
		skill_set,
		status,
		assigneeId,
		workspaceId,
	} = taskData;
	const assignee = await Member.findOne({
		_id: assigneeId,
		workspace: workspaceId,
	});
	checkResource(assignee, MemberNotFound);
	const creator = await Member.findOne({
		user: user.id,
		workspace: workspaceId,
	});
	checkResource(creator, MemberNotFound);

	await compareMembersWorkspace(
		assignee.workspace._id,
		creator.workspace._id
	);
	const task = await Task.create({
		creator: creator._id,
		assignee: assignee._id,
		workspace: creator.workspace._id,
		dead_line,
		dependants,
		priority,
		skill_set,
		status,
		attachment: attachment?.path,
	});
	checkResource(task, TaskCreationFailed);

	if (assignee) {
		task.status = Status.InProgress;
		task.assignee = assignee;
		await task.save();
		try {
			await notifyUserOfUpcomingDeadline(task);
		} catch (err: unknown) {
			if (err instanceof MailFailedToSend) {
				throw new MailFailedToSend();
			}
		}
	}
	return task;
};

export const updateTask = async (
	taskData: updateTaskDTO,
	taskId: string,
	user: Express.User,
	attachment: Express.Multer.File | undefined
) => {
	const { priority, skill_set, dead_line } = taskData;
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId, TaskNotFound);
	const creator = await findResourceById(
		Member,
		task.creator._id,
		MemberNotFound
	);

	await isResourceOwner(user.id, creator.user._id);

	const updatedTask = await Task.findByIdAndUpdate(
		task.id,
		{
			priority: priority,
			skill_set: skill_set,
			dead_line: dead_line,
			attachment: attachment?.path,
			owner: user.id,
		},
		{ new: true }
	);

	checkResource(updatedTask, TaskUpdatingFailed);
	try {
		await notifyUserOfUpcomingDeadline(task);
	} catch (err: unknown) {
		if (err instanceof MailFailedToSend) {
			throw new MailFailedToSend();
		}
	}
	return task;
};

export const deleteTask = async (user: Express.User, taskId: string) => {
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId, TaskNotFound);
	const creator = await findResourceById(
		Member,
		task.creator._id,
		MemberNotFound
	);

	await isResourceOwner(user.id, creator.user._id);

	const deletedTask = await Task.findByIdAndDelete(task.id);
	if (!deletedTask) {
		throw new TaskDeletionFailed();
	}
	return task;
};
export const assignTask = async (
	params: assignTaskParams,
	user: Express.User
) => {
	const { taskId, assigneeId } = params;

	validateObjectIds([taskId, assigneeId]);
	const task = await findResourceById(Task, taskId, TaskNotFound);
	const creator = await findResourceById(
		Member,
		task.creator._id,
		MemberNotFound
	);

	await isResourceOwner(user.id, creator.user._id);
	const assignee = await Member.findOne({ user: assigneeId });
	checkResource(assignee, MemberNotFound);

	await compareMembersWorkspace(
		assignee.workspace._id,
		creator.workspace._id
	);
	const assignedTask = await Task.findByIdAndUpdate(
		task.id,
		{ worker: assignee._id, status: 'inProgress' },
		{ new: true }
	).populate({
		path: 'assignee',
		populate: {
			path: 'user',
			select: 'email position',
		},
	});

	checkResource(assignedTask, TaskUpdatingFailed);
	try {
		await notifyUserOfUpcomingDeadline(assignedTask);
	} catch (err: unknown) {
		if (err instanceof MailFailedToSend) {
			throw new MailFailedToSend();
		}
	}
	return assignedTask;
};

export const markCompleted = async (taskId: string, user: Express.User) => {
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId, TaskNotFound);
	const creator = await findResourceById(
		Member,
		task.creator._id,
		MemberNotFound
	);

	await isResourceOwner(user.id, creator.user._id);

	if (!task.assignee) {
		throw new AssigneeNotFound();
	}

	if (task.dependants && task.dependants.length > 0) {
		const incompleteDependants = await Task.find({
			_id: { $in: task.dependants },
			status: { $ne: 'completed' },
		});
		incompleteDependants.map((dep) => dep._id).join(', ');
		if (incompleteDependants.length > 0) {
			throw new CompleteTaskDependenciesFirst();
		}
	}

	if (task.status === Status.Completed) {
		throw new TaskMarkedCompleted();
	}

	const taskToMark = await Task.findByIdAndUpdate(
		task.id,
		{ status: 'completed' },
		{ new: true }
	);

	checkResource(taskToMark, TaskUpdatingFailed);

	await Task.updateMany(
		{ dependants: task.id },
		{ $pull: { dependants: task.id } }
	);

	return taskToMark;
};
