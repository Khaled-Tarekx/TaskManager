import Task from './models';
import { BadRequest, Forbidden } from '../../custom-errors/main';
import { notifyUserOfUpcomingDeadline } from './utills';
import {
	checkResource,
	findResourceById,
	getOrSetCache,
	validateObjectIds,
	isResourceOwner,
} from '../../utills/helpers';

import {
	Status,
	type assignTaskParams,
	type createTaskDTO,
	type updateTaskDTO,
} from './types';
import { Member } from '../workspaces/models';

export const getTasks = async () => {
	return getOrSetCache('tasks', Task, (model) => model.find({}));
};

export const getUserTasks = async (user: Express.User) => {
	return Task.find({ owner: user.id });
};

export const getUserTask = async (user: Express.User, taskId: string) => {
	validateObjectIds([taskId]);

	const task = await Task.findOne({
		owner: user.id,
		_id: taskId,
	});

	return checkResource(task);
};

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
		workerId,
		workspaceId,
	} = taskData;
	const worker = await Member.findOne({ member: workerId });
	const creator = await Member.findOne({ member: user.id });
	const validatedWorker = await checkResource(worker);
	const validateCreator = await checkResource(creator);

	if (
		validatedWorker.workspace.id !== workspaceId ||
		validateCreator.workspace.id !== workspaceId
	) {
		throw new Forbidden(
			'Creator or worker does not belong to this workspace'
		);
	}

	const task = await Task.create({
		creator: user.id,
		worker: validatedWorker.id,
		workspace: validateCreator.workspace.id,
		dead_line,
		dependants,
		priority,
		skill_set,
		status,
		attachment: attachment?.path,
	});
	const validatedResource = await checkResource(task);
	if (worker) {
		validatedResource.status = Status.InProgress;
		validatedResource.worker.id = worker;
		await validatedResource.save();
		try {
			await notifyUserOfUpcomingDeadline(validatedResource);
		} catch (err: any) {
			throw new BadRequest(
				`Error notifying user of upcoming deadline: ${err.message}`
			);
		}
	}
	return validatedResource;
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

	await isResourceOwner(user.id, task.creator._id);

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

	const validatedResource = await checkResource(updatedTask);
	try {
		await notifyUserOfUpcomingDeadline(validatedResource);
		return validatedResource;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteTask = async (user: Express.User, taskId: string) => {
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId);
	await isResourceOwner(user.id, task.creator._id);

	await Task.findByIdAndDelete(task.id);

	return task;
};
export const assignTask = async (
	params: assignTaskParams,
	user: Express.User
) => {
	const { taskId, workerId } = params;

	validateObjectIds([taskId, workerId]);
	const task = await findResourceById(Task, taskId);
	const creator = await Member.findOne({ member: task.creator.id });
	const validateCreator = await checkResource(creator);

	await isResourceOwner(user.id, validateCreator.member.id);
	const worker = await Member.findOne({ member: workerId });
	const validatedWorker = await checkResource(worker);

	if (
		validatedWorker.workspace.id !== task.workspace.id ||
		validateCreator.workspace.id !== task.workspace.id
	) {
		throw new Forbidden(
			'Creator or worker does not belong to this workspace'
		);
	}
	const assignedTask = await Task.findByIdAndUpdate(
		task.id,
		{ worker: validatedWorker.id, status: 'inProgress' },
		{ new: true }
	).populate({
		path: 'worker',
		populate: {
			path: 'member',
			select: 'email position',
		},
	});

	const validatedResource = await checkResource(assignedTask);
	try {
		await notifyUserOfUpcomingDeadline(validatedResource);
		return validatedResource;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const markCompleted = async (taskId: string, user: Express.User) => {
	validateObjectIds([taskId]);
	const task = await findResourceById(Task, taskId);
	await isResourceOwner(user.id, task.creator.id);

	if (!task.worker) {
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

	const validatedResource = await checkResource(taskToMark);

	await Task.updateMany(
		{ dependants: task.id },
		{ $pull: { dependants: task.id } }
	);

	if (validatedResource.status === 'completed') {
		throw new BadRequest(`task already marked as completed before`);
	}

	return validatedResource;
};
