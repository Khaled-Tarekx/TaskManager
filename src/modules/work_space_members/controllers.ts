import { BadRequest, NotFound } from '../../../custom-errors/main.js';
import WorkSpaceMembers from './models.js';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { asyncHandler } from '../auth/middleware.js';

export const getMembersOfWorkSpace = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { workSpaceId } = req.params;
		const members = await WorkSpaceMembers.find({
			workspace: workSpaceId,
		}).populate('user');
		res.status(StatusCodes.OK).json({ data: members, count: members.length });
	}
);

export const createMember = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { role } = req.body;
		const member = await WorkSpaceMembers.create(role);
		res
			.status(StatusCodes.OK)
			.json({ message: `created your member successfully `, data: member });
	}
);

export const getMember = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { workspaceId, id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const member = await WorkSpaceMembers.findOne({ workspaceId, id });
		if (!member) return next(new NotFound(`no member found`));

		res.status(StatusCodes.OK).json({ data: member });
	}
);

export const updateMemberPermissions = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id, workspaceId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const { role } = req.body;
		const updatedMember = await WorkSpaceMembers.findOneAndUpdate(
			{ id, workspaceId },
			{ role },
			{ new: true, context: 'query' }
		);
		if (!updatedMember)
			return next(new NotFound(`no member found with the given id`));
		res
			.status(StatusCodes.OK)
			.json({ message: 'member updated Successfully', data: updatedMember });
	}
);

export const deleteMember = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id, workspaceId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new BadRequest('Invalid ID format'));
		}
		if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
			return next(new BadRequest('Invalid ID format'));
		}
		const MemberToDelete = await WorkSpaceMembers.findOneAndDelete({
			workspaceId,
			id,
		});
		if (!MemberToDelete) return next(new NotFound(`no member found`));
		res.status(StatusCodes.OK).json({
			message: 'member Deleted Successfully',
		});
	}
);
