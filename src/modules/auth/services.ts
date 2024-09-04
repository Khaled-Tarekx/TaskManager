import type { createUserDTO, loginDTO } from './types';
import User from '../users/models';
import { checkResource, findResourceById } from '../../utills/helpers';
import {
	comparePassword,
	createTokenFromUser,
	hashPassword,
} from './utillities';
import {
	LoginError,
	RefreshTokenNotFound,
	RegistrationError,
	TokenCreationFailed,
	TokenVerificationFailed,
	UserNotFound,
} from './errors/cause';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UserRefreshToken from './models';

const saltRounds = process.env.SALT_ROUNTS;
const access_secret = process.env.ACCESS_SECRET_KEY;
const refresh_secret = process.env.REFRESH_SECRET_KEY;

export const createUser = async (userData: createUserDTO) => {
	const { username, email, password, position } = userData;
	const hashedPassword = await hashPassword(password, saltRounds);

	const user = await User.create({
		username,
		email,
		password: hashedPassword,
		position,
	});
	checkResource(user, RegistrationError);
	return user;
};
export const login = async (loginData: loginDTO) => {
	const { email, password } = loginData;
	const user = await User.findOne({ email });
	checkResource(user, UserNotFound);
	const isCorrectPassword = await comparePassword(password, user.password);
	if (!isCorrectPassword || !user) {
		throw LoginError;
	}
	const updatedUser = await User.findOneAndUpdate(
		{ email: user.email },
		{ isLoggedIn: true },
		{ new: true }
	);
	checkResource(updatedUser, UserNotFound);

	const accessToken = await createTokenFromUser(user, access_secret, '1d');
	const refreshToken = await createTokenFromUser(user, refresh_secret, '2d');

	checkResource(accessToken, TokenCreationFailed);
	checkResource(refreshToken, TokenCreationFailed);
	await UserRefreshToken.create({
		token: refreshToken,
		user: user._id,
	});
	return { accessToken, refreshToken };
};

export const token = async (refresh_token: string) => {
	if (!refresh_token) {
		throw new RefreshTokenNotFound();
	}
	try {
		const payload = jwt.verify(refresh_token, refresh_secret) as JwtPayload;
		const user = await findResourceById(User, payload.id, UserNotFound);

		const userRefreshToken = await UserRefreshToken.findOne({
			token: refresh_secret,
			user: user._id,
		});

		checkResource(userRefreshToken, RefreshTokenNotFound);

		await UserRefreshToken.findByIdAndDelete(userRefreshToken._id);

		const accessToken = await createTokenFromUser(user, access_secret, '1d');
		const newRefreshToken = await createTokenFromUser(
			user,
			refresh_secret,
			'2d'
		);

		checkResource(accessToken, TokenCreationFailed);
		checkResource(newRefreshToken, TokenCreationFailed);
		const storedToken = await UserRefreshToken.create({
			token: newRefreshToken,
			user: user._id,
		});
		checkResource(storedToken, TokenCreationFailed);

		return { accessToken, newRefreshToken };
	} catch (err: unknown) {
		if (
			err instanceof jwt.TokenExpiredError ||
			err instanceof jwt.JsonWebTokenError
		)
			throw new TokenVerificationFailed();
	}
};
