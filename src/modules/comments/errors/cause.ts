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
class NotSameCommentOrNotFound extends Error {
	constructor() {
		super(
			'parent not found or parent and child replies are either not from the same comment'
		);
		this.name = 'NotSameCommentOrNotFound';
	}
}
export {
	ReplyNotFound,
	ReplyCreationFailed,
	ReplyUpdateFailed,
	ReplyCountUpdateFailed,
	ReplyDeletionFailed,
	NotSameCommentOrNotFound,
};
