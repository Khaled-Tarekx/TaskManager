import { CommentLike } from './models';

import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
} from '../../utills/helpers';
import type { CommentLikeDTO } from './types';
import { Comment } from '../comments/models';
import {
	LikeCountUpdateFailed,
	LikeCreationFailed,
	LikeNotFound,
	UnLikeFailed,
} from './errors/cause';

export const getCommentLikes = async (commentId: string) => {
	validateObjectIds([commentId]);
	return CommentLike.find({ comment: commentId });
};

export const getCommentLike = async (likeId: string) => {
	validateObjectIds([likeId]);

	return findResourceById(CommentLike, likeId, LikeNotFound);
};

export const getUserCommentLike = async (user: Express.User) => {
	const userCommentLike = await CommentLike.findOne({
		owner: user.id,
	});
	checkResource(userCommentLike, LikeNotFound);
	return userCommentLike;
};

export const createCommentLike = async (
	commentData: CommentLikeDTO,
	user: Express.User
) => {
	const { commentId } = commentData;
	validateObjectIds([commentId]);

	const commentLike = await CommentLike.create({
		owner: user.id,
		comment: commentId,
	});
	const comment = await Comment.findByIdAndUpdate(commentLike.comment._id, {
		$inc: { likeCount: 1 },
	});
	checkResource(comment, LikeCountUpdateFailed);
	checkResource(commentLike, LikeCreationFailed);

	return commentLike;
};

export const deleteCommentLike = async (
	likeId: string,
	user: Express.User
) => {
	validateObjectIds([likeId]);
	const commentLikeToDelete = await findResourceById(
		CommentLike,
		likeId,
		LikeNotFound
	);
	await isResourceOwner(user.id, commentLikeToDelete.owner._id);
	const comment = await Comment.findByIdAndUpdate(
		commentLikeToDelete.comment._id,
		{
			$inc: { likeCount: -1 },
		}
	);
	checkResource(comment, LikeCountUpdateFailed);
	const likeToDelete = await CommentLike.findByIdAndDelete(
		commentLikeToDelete._id
	);
	if (!likeToDelete) {
		throw new UnLikeFailed();
	}
	return commentLikeToDelete;
};
