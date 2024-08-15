import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
	BadRequest,
	NotFound,
	UnAuthenticated,
} from '../../../custom-errors/main.js';
import Comment from './models.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../auth/middleware.js';
import { CommentCreateSchema } from './validation.js';
import { isResourceOwner } from '../users/helpers.js';
import { findResourceById } from 'src/setup/helpers.js';

export const getComments = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const comments = await Comment.find({});
		res
			.status(StatusCodes.OK)
			.json({ data: comments, count: comments.length });
	}
);

export const getComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const comment = await Comment.findById(id);
		if (!comment) {
			return next(new NotFound('no comment found with the given id'));
		}
		res.status(StatusCodes.OK).json({ data: comment });
	}
);

export const getUserComments = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;

		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		const userComments = await Comment.find({
			owner: user.id,
		});
		res
			.status(StatusCodes.OK)
			.json({ data: userComments, count: userComments.length });
	}
);

export const getUserComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const user = req.user;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}

		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const comment = await Comment.findOne({
			_id: id,
			owner: user.id,
		});

		if (!comment) {
			return next(new NotFound('no comment found with the given id'));
		}

		res.status(StatusCodes.OK).json({ data: comment });
	}
);

export const createComment = asyncHandler(
	async (
		req: Request<{}, {}, CommentCreateSchema>,
		res: Response,
		next: NextFunction
	) => {
		const { owner, task, context } = req.body;
		const comment = await Comment.create({ owner, task, context });
		res.status(StatusCodes.CREATED).json({ data: comment });
	}
);

export const editComment = asyncHandler(
	async (
		req: Request<
			{
				commentId: string;
			},
			{},
			CommentCreateSchema
		>,
		res: Response,
		next: NextFunction
	) => {
		const { commentId } = req.params;
		const user = req.user;
		if (!user?.id) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const { context } = req.body;
		const comment = await findResourceById(Comment, commentId);
		if (!comment) {
			return next(new NotFound('comment not found'));
		}
		if (!isResourceOwner(user.id, comment.owner.toString())) {
			return next(
				new UnAuthenticated('you are the not the owner of this resource')
			);
		}

		const commentToUpdate = await Comment.findByIdAndUpdate(
			comment.id,
			{ context },
			{ new: true }
		);

		if (!commentToUpdate) {
			return next(new NotFound('no comment found'));
		}

		res.status(StatusCodes.OK).json({ data: commentToUpdate });
	}
);

export const deleteComment = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.params;

		const commentToDelete = await Comment.findByIdAndDelete(commentId);

		if (!commentToDelete) {
			return next(new NotFound('no comment found'));
		}

		if (req.user !== commentToDelete.owner) {
			return next(
				new UnAuthenticated(
					'you only have permission to update your comments'
				)
			);
		}

		res.status(StatusCodes.OK).json({ msg: 'comment deleted successfully' });
	}
);
