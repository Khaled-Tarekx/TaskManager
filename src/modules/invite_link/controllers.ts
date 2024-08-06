import { NotFound } from "../../../custom-errors/main.js";
import WorkSpaceMembers, { Role } from ".././work_space_members/models.js";
import { NextFunction, Request, Response } from "express"

import { StatusCodes } from "http-status-codes";
import InviteLink from "./models.js"
import {asyncHandler} from "../auth/middleware.js";
import { createInviteLinkSchema } from "./validation.js";

export const  createInviteLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // const baseUrl = `/:workspaceId/invite/`
 
    const { workspaceId, userId }: createInviteLinkSchema = req.body
    const inviteLink = await InviteLink.create({ userId, workspaceId })

    if (!inviteLink) {
      return next(new NotFound('error creating invite link'))
    }

    const verifiedInviteLink = await InviteLink.findOne({ link: inviteLink.path })
    
    if (!verifiedInviteLink) {
       return next(new NotFound("link verification failed"))
    }

    if (inviteLink.expiresAt <= inviteLink.createdAt) {
       return next(new NotFound('invite link already expired'))
    }

    // const member = await WorkSpaceMembers.create({ user: verifiedInviteLink.user.id,
    //    workspace: verifiedInviteLink.workspace.id, role: Role.Member}) // TODO:  accept invite link
    const relativeUrl = `/${workspaceId}/invite/${inviteLink.path}`

    res.status(StatusCodes.OK).json( { relativeUrl })
});

