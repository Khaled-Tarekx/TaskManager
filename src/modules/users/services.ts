import User from './models';
import { Comment, Reply } from '../comments/models';
import Task from '../tasks/models';
import {
	findResourceById,
	validateObjectIds,
	checkResource,
} from '../../utills/helpers';

import type { updateUserDTO } from './types';
import { ReplyNotFound } from '../comments/replies/errors/cause';
import { CommentNotFound } from '../comments/errors/cause';
import { TaskNotFound } from '../tasks/errors/cause';
import { UserDeletionFailed, UserUpdatingFailed } from './errors/cause';
import { UserNotFound } from '../auth/errors/cause';

export const getUsers = async () => {
	return User.find({}).select(' -password');
};

export const getUser = async (userId: string) => {
	validateObjectIds([userId]);
	return findResourceById(User, userId, UserNotFound);
};

export const updateUserInfo = async (
	updateData: updateUserDTO,
	user: Express.User
) => {
	const updatedUser = await User.findByIdAndUpdate(
		user.id,
		{ email: updateData.email, username: updateData.username },
		{ new: true }
	);
	checkResource(updatedUser, UserUpdatingFailed);
	return updatedUser;
};

export const deleteUser = async (user: Express.User) => {
	const userToDelete = await findResourceById(User, user.id, UserNotFound);

	const deletedUser = await User.findByIdAndDelete(userToDelete.id);
	if (!deletedUser) {
		throw new UserDeletionFailed();
	}
	return deletedUser;
};

export const getUserReplies = async (user: Express.User) => {
	return Reply.find({
		owner: user.id,
	});
};

export const getUserReply = async (replyId: string, user: Express.User) => {
	validateObjectIds([replyId]);
	const reply = await Reply.findOne({
		_id: replyId,
		owner: user.id,
	});
	checkResource(reply, ReplyNotFound);
	return reply;
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
	validateObjectIds([commentId]);
	const comment = await Comment.findOne({
		_id: commentId,
		owner: user.id,
	});
	checkResource(comment, CommentNotFound);
	return comment;
};

export const getUserTasks = async (user: Express.User) => {
	return Task.find({ owner: user.id });
};

export const getUserTask = async (user: Express.User, taskId: string) => {
	validateObjectIds([taskId]);
	const task = await Task.findOne({
		owner: user.id,
		_id: taskId,
	});

	checkResource(task, TaskNotFound);
	return task;
};
