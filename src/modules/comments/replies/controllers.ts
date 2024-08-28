import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../auth/middleware';

import { createReplySchema, updateReplySchema } from './validation';
import { type TypedRequestBody } from 'zod-express-middleware';
import * as ReplyServices from './services';
import { checkUser } from '../../../utills/helpers';
import {
	ReplyCountUpdateFailed,
	ReplyCreationFailed,
	ReplyDeletionFailed,
	ReplyNotFound,
	ReplyUpdateFailed,
} from './errors/cause';
import {
	ReplyCountFailedMsg,
	ReplyCreationFailedMSG,
	ReplyDeletionFailedMSG,
	ReplyNotFoundMSG,
	ReplyEditingFailedMSG,
} from './errors/msg';
import {
	AuthenticationError,
	BadRequestError,
	Conflict,
	NotFound,
} from '../../../custom-errors/main';
import { UserNotFound } from '../../auth/errors/cause';
import { LoginFirst, NotValidIdMsg } from '../../../utills/errors.msg';
import { NotValidId } from '../../../utills/errors';

export const getReplies = asyncHandler(
	async (_req: Request, res: Response) => {
		const replies = await ReplyServices.getReplies();

		res.status(StatusCodes.OK).json({ data: replies, count: replies.length });
	}
);

export const getCommentReplies = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.query;
		const replies = await ReplyServices.getCommentReplies(commentId);

		res.status(StatusCodes.OK).json({ data: replies, count: replies.length });
	}
);

export const getReply = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { replyId } = req.params;
		try {
			const reply = await ReplyServices.getReply(replyId);
			res.status(StatusCodes.OK).json({ data: reply });
		} catch (err: unknown) {
			if (err instanceof ReplyNotFound) {
				next(new NotFound(ReplyNotFoundMSG));
			} else {
				next(err);
			}
		}
	}
);

export const createReply = asyncHandler(
	async (
		req: TypedRequestBody<typeof createReplySchema>,
		res: Response,
		next: NextFunction
	) => {
		const { commentId, parentReply, repliesOfReply, context } = req.body;
		try {
			const user = req.user;
			checkUser(user);

			const reply = await ReplyServices.createReply(
				{ commentId, parentReply, repliesOfReply, context },
				user
			);

			res.status(StatusCodes.CREATED).json({ data: reply });
		} catch (err: unknown) {
			switch (true) {
				case err instanceof UserNotFound:
					next(new AuthenticationError(LoginFirst));
				case err instanceof ReplyCreationFailed:
					next(new Conflict(ReplyCreationFailedMSG));

				case err instanceof ReplyCountUpdateFailed:
					next(new Conflict(ReplyCountFailedMsg));

				default:
					next(err);
			}
		}
	}
);

export const editReply = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateReplySchema>,
		res: Response,
		next: NextFunction
	) => {
		const { replyId } = req.params;
		const { context } = req.body;
		try {
			const user = req.user;
			checkUser(user);

			const editedReply = await ReplyServices.editReply(
				{ context },
				replyId,
				user
			);

			res.status(StatusCodes.OK).json({ data: editedReply });
		} catch (err: unknown) {
			switch (true) {
				case err instanceof UserNotFound:
					next(new AuthenticationError(LoginFirst));
				case err instanceof NotValidId:
					next(new BadRequestError(NotValidIdMsg));
				case err instanceof ReplyNotFound:
					next(new NotFound(ReplyNotFoundMSG));

				case err instanceof ReplyUpdateFailed:
					next(new Conflict(ReplyEditingFailedMSG));
				default:
					next(err);
			}
		}
	}
);

export const deleteReply = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user;
			checkUser(user);
			const { replyId } = req.params;
			const deletedReply = await ReplyServices.deleteReply(user, replyId);
			res.status(StatusCodes.OK).json({ data: deletedReply });
		} catch (err: unknown) {
			switch (true) {
				case err instanceof UserNotFound:
					next(new AuthenticationError(LoginFirst));
				case err instanceof NotValidId:
					next(new BadRequestError(NotValidIdMsg));
				case err instanceof ReplyNotFound:
					next(new NotFound(ReplyNotFoundMSG));

				case err instanceof ReplyCountUpdateFailed:
					next(new Conflict(ReplyCountFailedMsg));

				case err instanceof ReplyDeletionFailed:
					next(new Conflict(ReplyDeletionFailedMSG));
				default:
					next(err);
			}
		}
	}
);
