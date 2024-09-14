import {
	findResourceById,
	validateObjectIds,
	checkResource,
	isResourceOwner,
} from '../../../utills/helpers';

import type { createReplyDTO, updateReplyDTO } from './types';
import { Reply, Comment } from '../models';
import {
	NotSameCommentOrNotFound,
	ReplyCountUpdateFailed,
	ReplyCreationFailed,
	ReplyDeletionFailed,
	ReplyNotFound,
	ReplyUpdateFailed,
} from './errors/cause';
import ApiFeatures from '../../../utills/api-features';

export const getReplies = async (query: Record<string, string>) => {
	const apiFeatures = new ApiFeatures(
		Reply.find({ parentReply: { $exists: false } }),
		query
	)
		.sort()
		.paginate();

	return apiFeatures.mongooseQuery.exec();
};

export const getCommentReplies = async (commentId: string) => {
	const apiFeatures = new ApiFeatures(
		Reply.find({ comment: String(commentId) }).populate({
			path: 'repliesOfReply',
		})
	)
		.sort()
		.paginate();
	return apiFeatures.mongooseQuery.exec();
};

export const getReply = async (replyId: string) => {
	validateObjectIds([replyId]);
	const reply = await findResourceById(Reply, replyId, ReplyNotFound);
	const populated_reply = reply.populate({
		path: 'repliesOfReply',
	});
	return populated_reply;
};

export const createReply = async (
	replyData: createReplyDTO,
	user: Express.User
) => {
	const { commentId, parentReply, context } = replyData;
	let reply;
	reply = new Reply({
		comment: commentId,
		owner: user.id,
		context,
	});

	checkResource(reply, ReplyCreationFailed);

	const commentData = await Comment.findByIdAndUpdate(reply.comment._id, {
		$inc: { replyCount: 1 },
	});
	checkResource(commentData, ReplyCountUpdateFailed);
	if (parentReply) {
		const parent = await Reply.findOne({
			_id: parentReply,
			comment: commentId,
		});
		checkResource(parent, NotSameCommentOrNotFound);
		parent.repliesOfReply.push(reply);
		parent.replyCount++;
		await parent.save();
		reply.parentReply = parent._id;
	}
	await reply.save();
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

	const replyToDelete = await reply.deleteOne();
	if (replyToDelete.deletedCount === 0) {
		throw new ReplyDeletionFailed();
	}
	if (reply.repliesOfReply && reply.repliesOfReply.length > 0) {
		await Reply.deleteMany({
			_id: { $in: reply.repliesOfReply },
		});
	}
	if (reply.parentReply) {
		await Reply.findByIdAndUpdate(reply.parentReply, {
			$pull: { repliesOfReply: reply._id },
			$inc: { replyCount: -1 },
		});
	}
	if (reply.comment) {
		await Comment.findByIdAndUpdate(reply.comment, {
			$inc: { replyCount: -1 },
		});
	}
	return reply;
};
