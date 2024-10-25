import z from 'zod';
import { mongooseId } from '../../utills/helpers';

export const createCommentSchema = z.object({
	context: z
		.string({
			required_error: 'you have to provide context for the comment',
		})
		.min(1, 'length must be 1 char least'),

	taskId: z.string({
		required_error: 'task is required',
		invalid_type_error: 'task must be a string',
	}),
});

export const updateCommentSchema = z.object({
	context: z
		.string({
			required_error: 'you have to provide context for the comment',
		})
		.min(1, 'length must be 1 char least'),
});

export const createReplySchema = z.object({
	commentId: mongooseId,
	parentReply: mongooseId,
	repliesOfReply: z.array(mongooseId).optional(),
	context: z.string(),
});

export const updateReplySchema = z.object({
	context: z.string(),
});
