import { NotFound, BadRequest} from "../../custom-errors/main.js";
import  User  from "./models.js";
import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export const  getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find()
    res.status(StatusCodes.OK).json({ data: users, count: users.length })
  } catch (err: any) {
    next(new BadRequest(err.message))
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
    }
  try {
    const user = await User.findById(id);
    if (!user) next(new NotFound(`no user found`))
    
    res.status(StatusCodes.OK).json({ data: user })
  } catch (err: any){
    next(new BadRequest(err.message))
  }
};

export const updateUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  // potato trial code
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
  }
  const { email, username  } = req.body
  try { 
    const updatedUser = await User.findByIdAndUpdate(id, { email: email,
      username: username }, { new: true, runValidators: true , context: 'query'});
    if (!updatedUser) next(new NotFound(`no user found with the given id`))
    res.status(StatusCodes.OK).json({ data: updatedUser })

  } catch (err: any){
    next(new BadRequest(`Error updating user: ${err.message}`))
  }
};



export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  // potato trial code
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
  }

  try {
    const userToDelete = await User.findByIdAndDelete(id);
    if (!userToDelete) next(new NotFound(`no user found`))
      res.status(StatusCodes.OK).json({ message: 'User Deleted Successfully'
    , data: userToDelete })

  } catch (err: any) {
    next(new BadRequest(`Error deleting user: ${err.message}`))
}}