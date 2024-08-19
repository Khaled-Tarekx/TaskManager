import { ReplyLike } from './models.js';

import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from '../../setup/helpers';
import { isResourceOwner } from '../users/helpers.js';
import type { ReplyLikeDTO } from './types.js';

export const getReplyLikes = async (replyId: string) => {
	validateObjectIds([replyId]);
	return ReplyLike.find({ reply: replyId });
};

export const getReplyLike = async (likeId: string) => {
	validateObjectIds([likeId]);

	return findResourceById(ReplyLike, likeId);
};

export const getUserReplyLike = async (user: Express.User | undefined) => {
	const loggedInUser = await checkUser(user);
	const userReplyLike = await ReplyLike.findOne({
		owner: loggedInUser.id,
	});
	return checkResource(userReplyLike);
};

export const createReplyLike = async (
	replyData: ReplyLikeDTO,
	user: Express.User | undefined
) => {
	const { replyId } = replyData;
	validateObjectIds([replyId]);

	const loggedInUser = await checkUser(user);

	const replyLike = ReplyLike.create({
		owner: loggedInUser.id,
		comment: replyId,
	});
	return checkResource(replyLike);
};

export const deleteReplyLike = async (
	likeId: string,
	user: Express.User | undefined
) => {
	validateObjectIds([likeId]);
	const loggedInUser = await checkUser(user);
	const replyLikeToDelete = await findResourceById(ReplyLike, likeId);
	await isResourceOwner(loggedInUser.id, replyLikeToDelete.owner.id);
	await ReplyLike.findByIdAndDelete(replyLikeToDelete.id);
	return 'like deleted successfully';
};
