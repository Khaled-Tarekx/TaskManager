import type { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type {
	createInviteSchema,
	acceptInvitationSchema,
} from './validation';

import { type TypedRequestBody } from 'zod-express-middleware';
import { checkUser } from '../../utills/helpers';
import * as InviteServices from './services';
import {
	InviteFailed,
	inviteLinkNotFound,
	WorkspaceNotFound,
	WorkspaceOwnerNotFound,
} from './errors/cause';
import * as ErrorMsg from './errors/msg';
import { MemberCreationFailed } from '../workspaces/members/errors/cause';
import { UserNotFound } from '../auth/errors/cause';
import {
	AuthenticationError,
	Forbidden,
	NotFound,
	Conflict,
	ResourceGone,
} from '../../custom-errors/main';
import { LinkExpired, NotResourceOwner } from '../../utills/errors/cause';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as WorkspaceErrors from '../workspaces/errors/msg';

export const createInviteLink = async (
	req: TypedRequestBody<typeof createInviteSchema>,
	res: Response,
	next: NextFunction
) => {
	const { workspaceId, receiverId } = req.body;
	try {
		const user = req.user;
		checkUser(user);
		const invitation = await InviteServices.createInviteLink(
			{ workspaceId, receiverId },
			user
		);

		res.status(StatusCodes.CREATED).json({ invitation });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof WorkspaceNotFound:
				return next(new NotFound(WorkspaceErrors.WorkspaceNotFound));

			case err instanceof WorkspaceOwnerNotFound:
				return next(new NotFound(ErrorMsg.OwnerNotAssigned));
			case err instanceof NotResourceOwner:
				return next(new Forbidden(ErrorMsg.NotOwnerOrAdmin));
			case err instanceof InviteFailed:
				return next(new Conflict(ErrorMsg.InvitationFailed));
			default:
				return next(err);
		}
	}
};

export const acceptInvitation = async (
	req: TypedRequestBody<typeof acceptInvitationSchema>,
	res: Response,
	next: NextFunction
) => {
	const { token } = req.body;
	try {
		const member = await InviteServices.acceptInvitation(token);

		res.status(StatusCodes.CREATED).json({ member });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof inviteLinkNotFound:
				return next(new NotFound(ErrorMsg.InviteLinkNotFound));
			case err instanceof LinkExpired:
				return next(new ResourceGone(ErrorMsg.InvitationExpired));

			case err instanceof MemberCreationFailed:
				return next(new Conflict(ErrorMsg.MempershipFailed));
			default:
				return next(err);
		}
	}
};
