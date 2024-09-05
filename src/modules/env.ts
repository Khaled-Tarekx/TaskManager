import z from 'zod';

export const env = z
	.object({
		SALT_ROUNDS: z.number().min(2),
		URI: z.string(),
		PORT: z.string(),
		SALT_ROUNTS: z.string(),
		ACCESS_SECRET_KEY: z.string(),
		REFRESH_SECRET_KEY: z.string(),
		ACCESS_EXPIRE: z.string(),
		REFRESH_EXPIRE: z.string(),
		ADMIN_EMAIL: z.string(),
		ADMIN_PASSWORD: z.string(),
		ADMIN_USERNAME: z.string(),
		MAILER_HOST: z.string(),
		SERVICE: z.string(),
		MAILER_PORT: z.string(),
		SECURE: z.string(),
		DEBUG: z.string(),
		BASE_URL: z.string(),
		DEFAULT_EXPIRATION_CASHE: z.string(),
		SUBABASE_API_KEY: z.string(),
		SUBABASE_URL: z.string(),
	})
	.parse(process.env);
