class ReplyNotFound extends Error {
	constructor() {
		super('Couldnt find the reply correctly, maybe check the given ID');
		this.name = 'ReplyNotFound';
	}
}
class ReplyCreationFailed extends Error {
	constructor() {
		super('reply failed at creation , maybe check the given input');
		this.name = 'ReplyCreationFailed';
	}
}
class ReplyUpdateFailed extends Error {
	constructor() {
		super('couldnt edit the reply correctly, maybe check the given id');
		this.name = 'ReplyUpdateFailed';
	}
}
class ReplyCountUpdateFailed extends Error {
	constructor() {
		super('reply count failed to update in the comment');
		this.name = 'ReplyCountUpdateFailed';
	}
}
class ReplyDeletionFailed extends Error {
	constructor() {
		super('reply failed in the deleting process');
		this.name = 'ReplyDeletionFailed';
	}
}

export {
	ReplyNotFound,
	ReplyCreationFailed,
	ReplyUpdateFailed,
	ReplyCountUpdateFailed,
	ReplyDeletionFailed,
};
