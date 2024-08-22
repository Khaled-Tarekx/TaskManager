import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';

import type { TypedRequestBody } from 'zod-express-middleware';
import type { createCommentSchema, updateCommentSchema } from './validation';
import * as CommentServices from './services';

export const getTaskComments = asyncHandler(
	async (req: Request, res: Response) => {
		const { taskId } = req.params;
		const taskComments = await CommentServices.getTaskComments(taskId);

		res
			.status(StatusCodes.OK)
			.json({ data: taskComments, count: taskComments.length });
	}
);

export const getComment = asyncHandler(
	async (req: Request, res: Response) => {
		const { commentId } = req.params;
		const comment = await CommentServices.getComment(commentId);
		res.status(StatusCodes.OK).json({ data: comment });
	}
);

export const getUserComments = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;

		const userComments = await CommentServices.getUserComments(user);

		res
			.status(StatusCodes.OK)
			.json({ data: userComments, count: userComments.length });
	}
);

export const getUserComment = asyncHandler(
	async (req: Request, res: Response) => {
		const { commentId } = req.params;
		const user = req.user;
		const userComment = await CommentServices.getUserComment(commentId, user);
		res.status(StatusCodes.OK).json({ data: userComment });
	}
);

export const createComment = asyncHandler(
	async (
		req: TypedRequestBody<typeof createCommentSchema>,
		res: Response
	) => {
		const { taskId, context } = req.body;
		const user = req.user;
		const comment = await CommentServices.createComment(
			{ taskId, context },
			user
		);

		res.status(StatusCodes.CREATED).json({ data: comment });
	}
);

export const editComment = async (
	req: TypedRequestBody<typeof updateCommentSchema>,
	res: Response
) => {
	const { commentId } = req.params;
	const user = req.user;
	const { context } = req.body;
	const comment = await CommentServices.editComment(
		{ context },
		commentId,
		user
	);

	res.status(StatusCodes.OK).json({ data: comment });
};

export const deleteComment = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const { commentId } = req.params;
		const msg = await CommentServices.deleteComment(user, commentId);

		res.status(StatusCodes.OK).json({ msg });
	}
);
