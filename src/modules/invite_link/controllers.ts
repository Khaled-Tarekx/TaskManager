import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware.js';
import type {
	createInviteSchema,
	acceptInvitationSchema,
} from './validation.js';

import { type TypedRequestBody } from 'zod-express-middleware';

import * as InviteServices from './services.js';

export const createInviteLink = asyncHandler(
	async (req: TypedRequestBody<typeof createInviteSchema>, res: Response) => {
		const { workspaceId, receiverId } = req.body;
		const user = req.user;
		const invitation = await InviteServices.createInviteLink(
			{ workspaceId, receiverId },
			user
		);

		res.status(StatusCodes.CREATED).json({ invitation });
	}
);

export const acceptInvitation = asyncHandler(
	async (
		req: TypedRequestBody<typeof acceptInvitationSchema>,
		res: Response
	) => {
		const { token } = req.body;

		const member = await InviteServices.acceptInvitation({ token });

		res.status(StatusCodes.CREATED).json({ member });
	}
);
