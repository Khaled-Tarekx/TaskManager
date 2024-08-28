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
	checkResource(user, new RegistrationError('all fields must be entered'));
	return user;
};
export const login = async (loginData: loginDTO) => {
	const { email, password } = loginData;
	const user = await User.findOne({ email });
	checkResource(
		user,
		new UserNotFound('user not found with the given email')
	);
	const isCorrectPassword = await comparePassword(password, user.password);
	if (!isCorrectPassword || !user) {
		throw new LoginError('either password or email is incorrect');
	}
	const updatedUser = await User.findOneAndUpdate(
		{ email: user.email },
		{ isLoggedIn: true },
		{ new: true }
	);
	checkResource(
		updatedUser,
		new UserNotFound('couldnt find user with the given email')
	);

	const token = await createTokenFromUser(user);
	checkResource(
		token,
		new TokenCreationFailed('failed to create the token ')
	);
	return token;
};
