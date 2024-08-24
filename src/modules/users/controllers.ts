import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';

import { type TypedRequestBody } from 'zod-express-middleware';
import { updateUserSchema } from './validations';
import * as UserServices from './services';
import { checkUser } from '../../utills/helpers';

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
	const users = await UserServices.getUsers();
	res.status(StatusCodes.OK).json({ data: users, count: users.length });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
	const { userId } = req.params;
	const user = await UserServices.getUser(userId);
	res.status(StatusCodes.OK).json({ data: user });
});

export const updateUserInfo = asyncHandler(
	async (req: TypedRequestBody<typeof updateUserSchema>, res: Response) => {
		const user = req.user;
		checkUser(user);
		const { email, username } = req.body;
		const updatedUser = await UserServices.updateUserInfo(
			{ email, username },
			user
		);

		res.status(StatusCodes.OK).json({ data: updatedUser });
	}
);

export const deleteUser = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		checkUser(user);
		const deletedUser = await UserServices.deleteUser(user);
		res.status(StatusCodes.OK).json({ data: deletedUser });
	}
);

export const getUserReplies = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		checkUser(user);
		const userReplies = await UserServices.getUserReplies(user);

		res
			.status(StatusCodes.OK)
			.json({ data: userReplies, count: userReplies.length });
	}
);

export const getUserReply = asyncHandler(
	async (req: Request, res: Response) => {
		const { replyId } = req.params;
		const user = req.user;
		checkUser(user);
		const userReply = await UserServices.getUserReply(replyId, user);
		res.status(StatusCodes.OK).json({ data: userReply });
	}
);

export const getUserComments = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		checkUser(user);
		const userComments = await UserServices.getUserComments(user);

		res
			.status(StatusCodes.OK)
			.json({ data: userComments, count: userComments.length });
	}
);

export const getUserComment = asyncHandler(
	async (req: Request, res: Response) => {
		const { commentId } = req.params;
		const user = req.user;
		checkUser(user);
		const userComment = await UserServices.getUserComment(commentId, user);
		res.status(StatusCodes.OK).json({ data: userComment });
	}
);
