import type { NextFunction, Request, Response } from 'express';
import Task from './models';
import { StatusCodes } from 'http-status-codes';
import { checkUser, validateObjectIds } from '../../utills/helpers';
import { type TypedRequestBody } from 'zod-express-middleware';
import { createTaskSchema, updateTaskSchema } from './validation';

import * as TaskServices from './services';
import {
	TaskNotFound,
	TaskCreationFailed,
	TaskDeletionFailed,
	TaskMarkedCompleted,
	TaskUpdatingFailed,
	MailFailedToSend,
	AssigneeNotFound,
	CompleteTaskDependenciesFirst,
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
import {
	NotResourceOwner,
	NotValidId,
	WorkspaceMismatch,
} from '../../utills/errors/cause';

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
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof MemberNotFound:
				next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof TaskCreationFailed:
				next(new Conflict(ErrorMsg.TaskCreationFailed));
			case err instanceof MailFailedToSend:
				next(new Conflict(ErrorMsg.MailFailedToSend));
			default:
				next(err);
		}
	}
};

export const updateTask = async (
	req: TypedRequestBody<typeof updateTaskSchema>,
	res: Response,
	next: NextFunction
) => {
	const { priority, skill_set, dead_line } = req.body;
	const { taskId } = req.params;
	try {
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
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof TaskNotFound:
				next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				next(new Forbidden(GlobalErrorMsg.NotResourceOwner));

			case err instanceof TaskUpdatingFailed:
				next(new Conflict(ErrorMsg.TaskUpdatingFailed));
			case err instanceof MailFailedToSend:
				next(new Conflict(ErrorMsg.MailFailedToSend));
			default:
				next(err);
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
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof TaskNotFound:
				next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				next(new Forbidden(GlobalErrorMsg.NotResourceOwner));

			case err instanceof TaskDeletionFailed:
				next(new Conflict(ErrorMsg.TaskDeletionFailed));
			default:
				next(err);
		}
	}
};

export const assignTask = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { taskId, assigneeId } = req.params;
	const user = req.user;
	try {
		checkUser(user);
		validateObjectIds([taskId, assigneeId]);
		const assignedTask = await TaskServices.assignTask(
			{ taskId, assigneeId },
			user
		);

		res.status(StatusCodes.OK).json({
			data: assignedTask,
		});
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof TaskNotFound:
				next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof WorkspaceMismatch:
				next(new Conflict(GlobalErrorMsg.WorkspaceMismatch));
			case err instanceof TaskUpdatingFailed:
				next(new Conflict(ErrorMsg.TaskUpdatingFailed));
			case err instanceof MailFailedToSend:
				next(new Conflict(ErrorMsg.MailFailedToSend));
			default:
				next(err);
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
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof TaskNotFound:
				next(new NotFound(ErrorMsg.TaskNotFound));
			case err instanceof MemberNotFound:
				next(new NotFound(ErrorMsg.AssigneeOrCreatorNotFound));
			case err instanceof NotResourceOwner:
				next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof AssigneeNotFound:
				next(new NotFound(ErrorMsg.AssigneeNotFound));
			case err instanceof CompleteTaskDependenciesFirst:
				next(new Conflict(ErrorMsg.CompleteTaskDependenciesFirst));
			case err instanceof TaskMarkedCompleted:
				next(new Conflict(ErrorMsg.TaskAlreadyMarked));
			case err instanceof TaskUpdatingFailed:
				next(new Conflict(ErrorMsg.TaskUpdatingFailed));
			default:
				next(err);
		}
	}
};
