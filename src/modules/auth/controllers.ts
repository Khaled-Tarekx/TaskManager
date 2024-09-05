import type { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createUserSchema, loginSchema, tokenSchema } from './validation';
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
	CustomError,
	NotFound,
} from '../../custom-errors/main';
import * as ErrorMsg from './errors/msg';
import { supabase } from './supabase';
export const register = async (
	req: TypedRequestBody<typeof createUserSchema>,
	res: Response,
	next: NextFunction
) => {
	const { username, email, password, position } = req.body;
	try {
		const user = await AuthServices.createUser({
			username,
			email,
			password,
			position,
		});
		res.status(StatusCodes.CREATED).json({ data: user });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof RegistrationError:
				next(new AuthenticationError(ErrorMsg.UserRegistraionFailed));
			case err instanceof PasswordHashingError:
				next(new AuthenticationError(ErrorMsg.IncorrectPassword));

			default:
				next(err);
		}
	}
};

export const login = async (
	req: TypedRequestBody<typeof loginSchema>,
	res: Response,
	next: NextFunction
) => {
	const { email, password } = req.body;
	try {
		// const data = await AuthServices.login({
		// 	email,
		// 	password,
		// });
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			return next(new AuthenticationError(error.message));
		}
		res.status(StatusCodes.OK).json(data);
	} catch (err: unknown) {
		switch (true) {
			case err instanceof LoginError:
				next(new AuthenticationError(ErrorMsg.LoginError));
			case err instanceof UserNotFound:
				next(new NotFound(ErrorMsg.UserNotFound));
			case err instanceof TokenCreationFailed:
				next(new AuthenticationError(ErrorMsg.TokenGenerationError));
			default:
				next(err);
		}
	}
};

export const refreshToken = async (
	req: TypedRequestBody<typeof tokenSchema>,
	res: Response,
	next: NextFunction
) => {
	const { refreshToken } = req.body;
	try {
		const data = await AuthServices.token(refreshToken);

		res.status(StatusCodes.CREATED).json(data);
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(ErrorMsg.UserNotFound));
			case err instanceof RefreshTokenNotFound:
				next(new AuthenticationError(ErrorMsg.TokenNotFound));
			case err instanceof TokenCreationFailed:
				next(new AuthenticationError(ErrorMsg.TokenGenerationError));
			case err instanceof TokenVerificationFailed:
				next(new AuthenticationError(ErrorMsg.TokenVerificationFailed));
			default:
				next(err);
		}
	}
};

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
			case err instanceof PasswordHashingError:
				return next(new AuthenticationError(ErrorMsg.IncorrectPassword));
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
			case err instanceof LoginError:
				next(new AuthenticationError(ErrorMsg.LoginError));
			case err instanceof UserNotFound:
				next(new NotFound(ErrorMsg.UserNotFound));
			case err instanceof TokenCreationFailed:
				next(new AuthenticationError(ErrorMsg.TokenGenerationError));
			default:
				next(err);
		}
	}
};

export const refreshSession = async (
	req: TypedRequestBody<typeof tokenSchema>,
	res: Response,
	next: NextFunction
) => {
	const { refreshToken } = req.body;
	try {
		const data = await AuthServices.refreshSession(refreshToken);

		res.status(StatusCodes.CREATED).json(data);
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(ErrorMsg.UserNotFound));
			case err instanceof RefreshTokenNotFound:
				next(new AuthenticationError(ErrorMsg.TokenNotFound));
			case err instanceof TokenCreationFailed:
				next(new AuthenticationError(ErrorMsg.TokenGenerationError));
			case err instanceof TokenVerificationFailed:
				next(new AuthenticationError(ErrorMsg.TokenVerificationFailed));
			default:
				next(err);
		}
	}
};
