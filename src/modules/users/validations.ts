import { z } from 'zod';

export const updateUserSchema = z.object({
	username: z.string(),
	email: z.string().email({ message: 'email is not correct' }),
});
