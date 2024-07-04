import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFound, BadRequest, UnAuthenticated } from "../../../custom-errors/main.js";
import { CommentLike, CommentLikeInterface } from "./models.js";
import mongoose from "mongoose";
import { IUserDocument } from "../users/models.js";

export const getCommentLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentLikes = await CommentLike.find();
    res.status(StatusCodes.OK).json({ data: commentLikes, count: commentLikes.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
export const getCommentLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const commentLike = await CommentLike.findById(id);
    if (!commentLike) {
      next(new NotFound("no like found with the given id for this comment"));
    }
    res.status(StatusCodes.OK).json({ data: commentLike });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserCommentLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userCommentLikes = await CommentLike.find({
      owner: (user as IUserDocument).id,
    });
    res
      .status(StatusCodes.OK)
      .json({ data: userCommentLikes, count: userCommentLikes.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserCommentLike = async (
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
    const userCommentLike = await CommentLike.findOne({
      _id: id,
      owner: (user as IUserDocument).id,
    });
    if (!userCommentLike) {
      next(new NotFound("no like found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: userCommentLike });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const createCommentLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentLike = CommentLike.create({ ...req.body });
    res.status(StatusCodes.CREATED).json({ data: commentLike });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};


export const deleteCommentLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const commentLikeToDelete = await CommentLike.findByIdAndDelete(id) as CommentLikeInterface;
    if (req.user !== commentLikeToDelete.owner) {
      next(new UnAuthenticated("you only have permission to delete your like"));

    }

    if (!commentLikeToDelete) {
      next(new NotFound("no like found"));
    }
    res
      .status(StatusCodes.OK)
      .json({ msg: "like deleted successfully", data: commentLikeToDelete });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};


