import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnAuthorized } from './errors/cause';
import { CustomJwtPayload } from './types';

const access_secret = process.env.ACCESS_SECRET_KEY;

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new UnAuthorized();
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, access_secret) as CustomJwtPayload;

		if (decoded && decoded.id) {
			req.user = decoded;
			next();
		}
	} catch (error) {
		if (error instanceof JsonWebTokenError)
			return next(new JsonWebTokenError(error.message));
	}
};
