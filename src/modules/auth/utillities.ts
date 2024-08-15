import User, { userSchema } from '../users/models.js';
import jwt from 'jsonwebtoken';
import { CustomError, NotFound } from '../../../custom-errors/main.js';
import { StatusCodes } from 'http-status-codes';
import { AnyZodObject, ZodError } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from './middleware.js';
import { HydratedDocumentFromSchema } from 'mongoose';
import { compare } from 'bcrypt';
import UnAuthenticated from '../../../custom-errors/unauthenticated.js';

const secret: string | undefined = process.env.SECRET_KEY;
if (!secret) {
	throw new CustomError('secret not found', 404);
}

export const createTokenFromUser = async (
	user: HydratedDocumentFromSchema<typeof userSchema>
) => {
	try {
		const tokenUser = await User.findOne({ email: user.email });

		if (!tokenUser) {
			throw new NotFound('User not found');
		}

		return jwt.sign({ id: tokenUser._id, roles: tokenUser.roles }, secret, {
			expiresIn: '1d',
		});
	} catch (err: any) {
		throw new CustomError(err.message, StatusCodes.BAD_REQUEST);
	}
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
			res: Response,
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
) => {
	try {
		return compare(normalPassword, hashedPassword);
	} catch (err: any) {
		throw new UnAuthenticated(`err checking password: ${err.message}`);
	}
};
