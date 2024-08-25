import { CommentLike } from './models';

import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
} from '../../utills/helpers';
import type { CommentLikeDTO } from './types';
import Comment from '../comments/models';
import { Forbidden } from '../../custom-errors/main';

export const getCommentLikes = async (commentId: string) => {
	try {
		validateObjectIds([commentId]);
		return CommentLike.find({ comment: commentId });
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const getCommentLike = async (likeId: string) => {
	try {
		validateObjectIds([likeId]);

		return findResourceById(CommentLike, likeId);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const getUserCommentLike = async (user: Express.User) => {
	try {
		const userCommentLike = await CommentLike.findOne({
			owner: user.id,
		});
		return checkResource(userCommentLike);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const createCommentLike = async (
	commentData: CommentLikeDTO,
	user: Express.User
) => {
	const { commentId } = commentData;
	try {
		validateObjectIds([commentId]);

		const commentLike = await CommentLike.create({
			owner: user.id,
			comment: commentId,
		});
		const comment = await Comment.findByIdAndUpdate(commentLike.comment._id, {
			$inc: { likeCount: 1 },
		});
		await checkResource(comment);
		return checkResource(commentLike);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteCommentLike = async (
	likeId: string,
	user: Express.User
) => {
	try {
		validateObjectIds([likeId]);
		const commentLikeToDelete = await findResourceById(CommentLike, likeId);
		await isResourceOwner(user.id, commentLikeToDelete.owner._id);
		const comment = await Comment.findByIdAndUpdate(
			commentLikeToDelete.comment._id,
			{
				$inc: { likeCount: -1 },
			}
		);
		await checkResource(comment);
		await CommentLike.findByIdAndDelete(commentLikeToDelete._id);
		return commentLikeToDelete;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
