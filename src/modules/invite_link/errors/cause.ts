class WorkspaceNotFound extends Error {
	constructor() {
		super('workspace to invite to not found');
		this.name = 'WorkspaceNotFound';
	}
}
class WorkspaceOwnerNotFound extends Error {
	constructor() {
		super('workspace owner not found');
		this.name = 'WorkspaceOwnerNotFound';
	}
}
class inviteLinkNotFound extends Error {
	constructor() {
		super('invitation failed to create');
		this.name = 'inviteLinkNotFound';
	}
}
class InviteFailed extends Error {
	constructor() {
		super('invite link was not found, token not correct?');
		this.name = 'InviteFailed';
	}
}

export {
	WorkspaceNotFound,
	WorkspaceOwnerNotFound,
	InviteFailed,
	inviteLinkNotFound,
};
