import { mongooseId } from 'src/setup/helpers';

import z from 'zod';

export const createReplySchema = z.object({
	comment: mongooseId,
	parentReply: mongooseId,
	repliesOfReply: z.array(mongooseId),
	context: z.string(),
});
export const updateReplySchema = z.object({
	context: z.string(),
});
