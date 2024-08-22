import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import User from '../users/models';
import type { NextFunction, Request, Response } from 'express';
import {
	NotFound,
	UnAuthenticated,
	CustomError,
} from '../../custom-errors/main';
import { StatusCodes } from 'http-status-codes';
import type { Roles } from './types';

const secret = process.env.SECRET_KEY;

const opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secret,
};

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		if (!user) {
			throw new CustomError('user not found', StatusCodes.NOT_FOUND);
		}
		done(null, user);
	} catch (err) {
		done(err);
	}
});

type jwtPayload = {
	id: string;
	roles: Roles;
};

export default passport.use(
	new Strategy(opts, async (jwt_payload: jwtPayload, done) => {
		try {
			if (!jwt_payload.id) {
				return done(
					new UnAuthenticated('Invalid token: subject missing'),
					false
				);
			}
			const user = await User.findById(jwt_payload.id);
			if (!user) {
				return done(new NotFound('user not found'), false);
			} else {
				return done(null, user);
			}
		} catch (err: any) {
			return done(err, false);
		}
	})
);

export const asyncHandler = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch((err: CustomError) => {
			next(new Error(err.message));
		});
	};
};
