import z from 'zod';
import { validateMongooseId } from '../../setup/helpers.js';

export const commentValidation = z.object({
	context: z
		.string({
			required_error: 'you have to provide context for the comment',
		})
		.min(1, 'length must be 1 char least'),
	owner: z.string({
		required_error: 'owner is required',
		invalid_type_error: 'owner must be a string',
	}),
	task: z.string({
		required_error: 'task is required',
		invalid_type_error: 'task must be a string',
	}),
});
export const commentParamValidation = z.object({
	commentId: validateMongooseId,
});

export type CommentCreateSchema = z.infer<typeof commentValidation>;
