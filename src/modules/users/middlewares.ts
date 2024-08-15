import { NotFound } from '../../../custom-errors/main.js';
import { Request, Response, NextFunction } from 'express';

export const checkRequestUser = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		return next(new NotFound(`no user found`));
	}
	next();
};
