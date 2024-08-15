import {NextFunction, Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {
	BadRequest,
	NotFound,
	UnAuthenticated,
} from '../../../custom-errors/main.js';
import {ReplyLike} from './models.js';
import mongoose from 'mongoose';
import {asyncHandler} from '../auth/middleware.js';
import {createReplyLikeSchema} from './validation.js';

export const getReplyLikes = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const replyLikes = await ReplyLike.find();
		res
			.status(StatusCodes.OK)
			.json({data: replyLikes, count: replyLikes.length});
	}
);

export const getReplyLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const replyLike = await ReplyLike.findById(id);
		if (!replyLike) {
			return next(
				new NotFound('no like found with the given id for this reply')
			);
		}
		res.status(StatusCodes.OK).json({data: replyLike});
	}
);

export const getUserReplyLikes = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const userReplyLikes = await ReplyLike.find({
			owner: user.id,
		});
		res
			.status(StatusCodes.OK)
			.json({data: userReplyLikes, count: userReplyLikes.length});
	}
);

export const getUserReplyLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;
		const user = req.user;

		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}

		const userReplyLike = await ReplyLike.findOne({
			_id: id,
			owner: user.id,
		});
		if (!userReplyLike) {
			return next(new NotFound('no like found with the given id'));
		}
		res.status(StatusCodes.OK).json({data: userReplyLike});
	}
);

export const createReplyLike = asyncHandler(
	async (
		req: Request<{}, {}, createReplyLikeSchema>,
		res: Response,
		next: NextFunction
	) => {
		const user = req.user;

		if (!user) {
			return next(new UnAuthenticated('log in first to grant access'));
		}
		const {reply} = req.body;

		const replyLike = ReplyLike.create({
			owner: user.id,
			reply,
		});
		res.status(StatusCodes.CREATED).json({data: replyLike});
	}
);

export const deleteReplyLike = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}

		const replyLikeToDelete = await ReplyLike.findByIdAndDelete(id);

		if (!replyLikeToDelete) {
			return next(new NotFound('no like found'));
		}

		if (req.user !== replyLikeToDelete.owner) {
			return next(
				new UnAuthenticated('you only have permission to delete your like')
			);
		}
		res.status(StatusCodes.OK).json({msg: 'like deleted successfully'});
	}
);
