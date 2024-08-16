import { mongooseId } from '../../setup/helpers.js';
import { z } from 'zod';

export const deleteUserValidation = z.object({
	userId: mongooseId,
});

export const updateUserSchema = z.object({
	username: z.string(),
	email: z.string().email({ message: 'email is not correct' }),
});
