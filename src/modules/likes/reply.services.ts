import { ReplyLike } from './models';

import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
} from '../../utills/helpers';
import type { ReplyLikeDTO } from './types';

import { Reply } from '../comments/models';
import {
	LikeCountUpdateFailed,
	LikeCreationFailed,
	LikeNotFound,
	UnLikeFailed,
} from './errors';

export const getReplyLikes = async (replyId: string) => {
	validateObjectIds([replyId]);
	return ReplyLike.find({ reply: replyId });
};

export const getReplyLike = async (likeId: string) => {
	validateObjectIds([likeId]);
	return findResourceById(
		ReplyLike,
		likeId,
		new LikeNotFound('you havent liked this reply')
	);
};

export const getUserReplyLike = async (
	user: Express.User,
	replyId: string
) => {
	const userReplyLike = await ReplyLike.findOne({
		owner: user.id,
		reply: replyId,
	});
	return checkResource(
		userReplyLike,
		new LikeNotFound('you havent liked this reply')
	);
};

export const createReplyLike = async (
	replyData: ReplyLikeDTO,
	user: Express.User
) => {
	const { replyId } = replyData;
	validateObjectIds([replyId]);

	const replyLike = await ReplyLike.create({
		owner: user.id,
		reply: replyId,
	});
	const reply = await Reply.findByIdAndUpdate(replyLike.reply._id, {
		$inc: { likeCount: 1 },
	});
	checkResource(
		reply,
		new LikeCountUpdateFailed('like count was not updated for this reply')
	);
	checkResource(replyLike, new LikeCreationFailed('like creation failed'));
	return replyLike;
};

export const deleteReplyLike = async (likeId: string, user: Express.User) => {
	validateObjectIds([likeId]);
	const replyLikeToDelete = await findResourceById(
		ReplyLike,
		likeId,
		new LikeNotFound('no like was found for this reply')
	);
	await isResourceOwner(user.id, replyLikeToDelete.owner._id);
	const reply = await Reply.findByIdAndUpdate(replyLikeToDelete.reply._id, {
		$inc: { likeCount: -1 },
	});

	checkResource(
		reply,
		new LikeCountUpdateFailed('like cound was not updated for this reply')
	);
	const likeToDelete = await ReplyLike.findByIdAndDelete(
		replyLikeToDelete.id
	);
	if (!likeToDelete) {
		throw new UnLikeFailed('unlike operation failed');
	}
	return replyLikeToDelete;
};
