import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createCommentLikeSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as CommentLikeServices from './comment.services';
import { checkUser } from '../../utills/helpers';
import {
	LikeCountUpdateFailed,
	LikeCreationFailed,
	LikeNotFound,
	UnLikeFailed,
} from './errors/cause';

import { UserNotFound } from '../auth/errors/cause';
import {
	AuthenticationError,
	BadRequestError,
	Conflict,
	NotFound,
} from '../../custom-errors/main';
import { NotResourceOwner, NotValidId } from '../../utills/errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as ErrorMsg from './errors/msg';

export const getCommentLikes = async (req: Request, res: Response) => {
	const { commentId } = req.params;
	const commentLikes = await CommentLikeServices.getCommentLikes(commentId);
	res
		.status(StatusCodes.OK)
		.json({ data: commentLikes, count: commentLikes.length });
};

export const getUserCommentLike = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user;
		checkUser(user);
		const userCommentLike = await CommentLikeServices.getUserCommentLike(
			user
		);
		res.status(StatusCodes.OK).json({ data: userCommentLike });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof LikeNotFound:
				return next(new NotFound(ErrorMsg.LikeCreationFailed));
			default:
				return next(err);
		}
	}
};

export const createCommentLike = async (
	req: TypedRequestBody<typeof createCommentLikeSchema>,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user;
		checkUser(user);

		const { commentId } = req.body;
		const commentLike = await CommentLikeServices.createCommentLike(
			{ commentId },
			user
		);
		res.status(StatusCodes.CREATED).json({ data: commentLike });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof LikeCountUpdateFailed:
				return next(new NotFound(ErrorMsg.ResourceLikeCountFailed));
			case err instanceof LikeCreationFailed:
				return next(new Conflict(ErrorMsg.LikeCreationFailed));
			default:
				return next(err);
		}
	}
};

export const deleteCommentLike = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user;
		checkUser(user);
		const { likeId } = req.params;
		const deletedCommentLike = await CommentLikeServices.deleteCommentLike(
			likeId,
			user
		);

		res.status(StatusCodes.OK).json({ data: deletedCommentLike });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof LikeCountUpdateFailed:
				return next(new NotFound(ErrorMsg.ResourceLikeCountFailed));
			case err instanceof LikeCreationFailed:
				return next(new Conflict(ErrorMsg.LikeCreationFailed));
			case err instanceof UnLikeFailed:
				return next(new Conflict(ErrorMsg.UnlikeFailed));
			case err instanceof NotValidId:
				return next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof NotResourceOwner:
				return next(new AuthenticationError(GlobalErrorMsg.NotResourceOwner));

			default:
				return next(err);
		}
	}
};
