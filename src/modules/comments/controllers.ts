import type {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import Comment from './models.js';
import {asyncHandler} from '../auth/middleware.js';
import {isResourceOwner} from '../users/helpers.js';
import {
    findResourceById,
    checkUser, validateObjectIds, checkResource,
} from 'src/setup/helpers.js';
import type {TypedRequestBody} from 'zod-express-middleware';
import type {
    createCommentSchema,
    updateCommentSchema,
} from './validation.js';

export const getTaskComments = asyncHandler(
    async (req: Request, res: Response) => {
        const {taskId} = req.params
        validateObjectIds([taskId])
        const comments = await Comment.find({task: taskId});
        res.status(StatusCodes.OK).json({data: comments, count: comments.length});
    }
);

export const getComment = asyncHandler(
    async (req: Request, res: Response) => {
        const {commentId} = req.params;
        validateObjectIds([commentId])
        const comment = await findResourceById(Comment, commentId);
        res.status(StatusCodes.OK).json({data: comment});
    }
);

export const getUserComments = asyncHandler(
    async (req: Request, res: Response) => {
        const user = req.user;
        const loggedInUser = await checkUser(user);
        const userComments = await Comment.find({
            owner: loggedInUser.id,
        });

        res
            .status(StatusCodes.OK)
            .json({data: userComments, count: userComments.length});
    }
);

export const getUserComment = asyncHandler(
    async (req: Request, res: Response) => {
        const {commentId} = req.params;
        const user = req.user;
        validateObjectIds([commentId])
        const loggedInUser = await checkUser(user);
        const comment = await Comment.findOne({
            _id: commentId,
            owner: loggedInUser.id,
        });
        await checkResource(comment)

        res.status(StatusCodes.OK).json({data: comment});
    }
);

export const createComment = asyncHandler(
    async (
        req: TypedRequestBody<typeof createCommentSchema>,
        res: Response
    ) => {
        const {taskId, context} = req.body;
        validateObjectIds([taskId])
        const user = req.user;
        const loggedInUser = await checkUser(user);

        const comment = await Comment.create({
            owner: loggedInUser.id,
            task: taskId,
            context,
        });
        await checkResource(comment)
        res.status(StatusCodes.CREATED).json({data: comment});
    }
);

export const editComment = asyncHandler(
    async (
        req: TypedRequestBody<typeof updateCommentSchema>,
        res: Response,
    ) => {
        const {commentId} = req.params;
        const user = req.user;
        const {context} = req.body;
        validateObjectIds([commentId])
        const loggedInUser = await checkUser(user);
        const comment = await findResourceById(Comment, commentId);
        await isResourceOwner(loggedInUser.id, comment.owner.id);

        const commentToUpdate = await Comment.findByIdAndUpdate(
            comment.id,
            {context},
            {new: true}
        );

        await checkResource(commentToUpdate)

        res.status(StatusCodes.OK).json({data: commentToUpdate});
    }
);

export const deleteComment = asyncHandler(
    async (req: Request, res: Response) => {
        const user = req.user;
        const {commentId} = req.params;
        validateObjectIds([commentId])

        const loggedInUser = await checkUser(user);
        const comment = await findResourceById(Comment, commentId);
        await isResourceOwner(loggedInUser.id, comment.owner.id);

        await Comment.findByIdAndDelete(comment.id);

        res.status(StatusCodes.OK).json({msg: 'comment deleted successfully'});
    }
);
