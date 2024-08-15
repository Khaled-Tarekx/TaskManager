import z from 'zod';

export const env = z
	.object({
		SALT_ROUNDS: z.number().min(2),
	})
	.parse(process.env);
