import { NextFunction, Request, Response } from 'express';
import { comparePassword, createTokenFromUser } from './utillities.js';
import User from '../users/models.js';
import { StatusCodes } from 'http-status-codes';
import {
	CustomError,
	NotFound,
	UnAuthenticated,
} from '../../../custom-errors/main.js';
import { asyncHandler } from './middleware.js';
import { createUserSchema, loginSchema } from './validation.js';
import { findOneResource } from 'src/setup/helpers.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
	const { username, email, password, roles, position }: createUserSchema =
		req.body;

	const user = await User.create({
		username,
		email,
		password,
		roles,
		position,
	});
	res.status(StatusCodes.CREATED).json({ data: user });
});

export const login = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password }: loginSchema = req.body;
		try {
			const user = await findOneResource(User, email);

			if (!(await comparePassword(password, user.password))) {
				return next(new UnAuthenticated(`email or password is incorrect`));
			}
			const updatedUser = await User.findOneAndUpdate(
				{ email: user.email },
				{ isLoggedIn: true },
				{ new: true }
			);
			if (!updatedUser) {
				return next(new NotFound(`user to update doesn't exist`));
			}

			const token = await createTokenFromUser(updatedUser);
			res.status(StatusCodes.OK).json({ token: token });
		} catch (err: any) {
			next(new CustomError(err.message, StatusCodes.BAD_REQUEST));
		}
	}
);
