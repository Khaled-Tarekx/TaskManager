import { CommentLike } from './models.js';

import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from '../../setup/helpers';
import { isResourceOwner } from '../users/helpers.js';
import type { CommentLikeDTO } from './types.js';

export const getCommentLikes = async (commentId: string) => {
	validateObjectIds([commentId]);
	return CommentLike.find({ reply: commentId });
};

export const getCommentLike = async (likeId: string) => {
	validateObjectIds([likeId]);

	return findResourceById(CommentLike, likeId);
};

export const getUserCommentLike = async (user: Express.User | undefined) => {
	const loggedInUser = await checkUser(user);
	const userCommentLike = await CommentLike.findOne({
		owner: loggedInUser.id,
	});
	return checkResource(userCommentLike);
};

export const createCommentLike = async (
	commentData: CommentLikeDTO,
	user: Express.User | undefined
) => {
	const { commentId } = commentData;
	validateObjectIds([commentId]);

	const loggedInUser = await checkUser(user);

	const commentLike = CommentLike.create({
		owner: loggedInUser.id,
		comment: commentId,
	});
	return checkResource(commentLike);
};

export const deleteCommentLike = async (
	likeId: string,
	user: Express.User | undefined
) => {
	validateObjectIds([likeId]);
	const loggedInUser = await checkUser(user);
	const commentLikeToDelete = await findResourceById(CommentLike, likeId);
	await isResourceOwner(loggedInUser.id, commentLikeToDelete.owner.id);
	await CommentLike.findByIdAndDelete(commentLikeToDelete.id);
	return 'like deleted successfully';
};
