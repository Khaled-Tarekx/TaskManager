import {
	findResourceById,
	validateObjectIds,
	checkResource,
	isResourceOwner,
} from '../../../utills/helpers';

import type { createReplyDTO, updateReplyDTO } from './types';
import { Reply, Comment } from '../models';
import {
	ReplyCountUpdateFailed,
	ReplyCreationFailed,
	ReplyDeletionFailed,
	ReplyNotFound,
	ReplyUpdateFailed,
} from './errors/cause';

export const getReplies = async () => {
	return Reply.find({});
};
export const getCommentReplies = async <T>(commentId: T) => {
	return Reply.find({ comment: commentId });
};

export const getReply = async (replyId: string) => {
	validateObjectIds([replyId]);
	const reply = await findResourceById(Reply, replyId, ReplyNotFound);
	return reply;
};

export const createReply = async (
	replyData: createReplyDTO,
	user: Express.User
) => {
	const { commentId, parentReply, repliesOfReply, context } = replyData;
	const reply = await Reply.create({
		comment: commentId,
		owner: user.id,
		parentReply,
		repliesOfReply,
		context,
	});
	checkResource(reply, ReplyCreationFailed);

	const commentData = await Comment.findByIdAndUpdate(reply.comment._id, {
		$inc: { replyCount: 1 },
	});
	checkResource(commentData, ReplyCountUpdateFailed);
	return reply;
};

export const editReply = async (
	replyData: updateReplyDTO,
	replyId: string,
	user: Express.User
) => {
	const { context } = replyData;
	validateObjectIds([replyId]);
	const reply = await findResourceById(Reply, replyId, ReplyNotFound);
	await isResourceOwner(user.id, reply.owner._id);

	const replyToUpdate = await Reply.findByIdAndUpdate(
		reply._id,
		{ context },
		{ new: true }
	);

	checkResource(replyToUpdate, ReplyUpdateFailed);
	return replyToUpdate;
};

export const deleteReply = async (user: Express.User, replyId: string) => {
	validateObjectIds([replyId]);

	const reply = await findResourceById(Reply, replyId, ReplyNotFound);
	await isResourceOwner(user.id, reply.owner._id);
	const comment = await Comment.findByIdAndUpdate(
		reply.comment._id,
		{
			$inc: { replyCount: -1 },
		},
		{ new: true }
	);

	checkResource(comment, ReplyCountUpdateFailed);

	const replyToDelete = await Reply.findByIdAndDelete(reply._id);
	if (!replyToDelete) {
		throw new ReplyDeletionFailed();
	}
	return reply;
};
