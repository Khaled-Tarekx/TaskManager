class UserUpdatingFailed extends Error {
	constructor() {
		super('user updating failed');
		this.name = 'UserUpdatingFailed';
	}
}

class UserDeletionFailed extends Error {
	constructor() {
		super('user deletion failed');
		this.name = 'UserDeletionFailed';
	}
}

export { UserUpdatingFailed, UserDeletionFailed };
