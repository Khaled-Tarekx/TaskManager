import type { NextFunction, Request, Response } from 'express';
import Task from './models';
import { StatusCodes } from 'http-status-codes';
import { checkUser } from '../../utills/helpers';
import { type TypedRequestBody } from 'zod-express-middleware';
import {
	createTaskSchema,
	updateTaskSchema,
	assignTaskSchema,
} from './validation';

import * as TaskServices from './services';
import {
	TaskNotFound,
	TaskCreationFailed,
	TaskDeletionFailed,
	TaskMarkedCompleted,
	TaskUpdatingFailed,
	MailFailedToSend,
	AssigneeNotFound,
	CompleteSubTasksFirst,
} from './errors/cause';
import {
	AuthenticationError,
	Conflict,
	Forbidden,
	NotFound,
} from '../../custom-errors/main';
import * as ErrorMsg from './errors/msg';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import { UserNotFound } from '../auth/errors/cause';

import { MemberNotFound } from '../workspaces/members/errors/cause';
import { NotResourceOwner, NotValidId } from '../../utills/errors/cause';

export const getTasks = async (_req: Request, res: Response) => {
	const tasks = await TaskServices.getTasks();
	res.status(StatusCodes.OK).json({ data: tasks, count: tasks.length });
};

export const getTasksPage = async (_req: Request, res: Response) => {
	const tasks = await Task.find({});
	res.render('front_end/index', { tasks: tasks });
};

export const getTask = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { taskId } = req.params;
	try {
		const task = await TaskServices.getTask(taskId);

		res.status(StatusCodes.OK).json({ data: task });
	} catch (err: unknown) {
		if (err instanceof TaskNotFound) {
			next(new NotFound(ErrorMsg.TaskNotFound));
		}
	}
};

export const createTask = async (
	req: TypedRequestBody<typeof createTaskSchema>,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const attachment = req.file;
		const {
			deadline,
			subtasks,
			priority,
			tags,
			status,
			assigneesId,
			workspaceId,
			customFields,
		} = req.body;
		const task = await TaskServices.createTask(
			{
				deadline,
				subtasks,
				priority,
				tags,
				status,
				assigneesId,
				workspaceId,
				customFields,
			},
			user,
			attachment
		);

		res.status(StatusCodes.CREATED).json({ data: task });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof MemberNotFound:
				return next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof TaskCreationFailed:
				return next(new Conflict(ErrorMsg.TaskCreationFailed));
			case err instanceof MailFailedToSend:
				return next(new Conflict(ErrorMsg.MailFailedToSend));
			default:
				return next(err);
		}
	}
};

export const updateTask = async (
	req: TypedRequestBody<typeof updateTaskSchema>,
	res: Response,
	next: NextFunction
) => {
	const {
		priority,
		tags,
		deadline,
		customFields,
		assignees,
		status,
		subtasks,
	} = req.body;
	const { taskId } = req.params;
	try {
		const user = req.user;
		checkUser(user);
		const attachment = req.file;

		const updatedTask = await TaskServices.updateTask(
			{
				priority,
				tags,
				deadline,
				customFields,
				assignees,
				status,
				subtasks,
			},
			taskId,
			user,
			attachment
		);
		res.status(StatusCodes.OK).json({ data: updatedTask });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof TaskNotFound:
				return next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				return next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				return next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof TaskUpdatingFailed:
				return next(new Conflict(ErrorMsg.TaskUpdatingFailed));
			case err instanceof MailFailedToSend:
				return next(new Conflict(ErrorMsg.MailFailedToSend));
			default:
				return next(err);
		}
	}
};

export const deleteTask = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const { taskId } = req.params;

		const deletedTask = await TaskServices.deleteTask(user, taskId);
		res.status(StatusCodes.OK).json({ data: deletedTask });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof TaskNotFound:
				return next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				return next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				return next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof TaskDeletionFailed:
				return next(new Conflict(ErrorMsg.TaskDeletionFailed));
			default:
				return next(err);
		}
	}
};

export const assignTask = async (
	req: TypedRequestBody<typeof assignTaskSchema>,
	res: Response,
	next: NextFunction
) => {
	const { taskId } = req.params;
	const { assigneesId } = req.body;
	const user = req.user;
	try {
		checkUser(user);
		const assignedTask = await TaskServices.assignTask(
			taskId,
			{ assigneesId },
			user
		);

		res.status(StatusCodes.OK).json({
			data: assignedTask,
		});
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof TaskNotFound:
				return next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				return next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				return next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof TaskUpdatingFailed:
				return next(new Conflict(ErrorMsg.TaskUpdatingFailed));
			case err instanceof MailFailedToSend:
				return next(new Conflict(ErrorMsg.MailFailedToSend));
			default:
				return next(err);
		}
	}
};

export const markCompleted = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { taskId } = req.params;
	try {
		const user = req.user;
		checkUser(user);
		const markedTask = await TaskServices.markCompleted(taskId, user);
		res.status(StatusCodes.OK).json({ data: markedTask });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof TaskNotFound:
				return next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				return next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				return next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof AssigneeNotFound:
				return next(new NotFound(ErrorMsg.AssigneeNotFound));
			case err instanceof CompleteSubTasksFirst:
				return next(new Conflict(ErrorMsg.CompleteSubTasksFirst));
			case err instanceof TaskMarkedCompleted:
				return next(new Conflict(ErrorMsg.TaskAlreadyMarked));
			case err instanceof TaskUpdatingFailed:
				return next(new Conflict(ErrorMsg.TaskUpdatingFailed));
			default:
				return next(err);
		}
	}
};
