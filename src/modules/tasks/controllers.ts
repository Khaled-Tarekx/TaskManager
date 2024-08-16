import { type NextFunction, type Request, type Response } from 'express';
import Task from './models.js';
import { StatusCodes } from 'http-status-codes';
import {
	BadRequest,
	CustomError,
	NotFound,
	UnAuthenticated,
} from '../../../custom-errors/main.js';
import { notifyUserOfUpcomingDeadline } from './utilities.js';
import mongoose from 'mongoose';
import { findResourceById, getOrSetCache } from '../../setup/helpers.js';
import { asyncHandler } from '../auth/middleware.js';
import { type TypedRequestBody } from 'zod-express-middleware';
import { taskSchema, updateTaskSchema } from './validation.js';
import { isResourceOwner } from '../users/helpers.js';
import { Status } from './types.js';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
	const tasks = await getOrSetCache('tasks', Task, (model) => model.find());
	res.status(StatusCodes.OK).json({ data: tasks });
});

export const getTasksPage = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const tasks = await Task.find();
		res.render('front_end/index', { tasks: tasks });
	}
);

export const getUserTasks = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		// TODO: check if owner is the same as the request.user
		const tasks = await Task.find({ owner: user.id });
		res.status(StatusCodes.OK).json({ data: tasks, count: tasks.length });
	}
);

export const getUserTask = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const { id } = req.params;
		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const task = await Task.findOne({
			owner: user.id,
			_id: id,
		});
		if (!task) {
			return next(new NotFound('no task found'));
		}
		res.status(StatusCodes.OK).json({ data: task });
	}
);

export const getTask = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const task = await Task.findById(id);
		if (!task) {
			return next(new NotFound('no task found'));
		}
		res.status(StatusCodes.OK).json({ data: task });
	}
);

export const createTask = asyncHandler(
	async (
		req: TypedRequestBody<typeof taskSchema>,
		res: Response,
		next: NextFunction
	) => {
		const attachment = req.file;
		if (!attachment || !attachment.path) {
			return next(new NotFound('No file uploaded or file path is missing'));
		}
		const { owner, dead_line, dependants, priority, skill_set, status } =
			req.body;

		const task = await Task.create({
			dead_line,
			dependants,
			priority,
			skill_set,
			status,
			attachment: attachment.path,
		});
		if (owner) {
			task.status = Status.InProgress;
			task.owner.id = owner;
			await task.save();
			try {
				await notifyUserOfUpcomingDeadline(task);
			} catch (err: any) {
				return next(
					new BadRequest(
						`Error notifying user of upcoming deadline: ${err.message}`
					)
				);
			}
		}
		res.status(StatusCodes.CREATED).json({ data: task });
	}
);

export const updateTask = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateTaskSchema>,
		res: Response,
		next: NextFunction
	) => {
		const { taskId } = req.params;
		const { priority, skill_set, dead_line } = req.body;
		const user = req.user;
		const attachment = req.file;

		if (!attachment || !attachment.path) {
			return next(new NotFound('No file uploaded or file path is missing'));
		}

		try {
			const task = await findResourceById(Task, taskId);

			if (!user?.id) {
				return next(new UnAuthenticated('log in first to grant access'));
			}

			const userIsResourceOwner = await isResourceOwner(
				user.id,
				task.owner.id
			);
			if (!userIsResourceOwner) {
				return next(
					new UnAuthenticated('you are the not the owner of this resource')
				);
			}

			const taskToUpdate = await Task.findByIdAndUpdate(
				task.id,
				{
					priority: priority,
					skill_set: skill_set,
					dead_line: dead_line,
					attachment: attachment.path,
					owner: user.id,
				},
				{ new: true }
			);

			if (!taskToUpdate) {
				return next(new NotFound('no task found'));
			}

			await notifyUserOfUpcomingDeadline(taskToUpdate);
			res
				.status(StatusCodes.OK)
				.json({ msg: 'task updated successfully', data: taskToUpdate });
		} catch (err: any) {
			next(new CustomError(err.message, StatusCodes.FORBIDDEN));
		}
	}
);

export const deleteTask = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const task = await findResourceById(Task, id);

		await Task.findByIdAndDelete(task.id);

		res.status(StatusCodes.OK).json({ msg: 'task deleted successfully' });
	}
);

export const assignTask = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id, user_id } = req.params;
		const user = req.user;
		if (!user?.id) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const task = await findResourceById(Task, id);

		const userIsResourceOwner = await isResourceOwner(user.id, task.owner.id);
		if (!userIsResourceOwner) {
			return next(
				new UnAuthenticated('you are the not the owner of this resource')
			);
		}
		const assignedTask = await Task.findByIdAndUpdate(
			task.id,
			{ owner: user_id, status: 'inProgress' },
			{ new: true }
		).populate({
			path: 'owner',
			select: 'email position',
		});

		if (!assignedTask) {
			return next(new NotFound('no task found'));
		}

		await notifyUserOfUpcomingDeadline(assignedTask);

		res.status(StatusCodes.OK).json({
			msg: 'task assigned to user successfully',
			data: assignedTask,
			assignedUser: user_id,
		});
	}
);

export const markCompleted = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { taskId } = req.params;

		const task = await findResourceById(Task, taskId);

		if (!task.owner) {
			return next(
				new BadRequest(
					`task must be assigned to a user first before` +
						` marking it as completed, task is ${task.status}`
				)
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
				return next(
					new BadRequest(
						`dependant tasks must be completed first ${incompleteDependantsIds}`
					)
				);
			}
		}
		const taskToMark = await Task.findByIdAndUpdate(
			task.id,
			{ status: 'completed' },
			{ new: true }
		);

		if (!taskToMark) {
			return next(new NotFound('no task found to mark'));
		}

		// if a task is marked as completed remove it from being a dependent on other tasks
		await Task.updateMany(
			{ dependants: task.id },
			{ $pull: { dependants: task.id } }
		);

		if (taskToMark.status === 'completed') {
			return next(new BadRequest(`task already marked as completed before`));
		}

		res.status(StatusCodes.OK).json({
			msg: `task completed by user ${taskToMark.owner} successfully`,
			data: taskToMark,
		});
	}
);
