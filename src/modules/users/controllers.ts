import {
	NotFound,
	BadRequest,
	UnAuthenticated,
	CustomError,
} from '../../../custom-errors/main.js';
import User from './models.js';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { asyncHandler } from '../auth/middleware.js';
import { isResourceOwner } from './helpers.js';
import { findResourceById } from '../../setup/helpers.js';
import { TypedRequestBody } from 'zod-express-middleware';
import { updateUserSchema } from './validations.js';

export const getUsers = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const users = await User.find({});
		res.status(StatusCodes.OK).json({ data: users, count: users.length });
	}
);

export const getUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}

		const user = await User.findById(id);

		if (!user) return next(new NotFound(`no user found`));
		res.status(StatusCodes.OK).json({ data: user });
	}
);

export const updateUserInfo = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateUserSchema>,
		res: Response,
		next: NextFunction
	) => {
		const user = req.user;
		const { userId } = req.params;
		const { email, username } = req.body;
		if (!user?.id) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		if (!isResourceOwner(user.id, userId)) {
			return next(new NotFound(`you are not the owner of the resource`));
		}

		try {
			const user = await findResourceById(User, userId);
			const updatedUser = await User.findByIdAndUpdate(
				user.id,
				{
					email: email,
					username: username,
				},
				{ new: true, context: 'query' }
			);

			if (!updatedUser)
				return next(new NotFound(`no user found with the given id`));
			res.status(StatusCodes.OK).json({ data: updatedUser });
		} catch (err: any) {
			next(new CustomError(err.message, StatusCodes.FORBIDDEN));
		}
	}
);

export const deleteUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user?.id) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const { userId } = req.params;

		if (!isResourceOwner(user.id, userId)) {
			return next(new NotFound(`you are not the owner of the resource`));
		}

		try {
			const user = await findResourceById(User, userId);

			await User.findByIdAndDelete(user.id);
		} catch (err: any) {
			next(new NotFound(err.message));
		}

		res.status(StatusCodes.OK).json({
			message: 'User Deleted Successfully',
		});
	}
);
