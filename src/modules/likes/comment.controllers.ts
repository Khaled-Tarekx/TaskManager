import {NextFunction, Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {
	NotFound,
	BadRequest,
	UnAuthenticated,
} from '../../../custom-errors/main.js';
import {CommentLike} from './models.js';
import mongoose from 'mongoose';
import {asyncHandler} from '../auth/middleware.js';
import {createCommentLikeSchema} from './validation.js';

export const getCommentLikes = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const commentLikes = await CommentLike.find({});
		res
			.status(StatusCodes.OK)
			.json({data: commentLikes, count: commentLikes.length});
	}
);

export const getCommentLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const commentLike = await CommentLike.findById(id);
		if (!commentLike) {
			return next(new NotFound('no like found for the given comment'));
		}
		res.status(StatusCodes.OK).json({data: commentLike});
	}
);

export const getUserCommentLikes = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const userCommentLikes = await CommentLike.find({
			owner: user.id,
		});
		res
			.status(StatusCodes.OK)
			.json({data: userCommentLikes, count: userCommentLikes.length});
	}
);

export const getUserCommentLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;
		const user = req.user;
		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const userCommentLike = await CommentLike.findOne({
			_id: id,
			owner: user.id,
		});
		if (!userCommentLike) {
			return next(new NotFound('no like found with the given id'));
		}
		res.status(StatusCodes.OK).json({data: userCommentLike});
	}
);

export const createCommentLike = asyncHandler(
	async (
		req: Request<{}, {}, createCommentLikeSchema>,
		res: Response,
		next: NextFunction
	) => {
		const user = req.user;

		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const {comment} = req.body;

		const commentLike = await CommentLike.create({
			owner: user.id,
			comment,
		});
		res.status(StatusCodes.CREATED).json({data: commentLike});
	}
);

export const deleteCommentLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const commentLikeToDelete = await CommentLike.findByIdAndDelete(id);

		if (!commentLikeToDelete) {
			return next(new NotFound('no like found'));
		}

		if (req.user !== commentLikeToDelete.owner) {
			return next(
				new UnAuthenticated('you only have permission to delete your like')
			);
		}

		res.status(StatusCodes.OK).json({msg: 'like deleted successfully'});
	}
);
