class MemberNotFound extends Error {
	constructor() {
		super('member not found');
		this.name = 'MemberNotFound';
	}
}
class InvalidRole extends Error {
	constructor() {
		super('you have to enter a role between member and admin');
		this.name = 'InvalidRole';
	}
}
class MemberUpdateNotPermitted extends Error {
	constructor() {
		super('you are not allowed to update this member');
		this.name = 'MemberUpdateNotPermitted';
	}
}

class MemberCreationFailed extends Error {
	constructor() {
		super('member creation failed');
		this.name = 'MemberCreationFailed';
	}
}

class MemberUpdatingFailed extends Error {
	constructor() {
		super('member updating failed');
		this.name = 'MemberUpdatingFailed';
	}
}

class MemberDeletionFailed extends Error {
	constructor() {
		super('member deletion failed');
		this.name = 'MemberDeletionFailed';
	}
}

export {
	MemberCreationFailed,
	MemberUpdatingFailed,
	MemberDeletionFailed,
	MemberNotFound,
	InvalidRole,
	MemberUpdateNotPermitted,
};
