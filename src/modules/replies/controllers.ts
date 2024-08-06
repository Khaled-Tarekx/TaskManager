import {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {BadRequest, NotFound} from "../../../custom-errors/main.js";
import Reply, {ReplyInterface} from "./models.js";
import mongoose from "mongoose";
import {asyncHandler} from "../auth/middleware.js";
import { userSchemaWithId } from "../auth/validation.js";

export const getReplies = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const replies = await Reply.find();
    res.status(StatusCodes.OK).json({data: replies, count: replies.length});
});

export const getReply = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const reply = await Reply.findById(id);
    if (!reply) {
        return next(new NotFound("no reply found with the given id"));
    }
    res.status(StatusCodes.OK).json({data: reply});
});

export const getUserReplies = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userReplies = await Reply.find({
        owner: (user as userSchemaWithId).id,
    });
    res.status(StatusCodes.OK).json({data: userReplies, count: userReplies.length});
});

export const getUserReply = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const reply = await Reply.findOne({
        _id: id,
        owner: (user as userSchemaWithId).id,
    });
    if (!reply) {
        return next(new NotFound("no reply found with the given id"));
    }
    res.status(StatusCodes.OK).json({data: reply});
});

export const createReply = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const reply = Reply.create({...req.body});
    res.status(StatusCodes.CREATED).json({data: reply});
});

export const editReply = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const replyToUpdate = (await Reply.findByIdAndUpdate(
        id,
        {...req.body, owner: (req.user as userSchemaWithId).id},
        {new: true, runValidators: true}
    )) as ReplyInterface;
    if (!replyToUpdate) {
        return next(new NotFound("no reply found"));
    }
    res.status(StatusCodes.OK).json({msg: "reply updated successfully", data: replyToUpdate});
});
export const deleteReply = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const replyToDelete = await Reply.findByIdAndDelete(id);
    if (!replyToDelete) {
        return next(new NotFound("no reply found"));
    }
    res.status(StatusCodes.OK).json({msg: "reply deleted successfully", data: replyToDelete});

});
