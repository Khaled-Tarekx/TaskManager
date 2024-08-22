import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';
import { createReplyLikeSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as ReplyLikeServices from './reply.services';
import { ReplyLike } from './models';

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
	async (req: Request, res: Response) => {
		const { likeId } = req.params;
		const replyLike = await ReplyLikeServices.getReplyLike(likeId);
		res.status(StatusCodes.OK).json({ data: replyLike });
	}
);

export const getUserReplyLike = asyncHandler(
	async (req: Request, res: Response) => {
		const { replyId } = req.params;
		const user = req.user;
		const userReplyLike = await ReplyLikeServices.getUserReplyLike(
			user,
			replyId
		);
		res.status(StatusCodes.OK).json({ data: userReplyLike });
	}
);

export const createReplyLike = asyncHandler(
	async (
		req: TypedRequestBody<typeof createReplyLikeSchema>,
		res: Response
	) => {
		const user = req.user;
		const { replyId } = req.body;
		const replyLike = await ReplyLikeServices.createReplyLike(
			{ replyId },
			user
		);
		res.status(StatusCodes.CREATED).json({ data: replyLike });
	}
);

export const deleteReplyLike = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const { likeId } = req.params;
		const msg = await ReplyLikeServices.deleteReplyLike(likeId, user);

		res.status(StatusCodes.OK).json({ msg });
	}
);
