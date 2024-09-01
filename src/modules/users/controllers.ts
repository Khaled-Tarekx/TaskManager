import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { type TypedRequestBody } from 'zod-express-middleware';
import { updateUserSchema } from './validations';
import * as UserServices from './services';
import { checkUser } from '../../utills/helpers';
import { BadRequestError, NotFound } from '../../custom-errors/main';
import { NotValidId } from '../../utills/errors/cause';
import { UserNotFound } from '../auth/errors/cause';
import { UserDeletionFailed, UserUpdatingFailed } from './errors/cause';
import { ReplyNotFound } from '../comments/replies/errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as ErrorMsg from './errors/msg';
import * as AuthErrorMsg from '../auth/errors/msg';

import * as ReplyErrorMsg from '../comments/replies/errors/msg';
import * as CommentErrorMsg from '../comments/errors/msg';
import * as TaskErrorMsg from '../tasks/errors/msg';
import { CommentNotFound } from '../comments/errors/cause';
import { TaskNotFound } from '../tasks/errors/cause';

export const getUsers = async (_req: Request, res: Response) => {
	const users = await UserServices.getUsers();
	res.status(StatusCodes.OK).json({ data: users, count: users.length });
};

export const getUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { userId } = req.params;
	try {
		const user = await UserServices.getUser(userId);
		res.status(StatusCodes.OK).json({ data: user });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof NotValidId:
				next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof UserNotFound:
				next(new NotFound(AuthErrorMsg.UserNotFound));
			default:
				next(err);
		}
	}
};

export const updateUserInfo = async (
	req: TypedRequestBody<typeof updateUserSchema>,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const { email, username } = req.body;
		const updatedUser = await UserServices.updateUserInfo(
			{ email, username },
			user
		);

		res.status(StatusCodes.OK).json({ data: updatedUser });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof UserUpdatingFailed:
				next(new NotFound(ErrorMsg.UserUpdatingFailed));
			default:
				next(err);
		}
	}
};

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const deletedUser = await UserServices.deleteUser(user);
		res.status(StatusCodes.OK).json({ data: deletedUser });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof UserDeletionFailed:
				next(new NotFound(ErrorMsg.UserDeletionFailed));
			default:
				next(err);
		}
	}
};

export const getUserReplies = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const userReplies = await UserServices.getUserReplies(user);

		res
			.status(StatusCodes.OK)
			.json({ data: userReplies, count: userReplies.length });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			default:
				next(err);
		}
	}
};

export const getUserReply = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { replyId } = req.params;
	const user = req.user;
	try {
		checkUser(user);
		const userReply = await UserServices.getUserReply(replyId, user);
		res.status(StatusCodes.OK).json({ data: userReply });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof ReplyNotFound:
				next(new NotFound(ReplyErrorMsg.ReplyNotFound));
			default:
				next(err);
		}
	}
};

export const getUserComments = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const userComments = await UserServices.getUserComments(user);

		res
			.status(StatusCodes.OK)
			.json({ data: userComments, count: userComments.length });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			default:
				next(err);
		}
	}
};

export const getUserComment = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { commentId } = req.params;
	const user = req.user;
	try {
		checkUser(user);
		const userComment = await UserServices.getUserComment(commentId, user);
		res.status(StatusCodes.OK).json({ data: userComment });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof CommentNotFound:
				next(new NotFound(CommentErrorMsg.CommentNotFound));
			default:
				next(err);
		}
	}
};

export const getUserTasks = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const tasks = await UserServices.getUserTasks(user);

		res.status(StatusCodes.OK).json({ data: tasks, count: tasks.length });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			default:
				next(err);
		}
	}
};

export const getUserTask = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	try {
		checkUser(user);
		const { taskId } = req.params;
		const task = await UserServices.getUserTask(user, taskId);

		res.status(StatusCodes.OK).json({ data: task });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof TaskNotFound:
				next(new NotFound(TaskErrorMsg.TaskNotFound));
			default:
				next(err);
		}
	}
};
