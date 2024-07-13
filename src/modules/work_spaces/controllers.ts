import { NotFound, BadRequest} from "../../../custom-errors/main.js";
import WorkSpace from "./models.js";
import WorkSpaceMembers, { Role } from "../work_space_members/models.js";

import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import {IUserDocument} from "../users/models";

export const  getWorkSpaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workSpaces = await WorkSpace.find()
    res.status(StatusCodes.OK).json({ data: workSpaces, count: workSpaces.length })
  } catch (err: any) {
    next(new BadRequest(err.message))
  }
}


export const  createWorkSpace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type } = req.body
    const user = req.user
    const workSpace = await WorkSpace.create({ name, type })
      const owner = await WorkSpaceMembers.create({
      role: Role.Owner,
      user: (user as IUserDocument).id,
      workspace: workSpace.id,
    });
    res.status(StatusCodes.OK).json({ message: `created your work space ${ name } successfully `, data: { workSpace, owner } })
  } catch (err: any) {
    next(new BadRequest(err.message))
  }
}
export const getWorkSpace = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
    }
  try {
    const workSpace = await WorkSpace.findById(id);
    if (!workSpace) next(new NotFound(`no workSpace found`))
    
    res.status(StatusCodes.OK).json({ data: workSpace })
  } catch (err: any){
    next(new BadRequest(err.message))
  }
};

export const updateWorkSpace = async (req: Request, res: Response, next: NextFunction) => {
  // potato trial code
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
  }
  const { name } = req.body
  try { 
    const updatedWorkSpace = await WorkSpace.findByIdAndUpdate(id, { name },
        { new: true, runValidators: true , context: 'query'});
    if (!updatedWorkSpace) next(new NotFound(`no WorkSpace found with the given id`))
    res.status(StatusCodes.OK).json({ message: 'Work Space updated Successfully', data: updatedWorkSpace })

  } catch (err: any){
    next(new BadRequest(`Error updating Work Space: ${err.message}`))
  }
};



export const deleteWorkSpace = async (req: Request, res: Response, next: NextFunction) => {
  // potato trial code
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
  }

  try {
    const workSpaceToDelete = await WorkSpace.findByIdAndDelete(id);
    if (!workSpaceToDelete) next(new NotFound(`no workSpace found`))
      res.status(StatusCodes.OK).json({ message: 'Work Space Deleted Successfully'
    , data: workSpaceToDelete })

  } catch (err: any) {
    next(new BadRequest(`Error deleting Work Space: ${err.message}`))
}}

