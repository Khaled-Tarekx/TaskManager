import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import User, { UserSchema } from '../users/models';
import type { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../custom-errors/main';
import type { Roles } from './types';
import { InferRawDocType } from 'mongoose';
import { TokenVerificationFailed, UserNotFound } from './errors/cause';

const secret = process.env.ACCESS_SECRET_KEY;

const opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secret,
};

passport.serializeUser((user, done) => {
	done(null, user.id);
});

type callbackType = (
	err: CustomError | null | unknown,
	user: InferRawDocType<UserSchema> | false
) => void;

passport.deserializeUser(async (id, done: callbackType) => {
	try {
		const user = await User.findById(id);
		if (!user) {
			throw new UserNotFound();
		}
		done(null, user);
	} catch (err: unknown) {
		done(err, false);
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
				return done(new TokenVerificationFailed(), false);
			}
			const user = await User.findById(jwt_payload.id);
			if (!user) {
				return done(new UserNotFound(), false);
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
		fn(req, res, next).catch(next);
	};
};
