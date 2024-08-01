import { NotFound, BadRequest} from "../../../custom-errors/main.js";
import  User  from "./models.js";
import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { asyncHandler } from "../auth/middleware.js";

export const  getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction)=> {
    const users = await User.find()
    res.status(StatusCodes.OK).json({ data: users, count: users.length })
})

export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
     return next(new BadRequest('Invalid ID format'))
    }
    const user = await User.findById(id);
    if (!user) return next(new NotFound(`no user found`))
    res.status(StatusCodes.OK).json({ data: user })
});

export const updateUserInfo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequest('Invalid ID format'))
  }
  const { email, username  } = req.body

    const updatedUser = await User.findByIdAndUpdate(id, { email: email,
      username: username }, { new: true, runValidators: true , context: 'query'});
    if (!updatedUser) return next(new NotFound(`no user found with the given id`))
    res.status(StatusCodes.OK).json({ data: updatedUser })

});


export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequest('Invalid ID format'))
  }
    const userToDelete = await User.findByIdAndDelete(id);
    if (!userToDelete) return next(new NotFound(`no user found`))
      res.status(StatusCodes.OK).json({ message: 'User Deleted Successfully'
    , data: userToDelete })
});