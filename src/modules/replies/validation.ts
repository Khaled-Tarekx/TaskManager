import { validateMongooseId } from 'src/setup/helpers';

import z from 'zod';

export const createReplyValidation = z.object({
	comment: validateMongooseId,
	owner: validateMongooseId,
	parentReply: validateMongooseId,
	repliesOfReply: z.array(validateMongooseId),
	context: z.string(),
});

export type createReplySchema = z.infer<typeof createReplyValidation>;

export const updateReplyValidation = z.object({
	context: z.string(),
});
