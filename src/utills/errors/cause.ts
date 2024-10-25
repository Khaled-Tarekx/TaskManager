class NotResourceOwner extends Error {
	constructor() {
		super(`you are not the owner of the resource`);
		this.name = 'NotResourceOwner';
	}
}
class NotValidId extends Error {
	constructor() {
		super('Invalid Object Id');
		this.name = 'NotValidId';
	}
}
class WorkspaceMismatch extends Error {
	constructor() {
		super('Creator or assignee does not belong to this workspace');
		this.name = 'WorkspaceMismatch';
	}
}
class LinkExpired extends Error {
	constructor() {
		super('invite link already expired');
		this.name = 'LinkExpired';
	}
}

class ValidationError extends Error {}

export {
	NotResourceOwner,
	NotValidId,
	WorkspaceMismatch,
	LinkExpired,
	ValidationError,
};
