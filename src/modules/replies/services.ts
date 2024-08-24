import {
	findResourceById,
	validateObjectIds,
	checkResource,
	isResourceOwner,
} from '../../utills/helpers';

import type { createReplyDTO, updateReplyDTO } from './types';
import Reply from './models';
import Comment from '../comments/models';
import { Forbidden } from '../../custom-errors/main';

export const getReplies = async () => {
	return Reply.find({});
};
export const getCommentReplies = async (commentId: string) => {
	return Reply.find({ comment: commentId });
};

export const getReply = async (replyId: string) => {
	try {
		validateObjectIds([replyId]);
		const reply = await findResourceById(Reply, replyId);
		return checkResource(reply);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const createReply = async (
	replyData: createReplyDTO,
	user: Express.User
) => {
	const { commentId, parentReply, repliesOfReply, context } = replyData;
	try {
		const reply = await Reply.create({
			comment: commentId,
			owner: user.id,
			parentReply,
			repliesOfReply,
			context,
		});
		const commentData = await Comment.findByIdAndUpdate(reply.comment.id, {
			$inc: { replyCount: 1 },
		});
		await checkResource(commentData);
		return checkResource(reply);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const editReply = async (
	replyData: updateReplyDTO,
	replyId: string,
	user: Express.User
) => {
	const { context } = replyData;
	try {
		validateObjectIds([replyId]);
		const reply = await findResourceById(Reply, replyId);
		await isResourceOwner(user.id, reply.owner._id);

		const replyToUpdate = await Reply.findByIdAndUpdate(
			reply.id,
			{ context },
			{ new: true }
		);

		return checkResource(replyToUpdate);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const deleteReply = async (user: Express.User, replyId: string) => {
	try {
		validateObjectIds([replyId]);

		const reply = await findResourceById(Reply, replyId);
		await isResourceOwner(user.id, reply.owner._id);
		const comment = await Comment.findByIdAndUpdate(
			reply.comment._id.toString(),
			{
				$inc: { replyCount: -1 },
			},
			{ new: true }
		);

		await checkResource(comment);
		await Reply.findByIdAndDelete(reply.id);

		return reply;
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
