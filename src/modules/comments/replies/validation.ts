import { mongooseId } from '../../../utills/helpers';

import z from 'zod';

export const createReplySchema = z.object({
	commentId: mongooseId,
	parentReply: mongooseId.optional(),
	repliesOfReply: z.array(mongooseId).optional(),
	context: z.string(),
});
export const updateReplySchema = z.object({
	context: z.string(),
});
