import { isResourceOwner } from '../users/helpers';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from '../../setup/helpers';

import type { createReplyDTO, updateReplyDTO } from './types';
import Reply from './models';
import Comment from '../comments/models';

export const getReplies = async () => {
	return Reply.find({});
};
export const getCommentReplies = async (commentId: string) => {
	return Reply.find({ comment: commentId });
};

export const getReply = async (replyId: string) => {
	validateObjectIds([replyId]);
	const reply = await findResourceById(Reply, replyId);
	return checkResource(reply);
};

export const getUserReplies = async (user: Express.User | undefined) => {
	const loggedInUser = await checkUser(user);
	return Reply.find({
		owner: loggedInUser.id,
	});
};

export const getUserReply = async (
	replyId: string,
	user: Express.User | undefined
) => {
	validateObjectIds([replyId]);
	const loggedInUser = await checkUser(user);
	const reply = await Reply.findOne({
		_id: replyId,
		owner: loggedInUser.id,
	});
	return checkResource(reply);
};

export const createReply = async (
	replyData: createReplyDTO,
	user: Express.User | undefined
) => {
	const { comment, parentReply, repliesOfReply, context } = replyData;
	const loggedInUser = await checkUser(user);
	const reply = await Reply.create({
		comment,
		owner: loggedInUser.id,
		parentReply,
		repliesOfReply,
		context,
	});
	const commentData = await Comment.findByIdAndUpdate(reply.comment.id, {
		$inc: { replyCount: 1 },
	});
	await checkResource(commentData);
	return checkResource(reply);
};

export const editReply = async (
	replyData: updateReplyDTO,
	replyId: string,
	user: Express.User | undefined
) => {
	const { context } = replyData;
	validateObjectIds([replyId]);
	const loggedInUser = await checkUser(user);
	const reply = await findResourceById(Reply, replyId);
	await isResourceOwner(loggedInUser.id, reply.owner.id);

	const replyToUpdate = await Reply.findByIdAndUpdate(
		reply.id,
		{ context },
		{ new: true }
	);

	return checkResource(replyToUpdate);
};

export const deleteReply = async (
	user: Express.User | undefined,
	replyId: string
) => {
	validateObjectIds([replyId]);

	const loggedInUser = await checkUser(user);
	const reply = await findResourceById(Reply, replyId);
	await isResourceOwner(loggedInUser.id, reply.owner.id);
	const comment = await Comment.findByIdAndUpdate(reply.comment.id, {
		$inc: { replyCount: -1 },
	});
	await checkResource(comment);
	await Reply.findByIdAndDelete(reply.id);

	return 'reply deleted successfully';
};
