import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';
import { createReplyLikeSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as ReplyLikeServices from './reply.services';
import { checkResource, checkUser } from '../../utills/helpers';
import {
	LikeCountUpdateFailed,
	LikeCreationFailed,
	LikeNotFound,
	UnLikeFailed,
} from './errors';
import {
	AuthenticationError,
	BadRequestError,
	Conflict,
	NotFound,
} from '../../custom-errors/main';
import { NotResourceOwner, NotValidId } from '../../utills/errors';
import { UserNotFound } from '../auth/errors/cause';

export const getReplyLikes = asyncHandler(
	async (req: Request, res: Response) => {
		const { replyId } = req.params;
		const replyLikes = await ReplyLikeServices.getReplyLikes(replyId);
		res
			.status(StatusCodes.OK)
			.json({ data: replyLikes, count: replyLikes.length });
	}
);

export const getReplyLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { likeId } = req.params;
		try {
			const replyLike = await ReplyLikeServices.getReplyLike(likeId);
			res.status(StatusCodes.OK).json({ data: replyLike });
		} catch (err: unknown) {
			if (err instanceof LikeNotFound) {
				next(new NotFound('you havent liked this reply'));
			} else {
				next(err);
			}
		}
	}
);

export const getUserReplyLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { replyId } = req.params;
		try {
			const user = req.user;
			checkUser(user);
			const userReplyLike = await ReplyLikeServices.getUserReplyLike(
				user,
				replyId
			);
			res.status(StatusCodes.OK).json({ data: userReplyLike });
		} catch (err: unknown) {
			switch (true) {
				case err instanceof LikeNotFound:
					next(new NotFound('you havent liked this reply'));
				case err instanceof UserNotFound:
					next(new AuthenticationError('you have to log in first'));
				default:
					next(err);
			}
		}
	}
);

export const createReplyLike = asyncHandler(
	async (
		req: TypedRequestBody<typeof createReplyLikeSchema>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const user = req.user;
			checkUser(user);
			const { replyId } = req.body;
			const replyLike = await ReplyLikeServices.createReplyLike(
				{ replyId },
				user
			);
			res.status(StatusCodes.CREATED).json({ data: replyLike });

			return checkResource;
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

export const deleteReplyLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user;
			checkUser(user);
			const { likeId } = req.params;
			const deletedReplyLike = await ReplyLikeServices.deleteReplyLike(
				likeId,
				user
			);

			res.status(StatusCodes.OK).json({ data: deletedReplyLike });
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
