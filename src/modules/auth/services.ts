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
import { supabase } from './supabase';

const saltRounds = process.env.SALT_ROUNTS;
const access_secret = process.env.ACCESS_SECRET_KEY;
const refresh_secret = process.env.REFRESH_SECRET_KEY;
const access_expire = process.env.ACCESS_EXPIRE;
const refresh_expire = process.env.REFRESH_EXPIRE;

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

	const accessToken = await createTokenFromUser(
		user,
		access_secret,
		access_expire
	);
	const refreshToken = await createTokenFromUser(
		user,
		refresh_secret,
		refresh_expire
	);

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

		const accessToken = await createTokenFromUser(
			user,
			access_secret,
			access_expire
		);
		const newRefreshToken = await createTokenFromUser(
			user,
			refresh_secret,
			refresh_expire
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

export const registerUser = async (userInput: createUserDTO) => {
	const { username, email, password, position } = userInput;
	const hashedPassword = await hashPassword(password, saltRounds);

	const user = await User.create({
		username,
		email,
		password: hashedPassword,
		position,
	});
	const userData = { position, role: user.roles };
	checkResource(user, RegistrationError);
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: { data: { userData } },
	});

	if (error) {
		console.log(error.message);
		throw new RegistrationError();
	}

	return data;
};

export const loginUser = async (logininput: loginDTO) => {
	const { email, password } = logininput;
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		throw new UserNotFound();
	}
	const updatedUser = await User.findOneAndUpdate(
		{ email: data.user.email },
		{ isLoggedIn: true },
		{ new: true }
	);
	checkResource(updatedUser, UserNotFound);

	const jwtToken = data.session.access_token;
	const refreshToken = data.session.refresh_token;
	const userData = {
		email: data.user.email,
		id: data.user.id,
	};
	return { jwtToken, refreshToken, userData };
};

export const refreshSession = async (refresh_token: string) => {
	const { data, error } = await supabase.auth.refreshSession({
		refresh_token,
	});

	if (error) {
		throw new TokenCreationFailed();
	}

	return data;
};
