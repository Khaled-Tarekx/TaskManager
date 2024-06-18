import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFound, BadRequest } from "../../custom-errors/main.js";
import Reply, { ReplyInterface } from "./models.js";
import mongoose from "mongoose";
import { IUserDocument } from "../users/models.js";

export const getReplies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const replies = await Reply.find();
    res.status(StatusCodes.OK).json({ data: replies, count: replies.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
export const getReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const reply = await Reply.findById(id);
    if (!reply) {
      next(new NotFound("no reply found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: reply });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserReplies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userReplies = await Reply.find({
      owner: (user as IUserDocument).id,
    });
    res
      .status(StatusCodes.OK)
      .json({ data: userReplies, count: userReplies.length });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const getUserReply = async (
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
    const reply = await Reply.findOne({
      _id: id,
      owner: (user as IUserDocument).id,
    });
    if (!reply) {
      next(new NotFound("no reply found with the given id"));
    }
    res.status(StatusCodes.OK).json({ data: reply });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const createReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reply = Reply.create({ ...req.body });
    res.status(StatusCodes.CREATED).json({ data: reply });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};

export const editReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const replyToUpdate = (await Reply.findByIdAndUpdate(
      id,
      { ...req.body, owner: (req.user as IUserDocument).id },
      { new: true, runValidators: true }
    )) as ReplyInterface;
    if (!replyToUpdate) {
      next(new NotFound("no reply found"));
    }
    res
      .status(StatusCodes.OK)
      .json({ msg: "reply updated successfully", data: replyToUpdate });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
export const deleteReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new BadRequest("Invalid ID format"));
    }
    const replyToDelete = await Reply.findByIdAndDelete(id);
    if (!replyToDelete) {
      next(new NotFound("no reply found"));
    }
    res
      .status(StatusCodes.OK)
      .json({ msg: "reply deleted successfully", data: replyToDelete });
  } catch (err: any) {
    next(new BadRequest(err.message));
  }
};
