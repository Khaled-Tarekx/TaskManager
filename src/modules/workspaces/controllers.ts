import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../auth/middleware';
import { createWorkSpaceSchema, updateWorkSpaceSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as WorkSpaceServices from './services';
import { checkUser } from '../../utills/helpers';

export const getWorkSpaces = asyncHandler(
	async (_req: Request, res: Response) => {
		const workSpaces = await WorkSpaceServices.getWorkSpaces();
		res
			.status(StatusCodes.OK)
			.json({ data: workSpaces, count: workSpaces.length });
	}
);

export const getMembersOfWorkSpace = asyncHandler(
	async (req: Request, res: Response) => {
		const { workspaceId } = req.params;
		const members = await WorkSpaceServices.getMembersOfWorkSpace(
			workspaceId
		);
		res.status(StatusCodes.OK).json({ data: members, count: members.length });
	}
);

export const createWorkSpace = asyncHandler(
	async (
		req: TypedRequestBody<typeof createWorkSpaceSchema>,
		res: Response
	) => {
		const { name, type, description } = req.body;
		const user = req.user;

		checkUser(user);

		const data = await WorkSpaceServices.createWorkSpace(
			{ name, type, description },
			user
		);

		res.status(StatusCodes.OK).json({
			data,
		});
	}
);

export const getWorkSpace = asyncHandler(
	async (req: Request, res: Response) => {
		const { workspaceId } = req.params;
		const work_space = await WorkSpaceServices.getWorkSpace(workspaceId);
		res.status(StatusCodes.OK).json({ data: work_space });
	}
);

export const updateWorkSpace = asyncHandler(
	async (
		req: TypedRequestBody<typeof updateWorkSpaceSchema>,
		res: Response
	) => {
		const { workspaceId } = req.params;
		const { name, description, type } = req.body;
		const user = req.user;
		checkUser(user);

		const updatedWorkSpace = await WorkSpaceServices.updateWorkSpace(
			workspaceId,
			{ name, description, type },
			user
		);

		res.status(StatusCodes.OK).json({
			data: updatedWorkSpace,
		});
	}
);

export const deleteWorkSpace = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		const { workspaceId } = req.params;
		checkUser(user);
		const deletedWorkspace = await WorkSpaceServices.deleteWorkSpace(
			workspaceId,
			user
		);
		res.status(StatusCodes.OK).json({ data: deletedWorkspace });
	}
);
