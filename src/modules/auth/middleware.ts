import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import {
	TokenVerificationFailed,
	UnAuthorized,
	UserNotFound,
} from './errors/cause';
import UserModel from '../users/models';
import { User } from '@supabase/supabase-js';
import { findResourceById } from '../../utills/helpers';

const access_secret = process.env.ACCESS_SECRET_KEY;

interface SupaAuth extends User {
	sub: string;
	user_metadata: {
		id: string;
	};
}

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next(new UnAuthorized());
	}
	let decoded: SupaAuth;
	const token = authHeader.split(' ')[1];
	try {
		decoded = jwt.verify(token, access_secret) as SupaAuth;
	} catch (error: unknown) {
		return next(new TokenVerificationFailed());
	}

	if (!decoded) {
		return next(new TokenVerificationFailed());
	}
	try {
		const user = await findResourceById(
			UserModel,
			decoded.user_metadata.id,
			UserNotFound
		);

		req.user = {
			...user.toObject(),
			id: user._id.toString(),
			supaId: decoded.sub,
		};
	} catch (err) {
		if (err instanceof UserNotFound) {
			return next(new UserNotFound());
		}
	}
	next();
};
