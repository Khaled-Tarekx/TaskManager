class LoginError extends Error {}
class RegistrationError extends Error {}
class UserNotFound extends Error {}
class PasswordNotFound extends Error {}
class TokenCreationFailed extends Error {}
class PasswordComparisionError extends Error {}
class PasswordHashingError extends Error {}
export {
	LoginError,
	UserNotFound,
	RegistrationError,
	TokenCreationFailed,
	PasswordNotFound,
	PasswordComparisionError,
	PasswordHashingError,
};
