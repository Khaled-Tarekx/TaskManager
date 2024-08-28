class PasswordComparisionError extends Error {}
class PasswordHashingError extends Error {}
class LoginError extends Error {
	constructor() {
		super('either password or email is incorrect');
		this.name = 'LoginError';
	}
}
class RegistrationError extends Error {
	constructor() {
		super('all fields must be entered');
		this.name = 'RegistrationError';
	}
}
class UserNotFound extends Error {
	constructor() {
		super('couldnt find user with the given email or password');
		this.name = 'UserNotFound';
	}
}

class TokenCreationFailed extends Error {
	constructor() {
		super('failed to create the token');
		this.name = 'TokenCreationFailed';
	}
}

export {
	LoginError,
	UserNotFound,
	RegistrationError,
	TokenCreationFailed,
	PasswordComparisionError,
	PasswordHashingError,
};
