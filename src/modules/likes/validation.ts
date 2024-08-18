import z from 'zod';

export const createCommentLikeSchema = z.object({
	commentId: z.string({
		required_error: 'comment is required',
		invalid_type_error: 'comment must be a string',
	}),
});

export const createReplyLikeSchema = z.object({
	replyId: z.string({
		required_error: 'reply is required',
		invalid_type_error: 'reply must be a string',
	}),
});
