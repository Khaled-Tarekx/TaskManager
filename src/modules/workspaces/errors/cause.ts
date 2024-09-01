class WorkspaceNotFound extends Error {
	constructor() {
		super('workspace not found');
		this.name = 'WorkspaceNotFound';
	}
}

class WorkspaceCreationFailed extends Error {
	constructor() {
		super('workspace creation failed');
		this.name = 'WorkspaceCreationFailed';
	}
}

class WorkspaceUpdatingFailed extends Error {
	constructor() {
		super('workspace updating failed');
		this.name = 'WorkspaceUpdatingFailed';
	}
}

class WorkspaceDeletionFailed extends Error {
	constructor() {
		super('workspace deletion failed');
		this.name = 'WorkspaceDeletionFailed';
	}
}

export {
	WorkspaceCreationFailed,
	WorkspaceUpdatingFailed,
	WorkspaceDeletionFailed,
	WorkspaceNotFound,
};
