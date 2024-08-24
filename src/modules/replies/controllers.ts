import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';

import { createReplySchema, updateReplySchema } from './validation';
import { type TypedRequestBody } from 'zod-express-middleware';
import * as ReplyServices from './services';
import { checkUser } from '../../utills/helpers';

export const getReplies = asyncHandler(
	async (_req: Request, res: Response) => {
		const replies = await ReplyServices.getReplies();

		res.status(StatusCodes.OK).json({ data: replies, count: replies.length });
	}
);

export const getCommentReplies = asyncHandler(
	async (req: Request, res: Response) => {
		const { commentId } = req.params;
		const replies = await ReplyServices.getCommentReplies(commentId);

		res.status(StatusCodes.OK).json({ data: replies, count: replies.length });
	}
);

export const getReply = asyncHandler(async (req: Request, res: Response) => {
	const { replyId } = req.params;
	const reply = await ReplyServices.getReply(replyId);
	res.status(StatusCodes.OK).json({ data: reply });
});

export const createReply = asyncHandler(
	async (req: TypedRequestBody<typeof createReplySchema>, res: Response) => {
		const { commentId, parentReply, repliesOfReply, context } = req.body;
		const user = req.user;
		checkUser(user);

		const reply = await ReplyServices.createReply(
			{ commentId, parentReply, repliesOfReply, context },
			user
		);

		res.status(StatusCodes.CREATED).json({ data: reply });
	}
);

export const editReply = asyncHandler(
	async (req: TypedRequestBody<typeof updateReplySchema>, res: Response) => {
		const { replyId } = req.params;
		const { context } = req.body;
		const user = req.user;
		checkUser(user);

		const editedReply = await ReplyServices.editReply(
			{ context },
			replyId,
			user
		);

		res.status(StatusCodes.OK).json({ data: editedReply });
	}
);

export const deleteReply = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		checkUser(user);
		const { replyId } = req.params;
		const deletedReply = await ReplyServices.deleteReply(user, replyId);
		res.status(StatusCodes.OK).json({ data: deletedReply });
	}
);
