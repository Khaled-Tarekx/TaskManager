import {NotFound} from '../../../custom-errors/main.js';
import type {NextFunction, Response} from 'express';

import {StatusCodes} from 'http-status-codes';
import InviteLink from './models.js';
import {asyncHandler} from '../auth/middleware.js';
import type {
    createInviteSchema,
    acceptInvitationSchema,
} from './validation.js';
import {
    findResourceById,
    checkUser,
} from 'src/setup/helpers.js';
import {type TypedRequestBody} from 'zod-express-middleware';
import Members from '../work_space_members/models.js';
import {Role} from '../work_space_members/types.js';
import WorkSpace from '../work_spaces/models.js';
import {isResourceOwner} from '../users/helpers.js';

export const createInviteLink = asyncHandler(
    async (req: TypedRequestBody<typeof createInviteSchema>, res: Response) => {
        const {workspaceId, receiverId} = req.body;
        const user = req.user;
        const loggedInUser = await checkUser(user);
        const workspace = await findResourceById(WorkSpace, workspaceId);
        await isResourceOwner(loggedInUser.id, workspace.owner.id);

        const invitation = await InviteLink.create({
            receiver: receiverId,
            workspace: workspaceId,
        });

        res.status(StatusCodes.OK).json({invitation});
    }
);

export const acceptInvitation = asyncHandler(
    async (
        req: TypedRequestBody<typeof acceptInvitationSchema>,
        res: Response,
        next: NextFunction
    ) => {
        const {token} = req.body;

        const invitation = await InviteLink.findOne({
            token,
        });

        if (!invitation) {
            return next(new NotFound('invitation not found'))
        }

        if (invitation.expiresAt <= invitation.createdAt) {
            return next(new NotFound('invite link already expired'));
        }
        
        const member = await Members.create({
            member: invitation.receiver.id,
            workspace: invitation.workspace.id,
            role: Role.member,
        });

        res.status(StatusCodes.OK).json({member});
    }
);
