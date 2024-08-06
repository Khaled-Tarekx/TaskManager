import {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {BadRequest, NotFound, UnAuthenticated,} from "../../../custom-errors/main.js";
import Comment,{CommentSchema} from "./models.js";
import mongoose, { HydratedDocument, HydratedDocumentFromSchema} from "mongoose";
import {asyncHandler} from "../auth/middleware.js";
import { userSchemaWithId } from "../auth/validation.js";
import { CommentCreateSchema } from "./validation.js";


export const getComments = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const comments = await Comment.find({});
    res.status(StatusCodes.OK).json({data: comments, count: comments.length});

});

export const getComment = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const comment = await Comment.findById(id);
    if (!comment) {
        return next(new NotFound("no comment found with the given id"));
    }
    res.status(StatusCodes.OK).json({data: comment});
});

export const getUserComments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userComments = await Comment.find({
        owner: (user as userSchemaWithId).id,
    });
    res.status(StatusCodes.OK).json({data: userComments, count: userComments.length});
});

export const getUserComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const comment = await Comment.findOne({
        _id: id,
        owner: (user as userSchemaWithId).id,
    });
    if (!comment) {
        return next(new NotFound("no comment found with the given id"));
    }
    res.status(StatusCodes.OK).json({data: comment});

});

export const createComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {owner, task, context}: CommentCreateSchema = req.body
    const comment = await Comment.create({owner, task, context});
    res.status(StatusCodes.CREATED).json({data: comment});
});

export const editComment = asyncHandler(async (req: Request<{ id: string },{}, CommentCreateSchema>, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const { context } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const commentToUpdate = await Comment.findByIdAndUpdate(
        id,
        { context },
        {new: true, runValidators: true}
    )

    if (!commentToUpdate) {
        return next(new NotFound("no comment found"));
    }

    if (req.user !== commentToUpdate.owner) {
        return next(new UnAuthenticated("you only have permission to update your comments"))
    }

    res.status(StatusCodes.OK).json({msg: "comment updated successfully", data: commentToUpdate});
});

export const deleteComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const commentToDelete = await Comment.findByIdAndDelete(id)

    if (!commentToDelete) {
        return next(new NotFound("no comment found"));
    }

    if (req.user !== commentToDelete.owner) {
        return next(new UnAuthenticated("you only have permission to update your comments"))
    }

    res.status(StatusCodes.OK).json({msg: "comment deleted successfully", data: commentToDelete});

});
