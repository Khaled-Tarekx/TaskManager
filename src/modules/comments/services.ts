import { Comment } from './models';
import {
	findResourceById,
	validateObjectIds,
	checkResource,
	isResourceOwner,
} from '../../utills/helpers';

import type { createCommentDTO, updateCommentDTO } from './types';
import Task from '../tasks/models';
import {
	CommentCountUpdateFailed,
	CommentCreationFailed,
	CommentDeletionFailed,
	CommentNotFound,
	CommentUpdateFailed,
} from './errors/cause';
import {
	CommentCountFailedMsg,
	CommentCreationFailedMSG,
	CommentDeletionFailedMSG,
	CommentEditingFailedMSG,
	CommentNotFoundMSG,
} from './errors/msg';

export const getTaskComments = async (taskId: string) => {
	validateObjectIds([taskId]);
	return Comment.find({ task: taskId });
};

export const getComment = async (commentId: string) => {
	validateObjectIds([commentId]);
	const comment = await findResourceById(
		Comment,
		commentId,
		new CommentNotFound(CommentNotFoundMSG)
	);
	return comment;
};

export const createComment = async (
	commentData: createCommentDTO,
	user: Express.User
) => {
	const { taskId, context } = commentData;
	validateObjectIds([taskId]);
	const comment = await Comment.create({
		owner: user.id,
		task: taskId,
		context,
	});

	checkResource(comment, new CommentCreationFailed(CommentCreationFailedMSG));

	const task = await Task.findOneAndUpdate(
		{ _id: comment.task._id },
		{
			$inc: { commentCount: 1 },
		},
		{ new: true }
	);

	checkResource(task, new CommentCountUpdateFailed(CommentCountFailedMsg));

	return comment;
};

export const editComment = async (
	commentData: updateCommentDTO,
	commentId: string,
	user: Express.User
) => {
	const { context } = commentData;
	validateObjectIds([commentId]);
	const comment = await findResourceById(
		Comment,
		commentId,
		new CommentNotFound(CommentNotFoundMSG)
	);
	await isResourceOwner(user.id, comment.owner._id);

	const commentToUpdate = await Comment.findByIdAndUpdate(
		comment.id,
		{ context },
		{ new: true }
	);

	return checkResource(
		commentToUpdate,
		new CommentUpdateFailed(CommentEditingFailedMSG)
	);
};

export const deleteComment = async (
	user: Express.User,
	commentId: string
) => {
	validateObjectIds([commentId]);

	const comment = await findResourceById(
		Comment,
		commentId,
		new CommentNotFound(CommentNotFoundMSG)
	);
	await isResourceOwner(user.id, comment.owner._id);

	const task = await Task.findByIdAndUpdate(
		comment.task._id,
		{
			$inc: { commentCount: 1 },
		},
		{ new: true }
	);
	checkResource(task, new CommentCountUpdateFailed(CommentCountFailedMsg));
	const commentToDelete = await Comment.findByIdAndDelete(comment._id);
	if (!commentToDelete) {
		throw new CommentDeletionFailed(CommentDeletionFailedMSG);
	}

	return comment;
};
