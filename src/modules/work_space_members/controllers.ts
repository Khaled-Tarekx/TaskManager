import { NotFound, BadRequest} from "../../../custom-errors/main.js";
import WorkSpaceMembers, {workSpaceMembersInterface} from "./models.js";
import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export const  getMembersOfWorkSpace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {workSpaceId} = req.params
    const members = await WorkSpaceMembers.find({ workspace: workSpaceId }).populate('user')
    res.status(StatusCodes.OK).json({ data: members, count: members.length })
  } catch (err: any) {
    next(new BadRequest(err.message))
  }
}

export const  createMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body
    const member = await WorkSpaceMembers.create(role)
    res.status(StatusCodes.OK).json({ message: `created your member successfully `, data: member })
  } catch (err: any) {
    next(new BadRequest(err.message))
  }
}

export const getMember = async (req: Request, res: Response, next: NextFunction) => {
  const { workspaceId, id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
    }
   if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    next(new BadRequest('Invalid ID format'))
    }
  try {
    const member = await WorkSpaceMembers.findOne({ workspaceId, id });
    if (!member) next(new NotFound(`no member found`))
    
    res.status(StatusCodes.OK).json({ data: member })
  } catch (err: any){
    next(new BadRequest(err.message))
  }
};

export const updateMemberPermissions = async (req: Request, res: Response, next: NextFunction) => {
  const { id, workspaceId } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
  }
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    next(new BadRequest('Invalid ID format'))
  }
  const { role } = req.body
  try { 
    const updatedMember= await WorkSpaceMembers.findOneAndUpdate({ id, workspaceId }, { role },
        { new: true, runValidators: true , context: 'query'});
    if (!updatedMember) next(new NotFound(`no member found with the given id`))
    res.status(StatusCodes.OK).json({ message: 'member updated Successfully', data: updatedMember })

  } catch (err: any) {
    next(new BadRequest(`Error updating member: ${err.message}`))
  }
};

export const deleteMember = async (req: Request, res: Response, next: NextFunction) => {
  const { id, workspaceId } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequest('Invalid ID format'))
  }
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    next(new BadRequest('Invalid ID format'))
  }
  try {
    const MemberToDelete = await WorkSpaceMembers.findOneAndDelete({ workspaceId, id });
    if (!MemberToDelete) next(new NotFound(`no member found`))
      res.status(StatusCodes.OK).json({ message: 'member Deleted Successfully'
    , data: MemberToDelete })

  } catch (err: any) {
    next(new BadRequest(`Error deleting member: ${err.message}`))
}}