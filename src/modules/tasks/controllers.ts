import type { Request, Response } from 'express';
import Task from './models';
import { StatusCodes } from 'http-status-codes';
import { checkUser, validateObjectIds } from '../../utills/helpers';
import { asyncHandler } from '../auth/middleware';
import { type TypedRequestBody } from 'zod-express-middleware';
import { createTaskSchema, updateTaskSchema } from './validation';

import * as TaskServices from './services';

export const getTasks = asyncHandler(async (_req: Request, res: Response) => {
	const tasks = await TaskServices.getTasks();
	res.status(StatusCodes.OK).json({ data: tasks, count: tasks.length });
});

export const getTasksPage = asyncHandler(
	async (_req: Request, res: Response) => {
		const tasks = await Task.find({});
		res.render('front_end/index', { tasks: tasks });
	}
);

export const getTask = asyncHandler(async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const task = await TaskServices.getTask(taskId);

	res.status(StatusCodes.OK).json({ data: task });
});

export const createTask = asyncHandler(
	async (req: TypedRequestBody<typeof createTaskSchema>, res: Response) => {
		const user = req.user;
		checkUser(user);
		const attachment = req.file;
		const {
			dead_line,
			dependants,
			priority,
			skill_set,
			status,
			assigneeId,
			workspaceId,
		} = req.body;
		const task = await TaskServices.createTask(
			{
				dead_line,
				dependants,
				priority,
				skill_set,
				status,
				assigneeId,
				workspaceId,
			},
			user,
			attachment
		);

		res.status(StatusCodes.CREATED).json({ data: task });
	}
);

export const updateTask = asyncHandler(
	async (req: TypedRequestBody<typeof updateTaskSchema>, res: Response) => {
		const { priority, skill_set, dead_line } = req.body;
		const { taskId } = req.params;
		const user = req.user;
		checkUser(user);
		const attachment = req.file;

		const updatedTask = await TaskServices.updateTask(
			{
				dead_line,
				priority,
				skill_set,
			},
			taskId,
			user,
			attachment
		);
		res.status(StatusCodes.OK).json({ data: updatedTask });
	}
);

export const deleteTask = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		checkUser(user);
		const { taskId } = req.params;

		const deletedTask = await TaskServices.deleteTask(user, taskId);
		res.status(StatusCodes.OK).json({ data: deletedTask });
	}
);

export const assignTask = asyncHandler(
	async (req: Request, res: Response) => {
		const { taskId, assigneeId } = req.params;
		const user = req.user;
		checkUser(user);
		validateObjectIds([taskId, assigneeId]);
		const assignedTask = await TaskServices.assignTask(
			{ taskId, assigneeId },
			user
		);

		res.status(StatusCodes.OK).json({
			data: assignedTask,
		});
	}
);

export const markCompleted = asyncHandler(
	async (req: Request, res: Response) => {
		const { taskId } = req.params;
		const user = req.user;
		checkUser(user);
		const markedTask = await TaskServices.markCompleted(taskId, user);
		res.status(StatusCodes.OK).json({ data: markedTask });
	}
);
