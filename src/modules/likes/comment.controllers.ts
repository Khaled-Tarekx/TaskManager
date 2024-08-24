import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';
import { createCommentLikeSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as CommentLikeServices from './comment.services';
import { checkUser } from '../../utills/helpers';

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
	async (req: Request, res: Response) => {
		const user = req.user;
		checkUser(user);
		const userCommentLike = await CommentLikeServices.getUserCommentLike(
			user
		);
		res.status(StatusCodes.OK).json({ data: userCommentLike });
	}
);

export const createCommentLike = asyncHandler(
	async (
		req: TypedRequestBody<typeof createCommentLikeSchema>,
		res: Response
	) => {
		const user = req.user;
		checkUser(user);

		const { commentId } = req.body;
		const commentLike = await CommentLikeServices.createCommentLike(
			{ commentId },
			user
		);
		res.status(StatusCodes.CREATED).json({ data: commentLike });
	}
);

export const deleteCommentLike = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		checkUser(user);
		const { likeId } = req.params;
		const deletedCommentLike = await CommentLikeServices.deleteCommentLike(
			likeId,
			user
		);

		res.status(StatusCodes.OK).json({ data: deletedCommentLike });
	}
);
