import { BadRequest } from '../../../custom-errors/main.js';
import WorkSpace from './models.js';
import WorkSpaceMembers from '../work_space_members/models.js';

import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware.js';
import {
	createWorkSpaceSchema,
	updateWorkSpaceSchema,
} from './validation.js';
import { isResourceOwner } from '../users/helpers.js';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from 'src/setup/helpers.js';
import type { TypedRequestBody } from 'zod-express-middleware';
import { Role } from '../work_space_members/types.js';

export const getWorkSpaces = asyncHandler(
	async (req: Request, res: Response) => {
		const workSpaces = await WorkSpace.find({});
		res
			.status(StatusCodes.OK)
			.json({ data: workSpaces, count: workSpaces.length });
	}
);

export const createWorkSpace = asyncHandler(
	async (
		req: TypedRequestBody<typeof createWorkSpaceSchema>,
		res: Response
	) => {
		const { name, type, description } = req.body;
		const user = req.user;

		const loggedInUser = await checkUser(user);

		const workSpaceOwner = new WorkSpaceMembers({
			role: Role.owner,
			member: loggedInUser.id,
			description,
		});

		const work_space = await WorkSpace.create({
			name,
			type,
			owner: workSpaceOwner.id,
			description,
		});

		workSpaceOwner.workspace = work_space.id;
		await workSpaceOwner.save();
		await checkResource(workSpaceOwner);
		await checkResource(work_space);
		res.status(StatusCodes.OK).json({
			data: { work_space, workSpaceOwner },
		});
	}
);

export const getWorkSpace = asyncHandler(
	async (req: Request, res: Response) => {
		const { workSpaceId } = req.params;
		validateObjectIds([workSpaceId]);
		const work_space = await findResourceById(WorkSpace, workSpaceId);

		res.status(StatusCodes.OK).json({ data: work_space });
	}
);

export const updateWorkSpace = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateWorkSpaceSchema>,
		res: Response
	) => {
		const { workSpaceId } = req.params;
		const { name, description, type } = req.body;
		const user = req.user;
		validateObjectIds([workSpaceId]);

		const loggedInUser = await checkUser(user);
		const work_space = await findResourceById(WorkSpace, workSpaceId);
		await isResourceOwner(loggedInUser.id, work_space.owner.id);

		const updatedWorkSpace = await WorkSpace.findByIdAndUpdate(
			work_space.id,
			{ name, description, type },
			{ new: true }
		);

		await checkResource(updatedWorkSpace);

		res.status(StatusCodes.OK).json({
			data: updatedWorkSpace,
		});
	}
);

export const deleteWorkSpace = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const { workSpaceId } = req.params;

		try {
			validateObjectIds([workSpaceId]);
			const loggedInUser = await checkUser(user);
			const work_space = await findResourceById(WorkSpace, workSpaceId);
			await isResourceOwner(loggedInUser.id, work_space.owner.id);
			await WorkSpace.findByIdAndDelete(work_space.id);

			res.status(StatusCodes.OK).json({
				message: 'Work Space Deleted Successfully',
			});
		} catch (err: any) {
			next(new BadRequest(err.message));
		}
	}
);
