import { isResourceOwner } from '../users/helpers.js';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from 'src/setup/helpers.js';

import type { createReplyDTO, updateReplyDTO } from './types.js';
import Reply from './models.js';

export const getReplies = async () => {
	return Reply.find({});
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
	validateObjectIds([comment, parentReply, ...repliesOfReply]);
	const reply = await Reply.create({
		comment,
		owner: loggedInUser.id,
		parentReply,
		repliesOfReply,
		context,
	});
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

	await Reply.findByIdAndDelete(reply.id);

	return 'reply deleted successfully';
};
