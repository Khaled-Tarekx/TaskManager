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
} from './errors/cause';
import {
	AuthenticationError,
	BadRequestError,
	Conflict,
	NotFound,
} from '../../custom-errors/main';
import { NotResourceOwner, NotValidId } from '../../utills/errors/cause';
import { UserNotFound } from '../auth/errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as ErrorMsg from './errors/msg';

export const getReplyLikes = async (req: Request, res: Response) => {
	const { replyId } = req.params;
	const replyLikes = await ReplyLikeServices.getReplyLikes(replyId);
	res
		.status(StatusCodes.OK)
		.json({ data: replyLikes, count: replyLikes.length });
};

export const getReplyLike = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { likeId } = req.params;
	try {
		const replyLike = await ReplyLikeServices.getReplyLike(likeId);
		res.status(StatusCodes.OK).json({ data: replyLike });
	} catch (err: unknown) {
		if (err instanceof LikeNotFound) {
			next(new NotFound(ErrorMsg.LikeNotFound));
		} else {
			next(err);
		}
	}
};

export const getUserReplyLike = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
			case err instanceof UserNotFound:
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof LikeNotFound:
				next(new NotFound(ErrorMsg.LikeNotFound));
			default:
				next(err);
		}
	}
};

export const createReplyLike = async (
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
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof LikeCountUpdateFailed:
				next(new NotFound(ErrorMsg.ResourceLikeCountFailed));
			case err instanceof LikeCreationFailed:
				next(new Conflict(ErrorMsg.LikeCreationFailed));
			default:
				next(err);
		}
	}
};

export const deleteReplyLike = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
				next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof LikeCountUpdateFailed:
				next(new NotFound(ErrorMsg.ResourceLikeCountFailed));
			case err instanceof LikeCreationFailed:
				next(new Conflict(ErrorMsg.LikeCreationFailed));
			case err instanceof UnLikeFailed:
				next(new Conflict(ErrorMsg.UnlikeFailed));
			case err instanceof NotValidId:
				next(new BadRequestError(GlobalErrorMsg.NotValidId));
			case err instanceof NotResourceOwner:
				next(new AuthenticationError(GlobalErrorMsg.NotResourceOwner));

			default:
				next(err);
		}
	}
};
