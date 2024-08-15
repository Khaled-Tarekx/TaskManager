import z from 'zod';

export const createCommentLike = z.object({
	comment: z.string({
		required_error: 'comment is required',
		invalid_type_error: 'comment must be a string',
	}),
});

export const createReplyLike = z.object({
	reply: z.string({
		required_error: 'reply is required',
		invalid_type_error: 'reply must be a string',
	}),
});

export type createCommentLikeSchema = z.infer<typeof createCommentLike>;
export type createReplyLikeSchema = z.infer<typeof createReplyLike>;
