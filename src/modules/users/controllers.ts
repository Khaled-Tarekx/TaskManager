import { Forbidden } from '../../../custom-errors/main.js';
import User from './models.js';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware.js';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from '../../setup/helpers.js';
import { type TypedRequestBody } from 'zod-express-middleware';
import { updateUserSchema } from './validations.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
	const users = await User.find({});
	res.status(StatusCodes.OK).json({ data: users, count: users.length });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
	const { userId } = req.params;
	validateObjectIds([userId]);
	const user = await findResourceById(User, userId);
	res.status(StatusCodes.OK).json({ data: user });
});

export const updateUserInfo = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateUserSchema>,
		res: Response,
		next: NextFunction
	) => {
		const user = req.user;
		const { email, username } = req.body;
		const loggedInUser = await checkUser(user);

		try {
			const updatedUser = await User.findByIdAndUpdate(
				loggedInUser.id,
				{ email, username },
				{ new: true }
			);
			await checkResource(updatedUser);
			res.status(StatusCodes.OK).json({ data: updatedUser });
		} catch (err: any) {
			next(new Forbidden(err.message));
		}
	}
);

export const deleteUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;

		const loggedInUser = await checkUser(user);

		try {
			const userToDelete = await findResourceById(User, loggedInUser.id);

			await User.findByIdAndDelete(userToDelete.id);
		} catch (err: any) {
			next(new Forbidden(err.message));
		}

		res.status(StatusCodes.OK).json({
			message: 'User Deleted Successfully',
		});
	}
);
