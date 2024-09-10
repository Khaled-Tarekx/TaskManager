import User, { UserSchema } from '../users/models';
import jwt from 'jsonwebtoken';

import { compare, hash } from 'bcrypt';
import type { InferRawDocType } from 'mongoose';
import {
	PasswordComparisionError,
	PasswordHashingError,
	UserNotFound,
} from './errors/cause';

export const createTokenFromUser = async (
	user: InferRawDocType<UserSchema>,
	secret: string,
	expires?: string
) => {
	const tokenUser = await User.findOne({ email: user.email });

	if (!tokenUser) {
		throw UserNotFound;
	}

	return jwt.sign({ id: tokenUser._id, roles: tokenUser.roles }, secret, {
		expiresIn: expires,
	});
};

export const comparePassword = async (
	normalPassword: string,
	hashedPassword: string | undefined
): Promise<Boolean> => {
	if (!hashedPassword) {
		throw new PasswordComparisionError(
			'password doesnt match the user password'
		);
	}
	return compare(normalPassword, hashedPassword);
};

export const hashPassword = async (
	normalPassword: string,
	saltRounds: string | undefined
): Promise<string> => {
	if (!normalPassword) {
		throw new PasswordHashingError(
			'the hashing process of the password failed'
		);
	}
	return hash(normalPassword, Number(saltRounds));
};

// export const sendCustomEmail = async (
// 	toEmail: string,
// 	subject: string,
// 	message: string
// ) => {
// 	try {
// 		return emailQueue.add({
// 			from: `<"${process.env.ADMIN_USERNAME}">, <"${process.env.ADMIN_EMAIL}">`,
// 			to: toEmail,
// 			subject,
// 			text: message,
// 			date: moment(new Date()).format('DD MM YYYY hh:mm:ss'),
// 		});
// 	} catch (err: unknown) {
// 		return new MailFailedToSend();
// 	}
// };
/* 
supabase.auth.onAuthStateChange(async (event, session) => {
	switch (event) {
		case 'SIGNED_IN':
			if (session?.user?.email) {
				await sendCustomEmail(
					session.user.email,
					'Welcome to Our App!',
					'<h1>Welcome!</h1><p>Thanks for signing up.</p>'
				);
			}
			break;
		case 'PASSWORD_RECOVERY':
			if (session?.user?.email) {
				const resetLink = `http://localhost:7500/reset-password?token=${session.access_token}`;
				console.log(session.access_token);

				console.log(session.user.email);
				await sendCustomEmail(
					session.user.email,
					'Password Reset Request',
					`<h1>Password Reset</h1><p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
				);
			}
			break;
	}
});
 */
