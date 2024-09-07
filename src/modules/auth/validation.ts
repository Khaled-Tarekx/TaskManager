import z from 'zod';
import { Position, Roles } from './types';

const regexString = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUserSchema = z.object({
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

	password: z.string({
		required_error: 'password is required',
		invalid_type_error: 'password must be a string',
	}),

	isLoggedIn: z
		.boolean({
			invalid_type_error: 'login state must be a boolean',
		})
		.default(false)
		.optional(),
	roles: z.nativeEnum(Roles).default(Roles.user).optional(),
	position: z.nativeEnum(Position),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const loginSchema = z.object({
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

export const refreshTokenSchema = z.object({
	refresh_token: z.string({
		required_error: 'refresh Token is required',
		invalid_type_error: 'refresh Token must be a string',
	}),
});

export const resetPasswordSchema = z.object({
	email: z.string({
		required_error: 'email is required',
		invalid_type_error: 'email must be a string',
	}),
});

export const changePasswordSchema = z.object({
	oldPassword: z.string({
		required_error: 'old password is required',
		invalid_type_error: 'old password must be a string',
	}),
	password: z.string({
		required_error: 'password is required',
		invalid_type_error: 'password must be a string',
	}),
});
