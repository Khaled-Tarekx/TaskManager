class LikeNotFound extends Error {
	constructor() {
		super('you havent liked the following resource');
		this.name = 'LikeNotFound';
	}
}

class LikeCreationFailed extends Error {
	constructor() {
		super('like creation failed');
		this.name = 'LikeCreationFailed';
	}
}

class LikeCountUpdateFailed extends Error {
	constructor() {
		super('like count failed to update');
		this.name = 'LikeCountUpdateFailed';
	}
}

class UnLikeFailed extends Error {
	constructor() {
		super('unlike deletion failed');
		this.name = 'UnLikeFailed';
	}
}

export {
	LikeNotFound,
	LikeCreationFailed,
	LikeCountUpdateFailed,
	UnLikeFailed,
};
