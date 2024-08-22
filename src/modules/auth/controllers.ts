import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from './middleware';
import { createUserSchema, loginSchema } from './validation';
import type { TypedRequestBody } from 'zod-express-middleware';
import * as AuthServices from './services';

export const register = asyncHandler(
	async (req: TypedRequestBody<typeof createUserSchema>, res: Response) => {
		const { username, email, password, position } = req.body;

		const user = await AuthServices.createUser({
			username,
			email,
			password,
			position,
		});
		res.status(StatusCodes.CREATED).json({ data: user });
	}
);

export const login = asyncHandler(
	async (req: TypedRequestBody<typeof loginSchema>, res: Response) => {
		const { email, password } = req.body;
		const token = await AuthServices.login({
			email,
			password,
		});

		res.status(StatusCodes.CREATED).json({ data: token });
	}
);
console.log('tata');
