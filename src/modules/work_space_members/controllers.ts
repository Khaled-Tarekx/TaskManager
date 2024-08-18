import { NotFound } from '../../../custom-errors/main.js';
import WorkSpaceMembers from './models.js';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware.js';
import type { TypedRequestBody } from 'zod-express-middleware';
import { updateMemberSchema } from './validation.js';
import { isResourceOwner } from '../users/helpers.js';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
} from 'src/setup/helpers.js';
import WorkSpace from '../work_spaces/models.js';

export const getMembersOfWorkSpace = asyncHandler(
	async (req: Request, res: Response) => {
		const { workSpaceId } = req.params;
		validateObjectIds([workSpaceId]);
		const members = await WorkSpaceMembers.find({
			workspace: workSpaceId,
		}).populate('member');
		res.status(StatusCodes.OK).json({ data: members, count: members.length });
	}
);

export const getMemberByName = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { username } = req.body;
		const member = await WorkSpaceMembers.findOne({
			'member.username': username,
		});

		if (!member) return next(new NotFound(`no member found`));

		res.status(StatusCodes.OK).json({ data: member });
	}
);

export const updateMemberPermissions = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateMemberSchema>,
		res: Response,
		next: NextFunction
	) => {
		const { memberId, workSpaceId } = req.params;
		const user = req.user;
		const { role } = req.body;
		validateObjectIds([workSpaceId, memberId]);
		const loggedInUser = await checkUser(user);
		const work_space = await findResourceById(WorkSpace, workSpaceId);
		await isResourceOwner(loggedInUser.id, work_space.owner.id);

		const updatedMember = await WorkSpaceMembers.findOneAndUpdate(
			{ memberId, workspace: work_space.id },
			{ role },
			{ new: true }
		);
		if (!updatedMember)
			return next(new NotFound(`no member found with the given id`));
		res.status(StatusCodes.OK).json({ data: updatedMember });
	}
);

export const deleteMember = asyncHandler(
	async (req: Request, res: Response) => {
		const { memberId, workSpaceId } = req.params;
		const user = req.user;
		validateObjectIds([workSpaceId, memberId]);
		const loggedInUser = await checkUser(user);
		const workSpace = await findResourceById(WorkSpace, workSpaceId);
		await isResourceOwner(loggedInUser.id, workSpace.owner.id);

		await WorkSpaceMembers.findOneAndDelete({
			workspace: workSpace.id,
			member: memberId,
		});

		res.status(StatusCodes.OK).json({
			message: 'member Deleted Successfully',
		});
	}
);
