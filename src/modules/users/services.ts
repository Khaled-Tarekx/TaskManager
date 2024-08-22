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
	return User.find({});
};

export const getUser = async (userId: string) => {
	validateObjectIds([userId]);
	return findResourceById(User, userId);
};

export const updateUserInfo = async (
	updateData: updateUserDTO,
	user: Express.User | undefined
) => {
	const loggedInUser = await checkUser(user);

	try {
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
	const loggedInUser = await checkUser(user);
	const userToDelete = await findResourceById(User, loggedInUser.id);

	await User.findByIdAndDelete(userToDelete.id);
	return 'User Deleted Successfully';
};
