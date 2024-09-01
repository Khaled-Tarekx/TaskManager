import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { TypedRequestBody } from 'zod-express-middleware';
import { updateMemberSchema } from './validation';
import * as MemberServices from './services';
import { checkUser } from '../../../utills/helpers';
import { UserNotFound } from '../../auth/errors/cause';
import {
	InvalidRole,
	MemberDeletionFailed,
	MemberNotFound,
	MemberUpdateNotPermitted,
	MemberUpdatingFailed,
} from './errors/cause';
import { NotResourceOwner, NotValidId } from '../../../utills/errors/cause';
import { Forbidden, NotFound } from '../../../custom-errors/main';
import { WorkspaceNotFound } from '../errors/cause';
import * as ErrorMsg from './errors/msg';
import * as UserErrorMsg from '../../users/errors/msg';
import * as GlobalErrorMsg from '../../../utills/errors/msg';

import * as WorkspaceErrorMsg from '../../workspaces/errors/msg';

export const getMemberByUsername = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { username } = req.query;
	try {
		const member = await MemberServices.getMemberByUsername(username);

		res.status(StatusCodes.OK).json({ data: member });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(UserErrorMsg.UserNotFound));
			case err instanceof MemberNotFound:
				next(new NotFound(ErrorMsg.MemberNotFound));
			default:
				next(err);
		}
	}
};

export const updateMemberPermissions = async (
	req: TypedRequestBody<typeof updateMemberSchema>,
	res: Response,
	next: NextFunction
) => {
	const { memberId, workspaceId } = req.params;
	try {
		const user = req.user;
		const { role } = req.body;
		checkUser(user);
		const updatedMember = await MemberServices.updateMemberPermissions(
			{ memberId, workspaceId },
			user,
			role
		);

		res.status(StatusCodes.OK).json({ data: updatedMember });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				next(new NotFound(GlobalErrorMsg.NotValidId));
			case err instanceof InvalidRole:
				next(new Forbidden(ErrorMsg.InvalidRole));
			case err instanceof WorkspaceNotFound:
				next(new Forbidden(WorkspaceErrorMsg.WorkspaceNotFound));
			case err instanceof MemberNotFound:
				next(new Forbidden(ErrorMsg.MemberNotFound));
			case err instanceof MemberUpdateNotPermitted:
				next(new Forbidden(ErrorMsg.MemberUpdateNotPermitted));
			case err instanceof MemberUpdatingFailed:
				next(new Forbidden(ErrorMsg.MemberUpdatingFailed));
			default:
				next(err);
		}
	}
};

export const deleteMember = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { memberId, workspaceId } = req.params;
	const user = req.user;
	try {
		checkUser(user);
		const deletedMember = await MemberServices.deleteMember(
			{ memberId, workspaceId },
			user
		);

		res.status(StatusCodes.OK).json({ data: deletedMember });
	} catch (err: unknown) {
		switch (true) {
			case err instanceof UserNotFound:
				next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				next(new NotFound(GlobalErrorMsg.NotValidId));
			case err instanceof WorkspaceNotFound:
				next(new Forbidden(WorkspaceErrorMsg.WorkspaceNotFound));
			case err instanceof MemberNotFound:
				next(new Forbidden(ErrorMsg.MemberNotFound));
			case err instanceof NotResourceOwner:
				next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof MemberDeletionFailed:
				next(new Forbidden(ErrorMsg.MemberDeletionFailed));
			default:
				next(err);
		}
	}
};
