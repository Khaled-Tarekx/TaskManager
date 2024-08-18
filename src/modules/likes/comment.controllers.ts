import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CommentLike } from './models.js';
import { asyncHandler } from '../auth/middleware.js';
import { createCommentLikeSchema } from './validation.js';

import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from '../../setup/helpers';
import type { TypedRequestBody } from 'zod-express-middleware';
import { isResourceOwner } from '../users/helpers.js';

export const getCommentLikes = asyncHandler(
	async (req: Request, res: Response) => {
		const { commentId } = req.params;
		validateObjectIds([commentId]);
		const commentLikes = await CommentLike.find({ reply: commentId });
		res
			.status(StatusCodes.OK)
			.json({ data: commentLikes, count: commentLikes.length });
	}
);

export const getCommentLike = asyncHandler(
	// is this even needed?
	async (req: Request, res: Response) => {
		const { likeId } = req.params;
		validateObjectIds([likeId]);

		const commentLike = await findResourceById(CommentLike, likeId);
		res.status(StatusCodes.OK).json({ data: commentLike });
	}
);

export const getUserCommentLike = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const loggedInUser = await checkUser(user);
		const userCommentLike = await CommentLike.findOne({
			owner: loggedInUser.id,
		});
		await checkResource(userCommentLike);
		res.status(StatusCodes.OK).json({ data: userCommentLike });
	}
);

export const createCommentLike = asyncHandler(
	async (
		req: TypedRequestBody<typeof createCommentLikeSchema>,
		res: Response
	) => {
		const user = req.user;
		const { commentId } = req.body;
		validateObjectIds([commentId]);

		const loggedInUser = await checkUser(user);

		const commentLike = CommentLike.create({
			owner: loggedInUser.id,
			comment: commentId,
		});
		await checkResource(commentLike);
		res.status(StatusCodes.CREATED).json({ data: commentLike });
	}
);

export const deleteCommentLike = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const { likeId } = req.params;
		validateObjectIds([likeId]);
		const loggedInUser = await checkUser(user);

		const commentLikeToDelete = await findResourceById(CommentLike, likeId);

		await isResourceOwner(loggedInUser.id, commentLikeToDelete.owner.id);
		await CommentLike.findByIdAndDelete(commentLikeToDelete.id);
		res.status(StatusCodes.OK).json({ msg: 'like deleted successfully' });
	}
);
