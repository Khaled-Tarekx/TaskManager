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
} from './errors';

export const getCommentLikes = async (commentId: string) => {
	validateObjectIds([commentId]);
	return CommentLike.find({ comment: commentId });
};

export const getCommentLike = async (likeId: string) => {
	validateObjectIds([likeId]);

	return findResourceById(
		CommentLike,
		likeId,
		new LikeNotFound('you havent liked this reply')
	);
};

export const getUserCommentLike = async (user: Express.User) => {
	const userCommentLike = await CommentLike.findOne({
		owner: user.id,
	});
	checkResource(
		userCommentLike,
		new LikeNotFound('you havent liked this reply')
	);
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
	checkResource(
		comment,
		new LikeCountUpdateFailed('like count was not updated for this comment')
	);
	checkResource(commentLike, new LikeCreationFailed('like creation failed'));

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
		new LikeNotFound('no like was found for this reply')
	);
	await isResourceOwner(user.id, commentLikeToDelete.owner._id);
	const comment = await Comment.findByIdAndUpdate(
		commentLikeToDelete.comment._id,
		{
			$inc: { likeCount: -1 },
		}
	);
	checkResource(
		comment,
		new LikeCountUpdateFailed('like cound was not updated for this reply')
	);
	const likeToDelete = await CommentLike.findByIdAndDelete(
		commentLikeToDelete._id
	);
	if (!likeToDelete) {
		throw new UnLikeFailed('unlike operation failed');
	}
	return commentLikeToDelete;
};
