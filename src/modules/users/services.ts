import { Forbidden } from '../../custom-errors/main';
import User from './models';
import { Comment, Reply } from '../comments/models';
import Task from '../tasks/models';
import {
	findResourceById,
	validateObjectIds,
	checkResource,
} from '../../utills/helpers';

import type { updateUserDTO } from './types';

export const getUsers = async () => {
	return User.find({}).select(' -password');
};

export const getUser = async (userId: string) => {
	try {
		validateObjectIds([userId]);
		return findResourceById(User, userId);
	} catch (err: unknown) {
		if (err instanceof Forbidden) {
			throw new Forbidden(err.message);
		}
	}
};

export const updateUserInfo = async (
	updateData: updateUserDTO,
	user: Express.User
) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			user.id,
			{ email: updateData.email, username: updateData.username },
			{ new: true }
		);
		return checkResource(updatedUser);
	} catch (err: unknown) {
		if (err instanceof Forbidden) {
			throw new Forbidden(err.message);
		}
	}
};

export const deleteUser = async (user: Express.User) => {
	try {
		const userToDelete = await findResourceById(User, user.id);

		await User.findByIdAndDelete(userToDelete.id);
		return userToDelete;
	} catch (err: unknown) {
		if (err instanceof Forbidden) {
			throw new Forbidden(err.message);
		}
	}
};

export const getUserReplies = async (user: Express.User) => {
	return Reply.find({
		owner: user.id,
	});
};

export const getUserReply = async (replyId: string, user: Express.User) => {
	try {
		validateObjectIds([replyId]);
		const reply = await Reply.findOne({
			_id: replyId,
			owner: user.id,
		});
		return checkResource(reply);
	} catch (err: unknown) {
		if (err instanceof Forbidden) {
			throw new Forbidden(err.message);
		}
	}
};

export const getUserComments = async (user: Express.User) => {
	return Comment.find({
		owner: user.id,
	});
};

export const getUserComment = async (
	commentId: string,
	user: Express.User
) => {
	try {
		validateObjectIds([commentId]);
		const comment = await Comment.findOne({
			_id: commentId,
			owner: user.id,
		});
		return checkResource(comment);
	} catch (err: unknown) {
		if (err instanceof Forbidden) {
			throw new Forbidden(err.message);
		}
	}
};

export const getUserTasks = async (user: Express.User) => {
	return Task.find({ owner: user.id });
};

export const getUserTask = async (user: Express.User, taskId: string) => {
	validateObjectIds([taskId]);
	try {
		const task = await Task.findOne({
			owner: user.id,
			_id: taskId,
		});

		return checkResource(task);
	} catch (err: unknown) {
		if (err instanceof Forbidden) {
			throw new Forbidden(err.message);
		}
	}
};
