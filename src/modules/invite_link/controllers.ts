import type { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';
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
import NotFound from '../../custom-errors/not-found';
import Conflict from '../../custom-errors/conflict';
import { MemberCreationFailed } from '../workspaces/members/errors';
import { UserNotFound } from '../auth/errors/cause';
import {
	AuthenticationError,
	CustomError,
	Forbidden,
} from '../../custom-errors/main';
import { LinkExpired, NotResourceOwner } from '../../utills/errors';
import { LoginFirst } from 'src/utills/errors.msg';

export const createInviteLink = asyncHandler(
	async (
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
					next(new AuthenticationError('you have to log in first'));
				case err instanceof WorkspaceNotFound:
					next(new NotFound('workspace not found'));

				case err instanceof WorkspaceOwnerNotFound:
					next(
						new NotFound(
							'you are either not the owner or dont have permissions'
						)
					);
				case err instanceof NotResourceOwner:
					next(new Forbidden('you are either not an owner or not an admin'));
				case err instanceof InviteFailed:
					next(new Conflict('invitation failed, try again'));
				default:
					next(err);
			}
		}
	}
);

export const acceptInvitation = asyncHandler(
	async (
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
					next(new AuthenticationError(LoginFirst));
				case err instanceof inviteLinkNotFound:
					next(new NotFound('invite link maybe incorrect'));
				case err instanceof LinkExpired:
					next(
						new CustomError(
							'This link has expired and is no longer available.',
							StatusCodes.GONE
						)
					);

				case err instanceof MemberCreationFailed:
					next(new Conflict('membership failed, try again'));
				default:
					next(err);
			}
		}
	}
);
