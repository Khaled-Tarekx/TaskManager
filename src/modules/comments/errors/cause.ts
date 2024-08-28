class CommentNotFound extends Error {}
class CommentCreationFailed extends Error {}
class CommentUpdateFailed extends Error {}
class CommentCountUpdateFailed extends Error {}
class CommentDeletionFailed extends Error {}

export {
	CommentNotFound,
	CommentCreationFailed,
	CommentCountUpdateFailed,
	CommentUpdateFailed,
	CommentDeletionFailed,
};
