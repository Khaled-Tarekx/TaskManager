import { CommentLike } from './models';

import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from '../../setup/helpers';
import { isResourceOwner } from '../users/helpers';
import type { CommentLikeDTO } from './types';
import Comment from '../comments/models';
import { Forbidden } from '../../custom-errors/main';

export const getCommentLikes = async (commentId: string) => {
	try {
		validateObjectIds([commentId]);
		return CommentLike.find({ reply: commentId });
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

export const getUserCommentLike = async (user: Express.User | undefined) => {
	try {
		const loggedInUser = await checkUser(user);
		const userCommentLike = await CommentLike.findOne({
			owner: loggedInUser.id,
		});
		return checkResource(userCommentLike);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const createCommentLike = async (
	commentData: CommentLikeDTO,
	user: Express.User | undefined
) => {
	const { commentId } = commentData;
	try {
		validateObjectIds([commentId]);

		const loggedInUser = await checkUser(user);

		const commentLike = await CommentLike.create({
			owner: loggedInUser.id,
			comment: commentId,
		});
		const comment = await Comment.findByIdAndUpdate(commentLike.comment.id, {
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
	user: Express.User | undefined
) => {
	try {
		validateObjectIds([likeId]);
		const loggedInUser = await checkUser(user);
		const commentLikeToDelete = await findResourceById(CommentLike, likeId);
		await isResourceOwner(loggedInUser.id, commentLikeToDelete.owner.id);
		const comment = await Comment.findByIdAndUpdate(
			commentLikeToDelete.comment.id,
			{
				$inc: { likeCount: -1 },
			}
		);
		await checkResource(comment);
		await CommentLike.findByIdAndDelete(commentLikeToDelete.id);
		return 'like deleted successfully';
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
