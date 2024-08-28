import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';
import { createCommentLikeSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as CommentLikeServices from './comment.services';
import { checkUser } from '../../utills/helpers';
import {
	LikeCountUpdateFailed,
	LikeCreationFailed,
	LikeNotFound,
	UnLikeFailed,
} from './errors';
import { UserNotFound } from '../auth/errors/cause';
import {
	AuthenticationError,
	BadRequestError,
	Conflict,
	NotFound,
} from '../../custom-errors/main';
import { NotResourceOwner, NotValidId } from '../../utills/errors';

export const getCommentLikes = asyncHandler(
	async (req: Request, res: Response) => {
		const { commentId } = req.params;
		const commentLikes = await CommentLikeServices.getCommentLikes(commentId);
		res
			.status(StatusCodes.OK)
			.json({ data: commentLikes, count: commentLikes.length });
	}
);

export const getUserCommentLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
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
					next(new AuthenticationError('you have to log in first'));
				case err instanceof LikeNotFound:
					next(new NotFound('you havent liked this reply'));
				default:
					next(err);
			}
		}
	}
);

export const createCommentLike = asyncHandler(
	async (
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
					next(new AuthenticationError('you have to log in first'));
				case err instanceof LikeCountUpdateFailed:
					next(new NotFound('couldnt update the like count on the reply'));
				case err instanceof LikeCreationFailed:
					next(new Conflict('couldnt add your like to the reply'));
				default:
					next(err);
			}
		}
	}
);

export const deleteCommentLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
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
					next(new AuthenticationError('you have to log in first'));
				case err instanceof LikeCountUpdateFailed:
					next(new NotFound('couldn’t update the like count on the reply'));
				case err instanceof LikeCreationFailed:
					next(new Conflict('couldn’t add your like to the reply'));
				case err instanceof UnLikeFailed:
					next(new Conflict('maybe you should like first? to unlike'));
				case err instanceof NotValidId:
					next(new BadRequestError('Invalid Object Id'));
				case err instanceof NotResourceOwner:
					next(
						new AuthenticationError('you are not the owner of the resource')
					);

				default:
					next(err);
			}
		}
	}
);
