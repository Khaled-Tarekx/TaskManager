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
import {
	ReplyCountFailedMsg,
	ReplyCreationFailedMSG,
	ReplyDeletionFailedMSG,
	ReplyEditingFailedMSG,
	ReplyNotFoundMSG,
} from './errors/msg';

export const getReplies = async () => {
	return Reply.find({});
};
export const getCommentReplies = async <T>(commentId: T) => {
	return Reply.find({ comment: commentId });
};

export const getReply = async (replyId: string) => {
	validateObjectIds([replyId]);
	const reply = await findResourceById(
		Reply,
		replyId,
		new ReplyNotFound(ReplyNotFoundMSG)
	);
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
	checkResource(reply, new ReplyCreationFailed(ReplyCreationFailedMSG));

	const commentData = await Comment.findByIdAndUpdate(reply.comment._id, {
		$inc: { replyCount: 1 },
	});
	checkResource(commentData, new ReplyCountUpdateFailed(ReplyCountFailedMsg));
	return reply;
};

export const editReply = async (
	replyData: updateReplyDTO,
	replyId: string,
	user: Express.User
) => {
	const { context } = replyData;
	validateObjectIds([replyId]);
	const reply = await findResourceById(
		Reply,
		replyId,
		new ReplyNotFound(ReplyNotFoundMSG)
	);
	await isResourceOwner(user.id, reply.owner._id);

	const replyToUpdate = await Reply.findByIdAndUpdate(
		reply._id,
		{ context },
		{ new: true }
	);

	checkResource(replyToUpdate, new ReplyUpdateFailed(ReplyEditingFailedMSG));
	return replyToUpdate;
};

export const deleteReply = async (user: Express.User, replyId: string) => {
	validateObjectIds([replyId]);

	const reply = await findResourceById(
		Reply,
		replyId,
		new ReplyNotFound(ReplyNotFoundMSG)
	);
	await isResourceOwner(user.id, reply.owner._id);
	const comment = await Comment.findByIdAndUpdate(
		reply.comment._id,
		{
			$inc: { replyCount: -1 },
		},
		{ new: true }
	);

	checkResource(comment, new ReplyCountUpdateFailed(ReplyCountFailedMsg));

	const replyToDelete = await Reply.findByIdAndDelete(reply._id);
	if (!replyToDelete) {
		throw new ReplyDeletionFailed(ReplyDeletionFailedMSG);
	}
	return reply;
};
