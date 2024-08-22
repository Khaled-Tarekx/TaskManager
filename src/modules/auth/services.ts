import type { createUserDTO, loginDTO } from './types';
import User from '../users/models';
import { checkResource } from '../../setup/helpers';
import { comparePassword, createTokenFromUser } from './utillities';
import { Forbidden, UnAuthenticated } from '../../custom-errors/main';
import { hash } from 'bcrypt';

const saltRounds = process.env.SALT_ROUNTS;

export const createUser = async (userData: createUserDTO) => {
	const { username, email, password, position } = userData;
	try {
		const hashedPassword = await hash(password, Number(saltRounds));

		const user = await User.create({
			username,
			email,
			password: hashedPassword,
			position,
		});
		const validatedResource = await checkResource(user);
		return validatedResource;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const login = async (loginData: loginDTO) => {
	const { email, password } = loginData;
	try {
		const user = await User.findOne({ email });

		const validatedUser = await checkResource(user);
		const validatedPassword = await checkResource(validatedUser.password);

		const isCorrectPassword = await comparePassword(
			password,
			validatedPassword
		);
		if (!isCorrectPassword) {
			throw new UnAuthenticated(`email or password is incorrect`);
		}
		const updatedUser = await User.findOneAndUpdate(
			{ email: validatedUser.email },
			{ isLoggedIn: true },
			{ new: true }
		);
		const validatedupdatedUser = await checkResource(updatedUser);

		const token = await createTokenFromUser(validatedupdatedUser);
		const validatedResource = await checkResource(token);
		return validatedResource;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
