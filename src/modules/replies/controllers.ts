import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Reply from './models.js';
import { asyncHandler } from '../auth/middleware.js';
import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from 'src/setup/helpers.js';
import { isResourceOwner } from '../users/helpers.js';
import { createReplySchema, updateReplySchema } from './validation.js';
import { type TypedRequestBody } from 'zod-express-middleware';

export const getReplies = asyncHandler(
	async (req: Request, res: Response) => {
		const replies = await Reply.find({});
		res.status(StatusCodes.OK).json({ data: replies, count: replies.length });
	}
);

export const getReply = asyncHandler(async (req: Request, res: Response) => {
	const { replyId } = req.params;
	validateObjectIds([replyId]);
	const reply = await findResourceById(Reply, replyId);
	res.status(StatusCodes.OK).json({ data: reply });
});

export const getUserReplies = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const loggedInUser = await checkUser(user);

		const userReplies = await Reply.find({
			owner: loggedInUser.id,
		});

		res
			.status(StatusCodes.OK)
			.json({ data: userReplies, count: userReplies.length });
	}
);

export const getUserReply = asyncHandler(
	async (req: Request, res: Response) => {
		const { replyId } = req.params;
		const user = req.user;
		const loggedInUser = await checkUser(user);
		validateObjectIds([replyId]);

		const reply = await Reply.findOne({
			_id: replyId,
			owner: loggedInUser.id,
		});
		await checkResource(reply);
		res.status(StatusCodes.OK).json({ data: reply });
	}
);

export const createReply = asyncHandler(
	async (req: TypedRequestBody<typeof createReplySchema>, res: Response) => {
		const { comment, owner, parentReply, repliesOfReply, context } = req.body;
		const reply = await Reply.create({
			comment,
			owner,
			parentReply,
			repliesOfReply,
			context,
		});
		await checkResource(reply);
		res.status(StatusCodes.CREATED).json({ data: reply });
	}
);

export const editReply = asyncHandler(
	async (req: TypedRequestBody<typeof updateReplySchema>, res: Response) => {
		const { replyId } = req.params;
		const { context } = req.body;
		const user = req.user;
		const loggedInUser = await checkUser(user);

		const reply = await findResourceById(Reply, replyId);

		await isResourceOwner(loggedInUser.id, reply.owner.id);

		const updatedReply = await Reply.findByIdAndUpdate(
			reply.id,
			{ context },
			{ new: true }
		);

		await checkResource(updatedReply);
		res.status(StatusCodes.OK).json({ data: updatedReply });
	}
);

export const deleteReply = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const { replyId } = req.params;
		validateObjectIds([replyId]);
		const loggedInUser = await checkUser(user);

		const reply = await findResourceById(Reply, replyId);
		await isResourceOwner(loggedInUser.id, reply.owner.id);

		await Reply.findByIdAndDelete(reply.id);

		res.status(StatusCodes.OK).json({ msg: 'reply deleted successfully' });
	}
);
