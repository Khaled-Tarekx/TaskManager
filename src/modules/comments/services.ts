import Comment from './models';
import {
	findResourceById,
	validateObjectIds,
	checkResource,
	isResourceOwner,
} from '../../utills/helpers';

import type { createCommentDTO, updateCommentDTO } from './types';
import Task from '../tasks/models';
import { Forbidden } from '../../custom-errors/main';

export const getTaskComments = async (taskId: string) => {
	try {
		validateObjectIds([taskId]);
		return Comment.find({ task: taskId });
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const getComment = async (commentId: string) => {
	try {
		validateObjectIds([commentId]);
		const comment = await findResourceById(Comment, commentId);
		return checkResource(comment);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const createComment = async (
	commentData: createCommentDTO,
	user: Express.User
) => {
	const { taskId, context } = commentData;
	try {
		validateObjectIds([taskId]);

		const comment = await Comment.create({
			owner: user.id,
			task: taskId,
			context,
		});

		const task = await Task.findOneAndUpdate(
			{ _id: comment.task._id },
			{
				$inc: { commentCount: 1 },
			},
			{ new: true }
		);

		await checkResource(task);
		return checkResource(comment);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const editComment = async (
	commentData: updateCommentDTO,
	commentId: string,
	user: Express.User
) => {
	const { context } = commentData;
	try {
		validateObjectIds([commentId]);
		const comment = await findResourceById(Comment, commentId);
		await isResourceOwner(user.id, comment.owner._id);

		const commentToUpdate = await Comment.findByIdAndUpdate(
			comment.id,
			{ context },
			{ new: true }
		);

		return checkResource(commentToUpdate);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteComment = async (
	user: Express.User,
	commentId: string
) => {
	try {
		validateObjectIds([commentId]);

		const comment = await findResourceById(Comment, commentId);
		console.log(comment);
		await isResourceOwner(user.id, comment.owner._id);
		console.log(comment.task._id);
		console.log(comment.task);
		const task = await Task.findByIdAndUpdate(
			comment.task._id,
			{
				$inc: { commentCount: 1 },
			},
			{ new: true }
		);
		console.log(task);
		await checkResource(task);
		await Comment.findByIdAndDelete(comment._id);

		return comment;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
