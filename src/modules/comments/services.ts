import Comment from './models';
import { isResourceOwner } from '../users/helpers';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from '../../setup/helpers';

import type { createCommentDTO, updateCommentDTO } from './types';
import Task from '../tasks/models';

export const getTaskComments = async (taskId: string) => {
	validateObjectIds([taskId]);
	return Comment.find({ task: taskId });
};

export const getComment = async (commentId: string) => {
	validateObjectIds([commentId]);
	const comment = await findResourceById(Comment, commentId);
	return await checkResource(comment);
};

export const getUserComments = async (user: Express.User | undefined) => {
	const loggedInUser = await checkUser(user);
	return Comment.find({
		owner: loggedInUser.id,
	});
};

export const getUserComment = async (
	commentId: string,
	user: Express.User | undefined
) => {
	validateObjectIds([commentId]);
	const loggedInUser = await checkUser(user);
	const comment = await Comment.findOne({
		_id: commentId,
		owner: loggedInUser.id,
	});
	return checkResource(comment);
};

export const createComment = async (
	commentData: createCommentDTO,
	user: Express.User | undefined
) => {
	const { taskId, context } = commentData;
	validateObjectIds([taskId]);
	const loggedInUser = await checkUser(user);

	const comment = await Comment.create({
		owner: loggedInUser.id,
		task: taskId,
		context,
	});

	const task = await Task.findByIdAndUpdate(taskId, {
		$inc: { commentCount: 1 },
	});

	await checkResource(task);
	return checkResource(comment);
};

export const editComment = async (
	commentData: updateCommentDTO,
	commentId: string,
	user: Express.User | undefined
) => {
	const { context } = commentData;
	validateObjectIds([commentId]);
	const loggedInUser = await checkUser(user);
	const comment = await findResourceById(Comment, commentId);
	await isResourceOwner(loggedInUser.id, comment.owner.id);

	const commentToUpdate = await Comment.findByIdAndUpdate(
		comment.id,
		{ context },
		{ new: true }
	);

	return checkResource(commentToUpdate);
};

export const deleteComment = async (
	user: Express.User | undefined,
	commentId: string
) => {
	validateObjectIds([commentId]);

	const loggedInUser = await checkUser(user);
	const comment = await findResourceById(Comment, commentId);
	await isResourceOwner(loggedInUser.id, comment.owner.id);
	const task = await Task.findByIdAndUpdate(comment.task.id, {
		$inc: { commentCount: -1 },
	});
	await checkResource(task);
	await Comment.findByIdAndDelete(comment.id);

	return 'comment deleted successfully';
};
