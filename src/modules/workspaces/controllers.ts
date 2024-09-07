import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createWorkSpaceSchema, updateWorkSpaceSchema } from './validation';

import type { TypedRequestBody } from 'zod-express-middleware';
import * as WorkSpaceServices from './services';
import { checkUser } from '../../utills/helpers';
import { NotResourceOwner, NotValidId } from '../../utills/errors/cause';
import {
	BadRequestError,
	AuthenticationError,
	NotFound,
	Conflict,
} from '../../custom-errors/main';

import { UserNotFound } from '../auth/errors/cause';
import { MemberNotFound } from './members/errors/cause';
import {
	WorkspaceCreationFailed,
	WorkspaceDeletionFailed,
	WorkspaceNotFound,
	WorkspaceUpdatingFailed,
} from './errors/cause';
import * as MemberErrorMsg from './members/errors/msg';
import * as GlobalErrorMsg from '../../utills/errors/msg';
import * as ErrorMsg from './errors/msg';

export const getWorkSpaces = async (_req: Request, res: Response) => {
	const workSpaces = await WorkSpaceServices.getWorkSpaces();
	res
		.status(StatusCodes.OK)
		.json({ data: workSpaces, count: workSpaces.length });
};
export const getMembersOfWorkSpace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { workspaceId } = req.params;
	try {
		const members = await WorkSpaceServices.getMembersOfWorkSpace(
			workspaceId
		);
		res.status(StatusCodes.OK).json({ data: members, count: members.length });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof NotValidId:
				return next(new BadRequestError(GlobalErrorMsg.NotValidId));
			default:
				return next(err);
		}
	}
};

export const createWorkSpace = async (
	req: TypedRequestBody<typeof createWorkSpaceSchema>,
	res: Response,
	next: NextFunction
) => {
	const { name, type, description } = req.body;
	try {
		const user = req.user;

		checkUser(user);

		const data = await WorkSpaceServices.createWorkSpace(
			{ name, type, description },
			user
		);

		res.status(StatusCodes.OK).json({
			data,
		});
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof MemberNotFound:
				return next(new NotFound(MemberErrorMsg.MemberNotFound));
			case err instanceof WorkspaceCreationFailed:
				return next(new Conflict(ErrorMsg.WorkspaceCreationFailed));
			default:
				return next(err);
		}
	}
};

export const getWorkSpace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { workspaceId } = req.params;
	try {
		const work_space = await WorkSpaceServices.getWorkSpace(workspaceId);
		res.status(StatusCodes.OK).json({ data: work_space });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			default:
				return next(err);
		}
	}
};

export const updateWorkSpace = async (
	req: TypedRequestBody<typeof updateWorkSpaceSchema>,
	res: Response,
	next: NextFunction
) => {
	const { workspaceId } = req.params;
	const { name, description, type } = req.body;
	const user = req.user;
	try {
		checkUser(user);

		const updatedWorkSpace = await WorkSpaceServices.updateWorkSpace(
			workspaceId,
			{ name, description, type },
			user
		);

		res.status(StatusCodes.OK).json({
			data: updatedWorkSpace,
		});
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof WorkspaceNotFound:
				return next(new NotFound(ErrorMsg.WorkspaceNotFound));
			case err instanceof MemberNotFound:
				return next(new NotFound(MemberErrorMsg.MemberNotFound));
			case err instanceof NotResourceOwner:
				return next(new NotFound(GlobalErrorMsg.NotResourceOwner));
			case err instanceof WorkspaceUpdatingFailed:
				return next(new Conflict(ErrorMsg.WorkspaceUpdatingFailed));
			default:
				next(err);
		}
	}
};

export const deleteWorkSpace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;
	const { workspaceId } = req.params;
	try {
		checkUser(user);
		const deletedWorkspace = await WorkSpaceServices.deleteWorkSpace(
			workspaceId,
			user
		);
		res.status(StatusCodes.OK).json({ data: deletedWorkspace });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				return next(new AuthenticationError(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new AuthenticationError(GlobalErrorMsg.NotValidId));
			case err instanceof WorkspaceNotFound:
				return next(new NotFound(ErrorMsg.WorkspaceNotFound));
			case err instanceof MemberNotFound:
				return next(new NotFound(MemberErrorMsg.MemberNotFound));
			case err instanceof NotResourceOwner:
				return next(new NotFound(GlobalErrorMsg.NotResourceOwner));
			case err instanceof WorkspaceDeletionFailed:
				return next(new Conflict(ErrorMsg.WorkspaceDeletionFailed));
			default:
				return next(err);
		}
	}
};
