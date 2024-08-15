import { NextFunction, Request, Response, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
	BadRequest,
	NotFound,
	UnAuthenticated,
} from '../../../custom-errors/main.js';
import Reply from './models.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../auth/middleware.js';
import { findResourceById } from 'src/setup/helpers.js';
import { isResourceOwner } from '../users/helpers.js';
import {
	createReplyValidation,
	updateReplyValidation,
} from './validation.js';
import { ReplySchema } from './models.js';
import { TypedRequestBody } from 'zod-express-middleware';
export const getReplies = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const replies = await Reply.find();
		res.status(StatusCodes.OK).json({ data: replies, count: replies.length });
	}
);

export const getReply = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const reply = await Reply.findById(id);
		if (!reply) {
			return next(new NotFound('no reply found with the given id'));
		}
		res.status(StatusCodes.OK).json({ data: reply });
	}
);

export const getUserReplies = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;

		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		const userReplies = await Reply.find({
			owner: user.id,
		});
		res
			.status(StatusCodes.OK)
			.json({ data: userReplies, count: userReplies.length });
	}
);

export const getUserReply = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const user = req.user;

		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const reply = await Reply.findOne({
			_id: id,
			owner: user.id,
		});
		if (!reply) {
			return next(new NotFound('no reply found with the given id'));
		}
		res.status(StatusCodes.OK).json({ data: reply });
	}
);

export const createReply: RequestHandler = asyncHandler(
	async (
		req: TypedRequestBody<typeof createReplyValidation>,
		res: Response,
		next: NextFunction
	) => {
		const { comment, owner, parentReply, repliesOfReply, context } = req.body;
		const reply = await Reply.create({
			comment,
			owner,
			parentReply,
			repliesOfReply,
			context,
		});
		res.status(StatusCodes.CREATED).json({ data: reply });
	}
);

export const editReply = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateReplyValidation>,
		res: Response,
		next: NextFunction
	) => {
		const { replyId } = req.params;
		const user = req.user;
		const { context } = req.body;
		if (!user?.id) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		const reply = await findResourceById(Reply, replyId);

		if (!isResourceOwner(user.id, reply.owner)) {
			return next(
				new UnAuthenticated('you are the not the owner of this resource')
			);
		}
		const replyToUpdate = await Reply.findByIdAndUpdate(
			reply.id,
			{ context, owner: user.id },
			{ new: true, runValidators: true }
		);

		if (!replyToUpdate) {
			return next(new NotFound('no reply found'));
		}
		res.status(StatusCodes.OK).json({ data: replyToUpdate });
	}
);
export const deleteReply = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const { replyId } = req.params;
		if (!user?.id) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		const reply = await findResourceById(Reply, replyId);
		if (!isResourceOwner(user.id, reply.owner.toString())) {
			return next(
				new UnAuthenticated('you are the not the owner of this resource')
			);
		}
		await Reply.findByIdAndDelete(reply.id);

		res.status(StatusCodes.OK).json({ msg: 'reply deleted successfully' });
	}
);
