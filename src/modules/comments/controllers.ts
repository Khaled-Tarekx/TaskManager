import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';

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
import {
	CommentNotFoundMSG,
	CommentCreationFailedMSG,
	CommentEditingFailedMSG,
	CommentDeletionFailedMSG,
	CommentCountFailedMsg,
} from './errors/msg';
import {
	AuthenticationError,
	BadRequestError,
	Conflict,
	NotFound,
} from '../../custom-errors/main';
import { NotValidId } from '../../utills/errors';
import { LoginFirst, NotValidIdMsg } from '../../utills/errors.msg';
import { UserNotFound } from '../auth/errors/cause';

export const getTaskComments = asyncHandler(
	async (
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
					next(new BadRequestError(NotValidIdMsg));
				default:
					next(err);
			}
		}
	}
);

export const getComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.params;
		try {
			const comment = await CommentServices.getComment(commentId);
			res.status(StatusCodes.OK).json({ data: comment });
		} catch (err: unknown) {
			switch (true) {
				case err instanceof NotValidId:
					next(new BadRequestError(NotValidIdMsg));
				case err instanceof CommentNotFound:
					next(new NotFound(CommentNotFoundMSG));
				default:
					next(err);
			}
		}
	}
);

export const createComment = asyncHandler(
	async (
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
					next(new AuthenticationError(LoginFirst));
				case err instanceof CommentCreationFailed:
					next(new Conflict(CommentCreationFailedMSG));

				case err instanceof CommentCountUpdateFailed:
					next(new Conflict(CommentCountFailedMsg));

				default:
					next(err);
			}
		}
	}
);

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
				next(new AuthenticationError(LoginFirst));
			case err instanceof NotValidId:
				next(new BadRequestError(NotValidIdMsg));
			case err instanceof CommentNotFound:
				next(new NotFound(CommentNotFoundMSG));

			case err instanceof CommentUpdateFailed:
				next(new Conflict(CommentEditingFailedMSG));
			default:
				next(err);
		}
	}
};

export const deleteComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
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
					next(new AuthenticationError(LoginFirst));
				case err instanceof NotValidId:
					next(new BadRequestError(NotValidIdMsg));
				case err instanceof CommentNotFound:
					next(new NotFound(CommentNotFoundMSG));

				case err instanceof CommentCountUpdateFailed:
					next(new Conflict(CommentCountFailedMsg));

				case err instanceof CommentDeletionFailed:
					next(new Conflict(CommentDeletionFailedMSG));
				default:
					next(err);
			}
		}
	}
);
