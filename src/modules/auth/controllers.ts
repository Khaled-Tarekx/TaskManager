import type { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
	changePasswordSchema,
	createUserSchema,
	loginSchema,
	resetPasswordSchema,
	refreshTokenSchema,
} from './validation';
import type { TypedRequestBody } from 'zod-express-middleware';
import * as AuthServices from './services';
import {
	LoginError,
	PasswordHashingError,
	RefreshTokenNotFound,
	RegistrationError,
	TokenCreationFailed,
	TokenVerificationFailed,
	UserNotFound,
} from './errors/cause';
import {
	AuthenticationError,
	Conflict,
	NotFound,
} from '../../custom-errors/main';
import * as ErrorMsg from './errors/msg';
import * as UserErrorMsg from '.././users/errors/msg';

import { supabase } from './supabase';
import { UserUpdatingFailed } from '../users/errors/cause';
import { AuthError } from '@supabase/supabase-js';

export const registerUser = async (
	req: TypedRequestBody<typeof createUserSchema>,
	res: Response,
	next: NextFunction
) => {
	const { username, email, password, position } = req.body;
	try {
		const user = await AuthServices.registerUser({
			username,
			email,
			password,
			position,
		});
		res.status(StatusCodes.CREATED).json({ data: user });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof RegistrationError:
				return next(new AuthenticationError(ErrorMsg.UserRegistraionFailed));
			case err instanceof AuthError:
				return next(new AuthenticationError(err.message));
			default:
				return next(err);
		}
	}
};

export const signInUser = async (
	req: TypedRequestBody<typeof loginSchema>,
	res: Response,
	next: NextFunction
) => {
	const { email, password } = req.body;
	try {
		const data = await AuthServices.loginUser({ email, password });

		res.status(StatusCodes.OK).json(data);
	} catch (err: unknown) {
		switch (true) {
			case err instanceof AuthError:
				return next(new NotFound(err.message));
			case err instanceof UserUpdatingFailed:
				return next(new Conflict(UserErrorMsg.UserUpdatingFailed));
			default:
				return next(err);
		}
	}
};

export const refreshSession = async (
	req: TypedRequestBody<typeof refreshTokenSchema>,
	res: Response,
	next: NextFunction
) => {
	const { refresh_token } = req.body;
	try {
		const data = await AuthServices.refreshSession({ refresh_token });

		res.status(StatusCodes.CREATED).json(data);
	} catch (err: unknown) {
		switch (true) {
			case err instanceof AuthError:
				return next(new AuthenticationError(err.message));
			default:
				return next(err);
		}
	}
};

export const resetPassword = async (
	req: TypedRequestBody<typeof resetPasswordSchema>,
	res: Response,
	next: NextFunction
) => {
	const { email } = req.body;
	try {
		const data = await AuthServices.resetPassword({ email });

		res.status(StatusCodes.CREATED).json(data);
	} catch (err: unknown) {
		switch (true) {
			case err instanceof AuthError:
				return next(new AuthenticationError(err.message));
			default:
				return next(err);
		}
	}
};

export const changePassword = async (
	req: TypedRequestBody<typeof changePasswordSchema>,
	res: Response,
	next: NextFunction
) => {
	const { oldPassword, password } = req.body;
	try {
		const data = await AuthServices.changePassword({ oldPassword, password });

		res.status(StatusCodes.CREATED).json(data);
	} catch (err: unknown) {
		switch (true) {
			case err instanceof AuthError:
				return next(new AuthenticationError(err.message));
			default:
				return next(err);
		}
	}
};
