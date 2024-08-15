import z from 'zod';
import { validateMongooseId } from '../../setup/helpers.js';
const regexString = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rolesEnum = ['user', 'admin'] as const;
const positionEnum = ['Front-End', 'Back-End'] as const;

export const userValidation = z.object({
	id: validateMongooseId,
	username: z.string({
		required_error: 'Username is required',
		invalid_type_error: 'Username must be a string',
	}),

	email: z
		.string({
			required_error: 'Email is required',
			invalid_type_error: 'Email must be a string',
		})
		.email({ message: 'Invalid email address' })
		.regex(regexString),

	password: z
		.string({
			required_error: 'password is required',
			invalid_type_error: 'password must be a string',
		})
		.min(5, 'password cant be less than 6 characters')
		.max(255, 'password cant be less than 255 characters'),

	isLoggedIn: z
		.boolean({
			invalid_type_error: 'login state must be a boolean',
		})
		.default(false),
	roles: z.enum(rolesEnum).default(rolesEnum[0]),
	position: z.enum(positionEnum).optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const loginValidation = z.object({
	email: z
		.string({
			required_error: 'Email is required',
			invalid_type_error: 'Email must be a string',
		})
		.email({ message: 'Invalid email address' })
		.regex(regexString),

	password: z
		.string({
			required_error: 'password is required',
			invalid_type_error: 'password must be a string',
		})
		.min(5, 'password cant be less than 6 characters')
		.max(255, 'password cant be less than 255 characters'),
});

export type createUserSchema = z.infer<typeof userValidation>;
export type loginSchema = z.infer<typeof loginValidation>;
