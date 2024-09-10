import {
	Roles,
	changePasswordDTO,
	type createUserDTO,
	type loginDTO,
	refreshSessionDTO,
	resetpasswordDTO,
} from './types';
import User from '../users/models';
import { checkResource } from '../../utills/helpers';
import { UserNotFound } from './errors/cause';
import { supabase } from './supabase';
import { UserUpdatingFailed } from '../users/errors/cause';
import { AuthError } from '@supabase/supabase-js';

export const registerUser = async (userInput: createUserDTO) => {
	const { username, email, password, position } = userInput;
	const user = await User.create({
		username,
		email,
		position,
	});

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: { data: { position, role: Roles.user, id: user._id } },
	});

	if (
		(error && error.name === 'AuthApiError') ||
		(error && error.name === 'AuthRetryableFetchError')
	) {
		await user.deleteOne();
		throw new AuthError(error.message);
	}

	return data;
};

export const loginUser = async (logininput: loginDTO) => {
	const { email, password } = logininput;
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		throw new AuthError(error.message);
	}
	const updatedUser = await User.findOneAndUpdate(
		{ email: data.user.email },
		{ isLoggedIn: true },
		{ new: true }
	);
	checkResource(updatedUser, UserUpdatingFailed);
	const jwtToken = data.session.access_token;
	const refreshToken = data.session.refresh_token;
	const userData = {
		email: data.user.email,
		supa_id: data.user.id,
		id: updatedUser._id,
	};
	return { jwtToken, refreshToken, userData };
};

export const refreshSession = async (tokenInput: refreshSessionDTO) => {
	const { refresh_token } = tokenInput;
	const { data, error } = await supabase.auth.refreshSession({
		refresh_token,
	});

	if (error) {
		throw new AuthError(error.message);
	}

	return data;
};

export const resetPassword = async (resetPasswordInput: resetpasswordDTO) => {
	const { email } = resetPasswordInput;
	const { data: userList, error: userError } =
		await supabase.auth.admin.listUsers();

	if (userError) {
		throw new AuthError(userError.message);
	}

	const user = userList.users.find((user) => user.email === email);

	if (!user) {
		throw new UserNotFound();
	}

	const { data, error } = await supabase.auth.resetPasswordForEmail(email);

	if (error) {
		throw new AuthError(error.message);
	}
	return data;
};

export const changePassword = async (
	changePasswordInput: changePasswordDTO
) => {
	const { oldPassword, password } = changePasswordInput;
	const { error: sessionError } = await supabase.auth.getSession();
	if (sessionError) throw new AuthError(sessionError.message);
	const {
		data: { user },
		error: getUserError,
	} = await supabase.auth.getUser();
	if (getUserError) throw new AuthError(getUserError.message);
	if (!user || !user.email)
		throw new AuthError('User not found or email not available');

	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: oldPassword,
	});

	if (signInError) {
		throw new AuthError(signInError.message);
	}

	const { data, error: updateError } = await supabase.auth.updateUser({
		password,
	});

	if (updateError) {
		throw new AuthError(updateError.message);
	}
	return data;
};
