import User, { UserSchema } from '../users/models';
import jwt from 'jsonwebtoken';
import {
	CustomError,
	NotFound,
	UnAuthenticated,
} from '../../custom-errors/main';
import { type AnyZodObject, ZodError } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from './middleware';
import { compare } from 'bcrypt';
import type { HydratedDocument } from 'mongoose';

const secret = process.env.SECRET_KEY;

export const createTokenFromUser = async (
	user: HydratedDocument<UserSchema>
) => {
	const tokenUser = await User.findOne({ email: user.email });

	if (!tokenUser) {
		throw new NotFound('User not found');
	}

	return jwt.sign({ id: tokenUser.id, roles: tokenUser.roles }, secret, {
		expiresIn: '1d',
	});
};

type zodSchema = {
	bodySchema?: AnyZodObject;
	querySchema?: AnyZodObject;
	paramsSchema?: AnyZodObject;
};

export const validateResource = ({
	bodySchema,
	querySchema,
	paramsSchema,
}: zodSchema) => {
	return asyncHandler(
		async (
			req: Request,
			_res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				if (bodySchema) {
					await bodySchema.parseAsync(req.body);
				}
				if (querySchema) {
					await querySchema.parseAsync(req.query);
				}
				if (paramsSchema) {
					await paramsSchema.parseAsync(req.params);
				}
				next();
			} catch (err: any) {
				if (err instanceof ZodError) {
					const errorMessages = err.issues.map((issue) => [
						issue.path,
						issue.message,
					]);
					next(new CustomError(errorMessages.join(', '), 422));
				} else {
					next(new CustomError(err.message, 422));
				}
			}
		}
	);
};

export const comparePassword = async (
	normalPassword: string,
	hashedPassword: string
): Promise<Boolean> => {
	try {
		return compare(normalPassword, hashedPassword);
	} catch (err: any) {
		throw new UnAuthenticated(err.message);
	}
};
