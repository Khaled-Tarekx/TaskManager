import { NotFound } from "../../../custom-errors/main.js";
import WorkSpaceMembers, { Role } from ".././work_space_members/models.js";
import { NextFunction, Request, Response } from "express"
import uuid from "uuid"
import { StatusCodes } from "http-status-codes";
import inviteLink from "./models.js"
import {asyncHandler} from "../auth/middleware.js";

export const  createInviteLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const baseUrl = process.env.BASE_URL;
    const fullLink = `${baseUrl}${uuid.v4()}`
    const { workspace, user } = req.body
    const invite_link = await inviteLink.create({ link: fullLink, user, workspace })
    if (!invite_link) {
      return next(new NotFound('error creating invite link'))
    }
    const verifiedInviteLink = await inviteLink.findOne({ link: invite_link.link })
      if (!verifiedInviteLink) {
       return next(new NotFound("link verification failed"))
    }

    if (invite_link.expiresAt <= invite_link.createdAt) {
       return next(new NotFound('invite link already expired'))
    }

    const member = await WorkSpaceMembers.create({ user: verifiedInviteLink!.user!.id, workspace: verifiedInviteLink!.workspace!.id, role: Role.Member})
    res.status(StatusCodes.OK).json( { data: member,  verifiedInviteLink })
});


