import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware.js';

import { type TypedRequestBody } from 'zod-express-middleware';
import { updateUserSchema } from './validations.js';
import * as UserServices from './services.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
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
		const msg = await UserServices.deleteUser(user);
		res.status(StatusCodes.OK).json({ msg });
	}
);
