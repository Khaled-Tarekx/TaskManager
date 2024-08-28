class CommentNotFound extends Error {
	constructor() {
		super('Couldnt find the comment correctly, maybe check the given ID');
		this.name = 'CommentNotFound';
	}
}
class CommentCreationFailed extends Error {
	constructor() {
		super('comment failed at creation , maybe check the given input');
		this.name = 'CommentCreationFailed';
	}
}
class CommentUpdateFailed extends Error {
	constructor() {
		super('couldnt edit the comment correctly, maybe check the given id');
		this.name = 'CommentUpdateFailed';
	}
}
class CommentCountUpdateFailed extends Error {
	constructor() {
		super('comment count failed to update in the task');
		this.name = 'CommentCountUpdateFailed';
	}
}
class CommentDeletionFailed extends Error {
	constructor() {
		super('reply failed in the deleting process');
		this.name = 'ReplyDeletionFailed';
	}
}

export {
	CommentNotFound,
	CommentCreationFailed,
	CommentCountUpdateFailed,
	CommentUpdateFailed,
	CommentDeletionFailed,
};
