import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../auth/middleware';
import type { TypedRequestBody } from 'zod-express-middleware';
import { updateMemberSchema } from './validation';

import * as MemberServices from './services';
import { checkUser } from '../../../utills/helpers';

export const getMemberByUsername = asyncHandler(
	async (req: Request, res: Response) => {
		const { username } = req.query;
		const member = await MemberServices.getMemberByUsername(username);

		res.status(StatusCodes.OK).json({ data: member });
	}
);

export const updateMemberPermissions = asyncHandler(
	async (req: TypedRequestBody<typeof updateMemberSchema>, res: Response) => {
		const { memberId, workspaceId } = req.params;
		const user = req.user;
		const { role } = req.body;
		checkUser(user);
		const updatedMember = await MemberServices.updateMemberPermissions(
			{ memberId, workspaceId },
			user,
			role
		);

		res.status(StatusCodes.OK).json({ data: updatedMember });
	}
);

export const deleteMember = asyncHandler(
	async (req: Request, res: Response) => {
		const { memberId, workspaceId } = req.params;
		const user = req.user;
		checkUser(user);
		const deletedMember = await MemberServices.deleteMember(
			{ memberId, workspaceId },
			user
		);

		res.status(StatusCodes.OK).json({ data: deletedMember });
	}
);
