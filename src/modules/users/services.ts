import UserModel from './models';
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
import { supabase } from '../auth/supabase';
import { User } from '@supabase/supabase-js';

export const getUsers = async (user: Express.User) => {
	return UserModel.find({}).select(' -password');
};

export const getUser = async (userId: string) => {
	validateObjectIds([userId]);

	return findResourceById(UserModel, userId, UserNotFound);
};

export const updateUserInfo = async (
	updateData: updateUserDTO,
	user: Express.User
) => {
	const updatedUser = await UserModel.findOneAndUpdate(
		{
			email: user.email,
		},
		{ ...updateData },
		{ new: true }
	);
	checkResource(updatedUser, UserUpdatingFailed);
	await supabase.auth.updateUser({
		data: { ...updateData },
		email: updateData.email,
	});
	return updatedUser;
};

export const deleteUser = async (user: Express.User) => {
	const userToDelete = await UserModel.findOne({ email: user.email });
	checkResource(userToDelete, UserNotFound);

	await supabase.auth.admin.deleteUser(user.supaId!);
	const deletedUser = await UserModel.findByIdAndDelete(userToDelete.id);
	if (!deletedUser) {
		throw new UserDeletionFailed();
	}
	return deletedUser;
};

export const getUserReplies = async (user: Express.User) => {
	console.log(user);
	console.log(user.id);
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
