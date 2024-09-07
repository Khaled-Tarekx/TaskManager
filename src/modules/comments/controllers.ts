import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { TypedRequestBody } from 'zod-express-middleware';
import type { createCommentSchema, updateCommentSchema } from './validation';
import * as CommentServices from './services';
import { checkUser } from '../../utills/helpers';
import { taskParam } from './types';
import {
	CommentCreationFailed,
	CommentDeletionFailed,
	CommentNotFound,
	CommentUpdateFailed,
	CommentCountUpdateFailed,
} from './errors/cause';
import * as ErrorMsg from './errors/msg';
import {
	AuthenticationError,
	BadRequestError,
	Conflict,
	NotFound,
} from '../../custom-errors/main';
import { NotValidId } from '../../utills/errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import { UserNotFound } from '../auth/errors/cause';

export const getTaskComments = async (
	req: Request<{}, {}, {}, taskParam>,
	res: Response,
	next: NextFunction
) => {
	const { taskId } = req.query;
	try {
		const taskComments = await CommentServices.getTaskComments(taskId);

		res
			.status(StatusCodes.OK)
			.json({ data: taskComments, count: taskComments.length });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof NotValidId:
				return next(new BadRequestError(GlobalErrorMsg.NotValidId));
			default:
				return next(err);
		}
	}
};

export const getComment = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { commentId } = req.params;
	try {
		const comment = await CommentServices.getComment(commentId);
		res.status(StatusCodes.OK).json({ data: comment });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof NotValidId:
				return next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof CommentNotFound:
				return next(new NotFound(ErrorMsg.CommentNotFound));
			default:
				return next(err);
		}
	}
};

export const createComment = async (
	req: TypedRequestBody<typeof createCommentSchema>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { taskId, context } = req.body;
		const user = req.user;
		checkUser(user);
		const comment = await CommentServices.createComment(
			{ taskId, context },
			user
		);
		res.status(StatusCodes.CREATED).json({ data: comment });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof CommentCreationFailed:
				return next(new Conflict(ErrorMsg.CommentCreationFailed));

			case err instanceof CommentCountUpdateFailed:
				return next(new Conflict(ErrorMsg.CommentCountFailed));

			default:
				return next(err);
		}
	}
};

export const editComment = async (
	req: TypedRequestBody<typeof updateCommentSchema>,
	res: Response,
	next: NextFunction
) => {
	const { commentId } = req.params;
	const user = req.user;
	checkUser(user);
	const { context } = req.body;
	try {
		const comment = await CommentServices.editComment(
			{ context },
			commentId,
			user
		);

		res.status(StatusCodes.OK).json({ data: comment });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof CommentNotFound:
				return next(new NotFound(ErrorMsg.CommentNotFound));

			case err instanceof CommentUpdateFailed:
				return next(new Conflict(ErrorMsg.CommentEditingFailed));
			default:
				return next(err);
		}
	}
};

export const deleteComment = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user;
		checkUser(user);
		const { commentId } = req.params;
		const deletedComment = await CommentServices.deleteComment(
			user,
			commentId
		);

		res.status(StatusCodes.OK).json({ data: deletedComment });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof CommentNotFound:
				return next(new NotFound(ErrorMsg.CommentNotFound));

			case err instanceof CommentCountUpdateFailed:
				return next(new Conflict(ErrorMsg.CommentCountFailed));

			case err instanceof CommentDeletionFailed:
				return next(new Conflict(ErrorMsg.CommentDeletionFailed));
			default:
				return next(err);
		}
	}
};
