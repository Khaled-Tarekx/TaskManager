import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ReplyLike } from './models.js';
import { asyncHandler } from '../auth/middleware.js';
import { createReplyLikeSchema } from './validation.js';

import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from '../../setup/helpers';
import type { TypedRequestBody } from 'zod-express-middleware';
import { isResourceOwner } from '../users/helpers.js';

export const getReplyLikes = asyncHandler(
	async (req: Request, res: Response) => {
		const { replyId } = req.params;
		validateObjectIds([replyId]);
		const replyLikes = await ReplyLike.find({ reply: replyId });
		res
			.status(StatusCodes.OK)
			.json({ data: replyLikes, count: replyLikes.length });
	}
);

export const getReplyLike = asyncHandler(
	// is this even needed?
	async (req: Request, res: Response) => {
		const { likeId } = req.params;
		validateObjectIds([likeId]);

		const replyLike = await findResourceById(ReplyLike, likeId);
		res.status(StatusCodes.OK).json({ data: replyLike });
	}
);

export const getUserReplyLike = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const loggedInUser = await checkUser(user);
		const userReplyLike = await ReplyLike.findOne({
			owner: loggedInUser.id,
		});
		await checkResource(userReplyLike);
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
		validateObjectIds([replyId]);

		const loggedInUser = await checkUser(user);

		const replyLike = ReplyLike.create({
			owner: loggedInUser.id,
			reply: replyId,
		});
		await checkResource(replyLike);
		res.status(StatusCodes.CREATED).json({ data: replyLike });
	}
);

export const deleteReplyLike = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const { likeId } = req.params;
		validateObjectIds([likeId]);
		const loggedInUser = await checkUser(user);

		const replyLikeToDelete = await findResourceById(ReplyLike, likeId);

		await isResourceOwner(loggedInUser.id, replyLikeToDelete.owner.id);
		await ReplyLike.findByIdAndDelete(replyLikeToDelete.id);
		res.status(StatusCodes.OK).json({ msg: 'like deleted successfully' });
	}
);
