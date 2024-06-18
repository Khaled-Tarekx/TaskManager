import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFound, BadRequest } from "../../custom-errors/main.js";
import Like from "./models.js";
import mongoose from "mongoose";
import { IUserDocument } from "../users/models.js";

export const getLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Likes = await Like.find();
    res.status(StatusCodes.OK).json({ data: Likes, count: Likes.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
export const getLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const like = await Like.findById(id);
    if (!like) {
      next(new NotFound("no like found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: like });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userLikes = await Like.find({
      owner: (user as IUserDocument).id,
    });
    res
      .status(StatusCodes.OK)
      .json({ data: userLikes, count: userLikes.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserLike = async (
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
    const like = await Like.findOne({
      _id: id,
      owner: (user as IUserDocument).id,
    });
    if (!like) {
      next(new NotFound("no like found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: like });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const createLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const like = Like.create({ ...req.body });
    res.status(StatusCodes.CREATED).json({ data: like });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const deleteLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const likeToDelete = await Like.findByIdAndDelete(id);
    if (!likeToDelete) {
      next(new NotFound("no like found"));
    }
    res
      .status(StatusCodes.OK)
      .json({ msg: "like deleted successfully", data: likeToDelete });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
