import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../auth/middleware';
import type { TypedRequestBody } from 'zod-express-middleware';
import { updateMemberSchema } from './validation';

import * as MemberServices from './services';

export const getMembersOfWorkSpace = asyncHandler(
	async (req: Request, res: Response) => {
		const { workSpaceId } = req.params;
		const members = await MemberServices.getMembersOfWorkSpace(workSpaceId);
		res.status(StatusCodes.OK).json({ data: members, count: members.length });
	}
);

export const getMemberByUsername = asyncHandler(
	async (req: Request, res: Response) => {
		const { username } = req.query;
		const member = await MemberServices.getMemberByUsername(username);

		res.status(StatusCodes.OK).json({ data: member });
	}
);

export const updateMemberPermissions = asyncHandler(
	async (req: TypedRequestBody<typeof updateMemberSchema>, res: Response) => {
		const { memberId, workSpaceId } = req.params;
		const user = req.user;
		const { role } = req.body;

		const updatedMember = await MemberServices.updateMemberPermissions(
			{ memberId, workSpaceId },
			user,
			role
		);

		res.status(StatusCodes.OK).json({ data: updatedMember });
	}
);

export const deleteMember = asyncHandler(
	async (req: Request, res: Response) => {
		const { memberId, workSpaceId } = req.params;
		const user = req.user;

		const msg = await MemberServices.deleteMember(
			{ memberId, workSpaceId },
			user
		);

		res.status(StatusCodes.OK).json({ msg });
	}
);
