import { ReplyLike } from './models';

import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from '../../setup/helpers';
import { isResourceOwner } from '../users/helpers';
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
	user: Express.User | undefined,
	replyId: string
) => {
	try {
		const loggedInUser = await checkUser(user);
		const userReplyLike = await ReplyLike.findOne({
			owner: loggedInUser.id,
			reply: replyId,
		});
		return checkResource(userReplyLike);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const createReplyLike = async (
	replyData: ReplyLikeDTO,
	user: Express.User | undefined
) => {
	const { replyId } = replyData;
	try {
		validateObjectIds([replyId]);

		const loggedInUser = await checkUser(user);

		const replyLike = await ReplyLike.create({
			owner: loggedInUser.id,
			reply: replyId,
		});
		const reply = await Reply.findByIdAndUpdate(replyLike.reply.id, {
			$inc: { likeCount: 1 },
		});
		await checkResource(reply);
		return checkResource(replyLike);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteReplyLike = async (
	likeId: string,
	user: Express.User | undefined
) => {
	try {
		validateObjectIds([likeId]);
		const loggedInUser = await checkUser(user);
		const replyLikeToDelete = await findResourceById(ReplyLike, likeId);
		await isResourceOwner(loggedInUser.id, replyLikeToDelete.owner.id);
		const reply = await Reply.findByIdAndUpdate(replyLikeToDelete.reply.id, {
			$inc: { likeCount: -1 },
		});

		await checkResource(reply);
		await ReplyLike.findByIdAndDelete(replyLikeToDelete.id);
		return 'like deleted successfully';
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
