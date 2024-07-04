import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFound, BadRequest, UnAuthenticated } from "../../../custom-errors/main.js";
import { ReplyLikeInterface, ReplyLike } from "./models.js";
import mongoose from "mongoose";
import { IUserDocument } from "../users/models.js";

export const getReplyLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const replyLikes = await ReplyLike.find();
    res.status(StatusCodes.OK).json({ data: replyLikes, count: replyLikes.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getReplyLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const replyLike = await ReplyLike.findById(id);
    if (!replyLike) {
      next(new NotFound("no like found with the given id for this reply"));
    }
    res.status(StatusCodes.OK).json({ data: replyLike });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserReplyLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userReplyLikes = await ReplyLike.find({
      owner: (user as IUserDocument).id,
    });
    res
      .status(StatusCodes.OK)
      .json({ data: userReplyLikes, count: userReplyLikes.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserReplyLike = async (
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
    const userReplyLike = await ReplyLike.findOne({
      _id: id,
      owner: (user as IUserDocument).id,
    });
    if (!userReplyLike) {
      next(new NotFound("no like found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: userReplyLike });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const createReplyLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const replyLike = ReplyLike.create({ ...req.body });
    res.status(StatusCodes.CREATED).json({ data: replyLike });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};


export const deleteReplyLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const replyLikeToDelete = await ReplyLike.findByIdAndDelete(id) as ReplyLikeInterface;
    if (req.user !== replyLikeToDelete.owner) {
      next(new UnAuthenticated("you only have permission to delete your like"));

    }

    if (!replyLikeToDelete) {
      next(new NotFound("no like found"));
    }
    res
      .status(StatusCodes.OK)
      .json({ msg: "like deleted successfully", data: replyLikeToDelete });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};


