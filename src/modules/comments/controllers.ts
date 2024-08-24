import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';

import type { TypedRequestBody } from 'zod-express-middleware';
import type { createCommentSchema, updateCommentSchema } from './validation';
import * as CommentServices from './services';
import { checkUser } from '../../utills/helpers';

type taskParam = { taskId: string };

export const getTaskComments = asyncHandler(
	async (req: Request<{}, {}, {}, taskParam>, res: Response) => {
		const { taskId } = req.query;
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

export const createComment = asyncHandler(
	async (
		req: TypedRequestBody<typeof createCommentSchema>,
		res: Response
	) => {
		const { taskId, context } = req.body;
		const user = req.user;
		checkUser(user);
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
	checkUser(user);
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
		checkUser(user);
		const { commentId } = req.params;
		const deletedComment = await CommentServices.deleteComment(
			user,
			commentId
		);

		res.status(StatusCodes.OK).json({ data: deletedComment });
	}
);
