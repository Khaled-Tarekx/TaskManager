import type { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createUserSchema, loginSchema } from './validation';
import type { TypedRequestBody } from 'zod-express-middleware';
import * as AuthServices from './services';
import {
	LoginError,
	PasswordHashingError,
	RegistrationError,
	TokenCreationFailed,
	UserNotFound,
} from './errors/cause';
import { AuthenticationError, NotFound } from '../../custom-errors/main';
import * as ErrorMsg from './errors/msg';

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
		const token = await AuthServices.login({
			email,
			password,
		});

		res.status(StatusCodes.CREATED).json({ token });
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
