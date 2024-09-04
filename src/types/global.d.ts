import 'dotenv/config';
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			URI: string;
			PORT: string;
			SALT_ROUNTS: string;
			ACCESS_SECRET_KEY: string;
			REFRESH_SECRET_KEY: string;
			ACCESS_EXPIRE: string;
			REFRESH_EXPIRE: string;
			ADMIN_EMAIL: string;
			ADMIN_PASSWORD: string;
			ADMIN_USERNAME: string;
			MAILER_HOST: string;
			SERVICE: string;
			MAILER_PORT: string;
			SECURE: string;
			DEBUG: string;
			BASE_URL: string;
			DEFAULT_EXPIRATION_CASHE: string;
		}
	}
}
