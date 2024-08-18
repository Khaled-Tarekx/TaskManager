import type { NextFunction, Response } from 'express';
import { comparePassword, createTokenFromUser } from './utillities.js';
import User from '../users/models.js';
import { StatusCodes } from 'http-status-codes';
import { CustomError, UnAuthenticated } from '../../../custom-errors/main.js';
import { asyncHandler } from './middleware.js';
import { createUserSchema, loginSchema } from './validation.js';
import type { TypedRequestBody } from 'zod-express-middleware';
import { checkResource } from '../../setup/helpers';

export const register = asyncHandler(
	async (req: TypedRequestBody<typeof createUserSchema>, res: Response) => {
		const { username, email, password, roles, position } = req.body;

		const user = await User.create({
			username,
			email,
			password,
			roles,
			position,
		});
		await checkResource(user);
		res.status(StatusCodes.CREATED).json({ data: user });
	}
);

export const login = asyncHandler(
	async (
		req: TypedRequestBody<typeof loginSchema>,
		res: Response,
		next: NextFunction
	) => {
		const { email, password } = req.body;
		try {
			const user = await User.findOne({ email });

			const validatedUser = await checkResource(user);
			const validatedPassword = await checkResource(validatedUser.password);

			const isCorrectPassword = await comparePassword(
				password,
				validatedPassword
			);
			if (!isCorrectPassword) {
				return next(new UnAuthenticated(`email or password is incorrect`));
			}
			const updatedUser = await User.findOneAndUpdate(
				{ email: validatedUser.email },
				{ isLoggedIn: true },
				{ new: true }
			);
			const validatedupdatedUser = await checkResource(updatedUser);

			const token = await createTokenFromUser(validatedupdatedUser);
			res.status(StatusCodes.OK).json({ token: token });
		} catch (err: any) {
			next(new CustomError(err.message, StatusCodes.BAD_REQUEST));
		}
	}
);
