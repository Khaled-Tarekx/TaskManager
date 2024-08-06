import {BadRequest, NotFound} from "../../../custom-errors/main.js";
import WorkSpace from "./models.js";
import WorkSpaceMembers, {Role} from "../work_space_members/models.js";

import {NextFunction, Request, Response} from "express"
import {StatusCodes} from "http-status-codes";
import mongoose from "mongoose";
import {asyncHandler} from "../auth/middleware.js";
import { userSchemaWithId } from "../auth/validation.js";

export const getWorkSpaces = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const workSpaces = await WorkSpace.find()
    res.status(StatusCodes.OK).json({data: workSpaces, count: workSpaces.length})
});


export const createWorkSpace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {name, type} = req.body
    const user = req.user
    const workSpace = await WorkSpace.create({ name, type })
    const owner = await WorkSpaceMembers.create({
        role: Role.Owner,
        user: (user as userSchemaWithId).id,
        workspace: workSpace.id,
    });
    res.status(StatusCodes.OK).json({
        message: `created your work space ${name} successfully `,
        data: {workSpace, owner}
    })
});

export const getWorkSpace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest('Invalid ID format'))
    }
    const workSpace = await WorkSpace.findById(id);
    if (!workSpace) return next(new NotFound(`no workSpace found`))

    res.status(StatusCodes.OK).json({data: workSpace})
});

export const updateWorkSpace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params
    const {name} = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest('Invalid ID format'))
    }

    const updatedWorkSpace = await WorkSpace.findByIdAndUpdate(id, {name},
        {new: true, runValidators: true, context: 'query'});
    if (!updatedWorkSpace) return next(new NotFound(`no WorkSpace found with the given id`))
    res.status(StatusCodes.OK).json({message: 'Work Space updated Successfully', data: updatedWorkSpace})
});

export const deleteWorkSpace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest('Invalid ID format'))
    }
    const workSpaceToDelete = await WorkSpace.findByIdAndDelete(id);
    if (!workSpaceToDelete) return next(new NotFound(`no workSpace found`))
    res.status(StatusCodes.OK).json({
        message: 'Work Space Deleted Successfully'
        , data: workSpaceToDelete
    })
});