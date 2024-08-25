import Task from './models';
import { BadRequest, Forbidden } from '../../custom-errors/main';
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
import mongoose, { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
export const getTasks = async () => {
	return Task.find({});
};
// return getOrSetCache('tasks', Task, (model) => model.find({}));

export const getTask = async (taskId: string) => {
	validateObjectIds([taskId]);
	return findResourceById(Task, taskId);
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
	const validatedAssignee = await checkResource(assignee);
	const creator = await Member.findOne({
		user: user.id,
		workspace: workspaceId,
	});
	const validateCreator = await checkResource(creator);

	await compareMembersWorkspace(
		validatedAssignee.workspace._id,
		validateCreator.workspace._id
	);
	const task = await Task.create({
		creator: validateCreator._id,
		assignee: validatedAssignee._id,
		workspace: validateCreator.workspace._id,
		dead_line,
		dependants,
		priority,
		skill_set,
		status,
		attachment: attachment?.path,
	});
	const validatedTask = await checkResource(task);
	if (validatedAssignee) {
		validatedTask.status = Status.InProgress;
		validatedTask.assignee = validatedAssignee;
		await validatedTask.save();
		try {
			await notifyUserOfUpcomingDeadline(validatedTask);
		} catch (err: any) {
			throw new BadRequest(
				`Error notifying user of upcoming deadline: ${err.message}`
			);
		}
	}
	return validatedTask;
};

export const updateTask = async (
	taskData: updateTaskDTO,
	taskId: string,
	user: Express.User,
	attachment: Express.Multer.File | undefined
) => {
	const { priority, skill_set, dead_line } = taskData;
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId);
	const creator = await findResourceById(Member, task.creator._id);

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

	const validatedTask = await checkResource(updatedTask);
	try {
		await notifyUserOfUpcomingDeadline(validatedTask);
		return validatedTask;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteTask = async (user: Express.User, taskId: string) => {
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId);
	const creator = await findResourceById(Member, task.creator._id);

	await isResourceOwner(user.id, creator.user._id);

	await Task.findByIdAndDelete(task.id);

	return task;
};
export const assignTask = async (
	params: assignTaskParams,
	user: Express.User
) => {
	const { taskId, assigneeId } = params;

	validateObjectIds([taskId, assigneeId]);
	const task = await findResourceById(Task, taskId);
	const creator = await findResourceById(Member, task.creator._id);

	await isResourceOwner(user.id, creator.user._id);
	const assignee = await Member.findOne({ user: assigneeId });
	const validatedAssignee = await checkResource(assignee);

	await compareMembersWorkspace(
		validatedAssignee.workspace._id,
		creator.workspace._id
	);
	const assignedTask = await Task.findByIdAndUpdate(
		task.id,
		{ worker: validatedAssignee._id, status: 'inProgress' },
		{ new: true }
	).populate({
		path: 'assignee',
		populate: {
			path: 'user',
			select: 'email position',
		},
	});

	const validatedTask = await checkResource(assignedTask);
	try {
		await notifyUserOfUpcomingDeadline(validatedTask);
		return validatedTask;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const markCompleted = async (taskId: string, user: Express.User) => {
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId);
	const creator = await findResourceById(Member, task.creator._id);

	await isResourceOwner(user.id, creator.user._id);

	if (!task.assignee) {
		throw new BadRequest(
			`task must be assigned to a user first before` +
				` marking it as completed, task is ${task.status}`
		);
	}

	if (task.dependants && task.dependants.length > 0) {
		const incompleteDependants = await Task.find({
			_id: { $in: task.dependants },
			status: { $ne: 'completed' },
		});
		const incompleteDependantsIds = incompleteDependants
			.map((dep) => dep._id)
			.join(', ');
		if (incompleteDependants.length > 0) {
			throw new BadRequest(
				`dependant tasks must be completed first ${incompleteDependantsIds}`
			);
		}
	}
	const taskToMark = await Task.findByIdAndUpdate(
		task.id,
		{ status: 'completed' },
		{ new: true }
	);

	const validatedTask = await checkResource(taskToMark);

	await Task.updateMany(
		{ dependants: task.id },
		{ $pull: { dependants: task.id } }
	);

	if (validatedTask.status === 'completed') {
		throw new BadRequest(`task already marked as completed before`);
	}

	return validatedTask;
};
