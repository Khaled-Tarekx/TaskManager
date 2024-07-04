import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  NotFound,
  BadRequest,
  UnAuthenticated,
} from "../../../custom-errors/main.js";
import Comment, { CommentInterface } from "./models.js";
import mongoose from "mongoose";
import { IUserDocument } from "src/modules/users/models.js";

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await Comment.find();
    res.status(StatusCodes.OK).json({ data: comments, count: comments.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      next(new NotFound("no comment found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: comment });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userComments = await Comment.find({
      owner: (user as IUserDocument).id,
    });
    res
      .status(StatusCodes.OK)
      .json({ data: userComments, count: userComments.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const comment = await Comment.findOne({
      _id: id,
      owner: (user as IUserDocument).id,
    });
    if (!comment) {
      next(new NotFound("no comment found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: comment });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = Comment.create({ ...req.body });
    res.status(StatusCodes.CREATED).json({ data: comment });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const editComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const commentToUpdate = (await Comment.findByIdAndUpdate(
      id,
      { ...req.body, owner: (req.user as IUserDocument).id },
      { new: true, runValidators: true }
    )) as CommentInterface;

    if (req.user !== commentToUpdate.owner) {
      next(new UnAuthenticated("you only have permission to update your comments"))
    }


    if (!commentToUpdate) {
      next(new NotFound("no comment found"));
    }

    res
      .status(StatusCodes.OK)
      .json({ msg: "comment updated successfully", data: commentToUpdate });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const commentToDelete = await Comment.findByIdAndDelete(id) as CommentInterface;

    if (req.user !== commentToDelete.owner) {
      next(new UnAuthenticated("you only have permission to update your comments"))
    }

    if (!commentToDelete) {
      next(new NotFound("no comment found"));
    }


    res
      .status(StatusCodes.OK)
      .json({ msg: "comment deleted successfully", data: commentToDelete });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
