import { NotFound, BadRequest } from "../../../custom-errors/main.js";
import WorkSpaceMembers, {Role, workSpaceMembersInterface} from ".././work_space_members/models.js";
import { NextFunction, Request, Response } from "express"
import uuid from "uuid"
import { StatusCodes } from "http-status-codes";
import inviteLink, {InviteLinkInterface} from "./models.js"
import {IUserDocument} from "../users/models";

export const  createInviteLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baseUrl = 'localhost:7500/invite/'; // Replace with your base URL
    const fullLink = `${baseUrl}${uuid.v4()}`
    console.log(fullLink)
    const { workspace, user } = req.body
    const invite_link = await inviteLink.create({ link: fullLink, user, workspace })
    if (!invite_link) {
      next(new NotFound('error creating invite link'))
    }
    const verifiedInviteLink = await inviteLink.findOne({ link: invite_link.link })
      if (!verifiedInviteLink) {
       next(new NotFound("link verification failed"))
    }

    if (invite_link.expiresAt <= invite_link.createdAt) {
       next(new NotFound('invite link already expired'))
    }

      const member = await WorkSpaceMembers.create({ user: verifiedInviteLink!.user!.id, workspace: verifiedInviteLink!.workspace!.id, role: Role.Member})
    res.status(StatusCodes.OK).json( { data: member,  verifiedInviteLink })
  } catch (err: any) {
    next(new BadRequest(err.message))
  }
}


