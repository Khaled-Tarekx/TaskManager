import { Forbidden } from '../../custom-errors/main';
import User from './models';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from '../../setup/helpers';

import type { updateUserDTO } from './types';

export const getUsers = async () => {
	return User.find({}).select(' -password');
};

export const getUser = async (userId: string) => {
	try {
		validateObjectIds([userId]);
		return findResourceById(User, userId);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const updateUserInfo = async (
	updateData: updateUserDTO,
	user: Express.User | undefined
) => {
	try {
		const loggedInUser = await checkUser(user);
		const updatedUser = await User.findByIdAndUpdate(
			loggedInUser.id,
			{ email: updateData.email, username: updateData.username },
			{ new: true }
		);
		return checkResource(updatedUser);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteUser = async (user: Express.User | undefined) => {
	try {
		const loggedInUser = await checkUser(user);
		const userToDelete = await findResourceById(User, loggedInUser.id);

		await User.findByIdAndDelete(userToDelete.id);
		return 'User Deleted Successfully';
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
