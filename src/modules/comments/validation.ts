import z from 'zod';
import {mongooseId} from '../../setup/helpers.js';

export const createCommentSchema = z.object({
    context: z
        .string({
            required_error: 'you have to provide context for the comment',
        })
        .min(1, 'length must be 1 char least'),
    owner: z.string({
        required_error: 'owner is required',
        invalid_type_error: 'owner must be a string',
    }),
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

export const commentParamSchema = z.object({
    id: mongooseId,
});
