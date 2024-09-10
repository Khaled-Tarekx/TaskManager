import { type AnyZodObject, ZodError } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from './errors/cause';

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
	return async (
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
		} catch (err: unknown) {
			if (err instanceof ZodError) {
				const errorMessages = err.issues.map((issue) => [
					issue.path,
					issue.message,
				]);
				return next(new ValidationError(errorMessages.join(', ')));
			} else {
				return next(err);
			}
		}
	};
};
