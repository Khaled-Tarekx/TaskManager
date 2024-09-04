import User, { UserSchema } from '../users/models';
import jwt from 'jsonwebtoken';
import { CustomError } from '../../custom-errors/main';
import { type AnyZodObject, ZodError } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from './middleware';
import { compare, hash } from 'bcrypt';
import type { HydratedDocument, InferRawDocType } from 'mongoose';
import {
	PasswordComparisionError,
	PasswordHashingError,
	UserNotFound,
} from './errors/cause';

export const createTokenFromUser = async (
	user: InferRawDocType<UserSchema>,
	secret: string,
	expires?: string
) => {
	const tokenUser = await User.findOne({ email: user.email });

	if (!tokenUser) {
		throw UserNotFound;
	}

	return jwt.sign({ id: tokenUser._id, roles: tokenUser.roles }, secret, {
		expiresIn: expires,
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
					return next(new CustomError(errorMessages.join(', '), 422));
				} else {
					return next(new CustomError(err.message, 422));
				}
			}
		}
	);
};

export const comparePassword = async (
	normalPassword: string,
	hashedPassword: string | undefined
): Promise<Boolean> => {
	if (!hashedPassword) {
		throw new PasswordComparisionError(
			'password doesnt match the user password'
		);
	}
	return compare(normalPassword, hashedPassword);
};

export const hashPassword = async (
	normalPassword: string,
	saltRounds: string | undefined
): Promise<string> => {
	if (!normalPassword) {
		throw new PasswordHashingError(
			'the hashing process of the password failed'
		);
	}
	return hash(normalPassword, Number(saltRounds));
};
