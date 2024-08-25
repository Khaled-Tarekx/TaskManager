import { ReplyLike } from './models';

import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
} from '../../utills/helpers';
import type { ReplyLikeDTO } from './types';

import Reply from '../replies/models';
import { Forbidden } from '../../custom-errors/main';

export const getReplyLikes = async (replyId: string) => {
	try {
		validateObjectIds([replyId]);
		return ReplyLike.find({ reply: replyId });
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const getReplyLike = async (likeId: string) => {
	try {
		validateObjectIds([likeId]);
		return findResourceById(ReplyLike, likeId);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const getUserReplyLike = async (
	user: Express.User,
	replyId: string
) => {
	try {
		const userReplyLike = await ReplyLike.findOne({
			owner: user.id,
			reply: replyId,
		});
		return checkResource(userReplyLike);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const createReplyLike = async (
	replyData: ReplyLikeDTO,
	user: Express.User
) => {
	const { replyId } = replyData;
	try {
		validateObjectIds([replyId]);

		const replyLike = await ReplyLike.create({
			owner: user.id,
			reply: replyId,
		});
		const reply = await Reply.findByIdAndUpdate(replyLike.reply._id, {
			$inc: { likeCount: 1 },
		});
		await checkResource(reply);
		return checkResource(replyLike);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteReplyLike = async (likeId: string, user: Express.User) => {
	try {
		validateObjectIds([likeId]);
		const replyLikeToDelete = await findResourceById(ReplyLike, likeId);
		await isResourceOwner(user.id, replyLikeToDelete.owner._id);
		const reply = await Reply.findByIdAndUpdate(replyLikeToDelete.reply._id, {
			$inc: { likeCount: -1 },
		});

		await checkResource(reply);
		await ReplyLike.findByIdAndDelete(replyLikeToDelete.id);
		return replyLikeToDelete;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
