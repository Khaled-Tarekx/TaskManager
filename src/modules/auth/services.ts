import type { createUserDTO, loginDTO } from './types';
import User from '../users/models';
import { checkResource } from '../../utills/helpers';
import {
	comparePassword,
	createTokenFromUser,
	hashPassword,
} from './utillities';
import {
	LoginError,
	RegistrationError,
	TokenCreationFailed,
	UserNotFound,
} from './errors/cause';

const saltRounds = process.env.SALT_ROUNTS;

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

	const token = await createTokenFromUser(user);
	checkResource(token, TokenCreationFailed);
	return token;
};
