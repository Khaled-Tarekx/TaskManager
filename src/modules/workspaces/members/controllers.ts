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
import * as AuthErrorMsg from '../../auth/errors/msg';
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
				return next(new NotFound(AuthErrorMsg.UserNotFound));
			case err instanceof MemberNotFound:
				return next(new NotFound(ErrorMsg.MemberNotFound));
			default:
				return next(err);
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
				return next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new NotFound(GlobalErrorMsg.NotValidId));
			case err instanceof InvalidRole:
				return next(new Forbidden(ErrorMsg.InvalidRole));
			case err instanceof WorkspaceNotFound:
				return next(new Forbidden(WorkspaceErrorMsg.WorkspaceNotFound));
			case err instanceof MemberNotFound:
				return next(new Forbidden(ErrorMsg.MemberNotFound));
			case err instanceof MemberUpdateNotPermitted:
				return next(new Forbidden(ErrorMsg.MemberUpdateNotPermitted));
			case err instanceof MemberUpdatingFailed:
				return next(new Forbidden(ErrorMsg.MemberUpdatingFailed));
			default:
				return next(err);
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
				return next(new NotFound(GlobalErrorMsg.LoginFirst));
			case err instanceof NotValidId:
				return next(new NotFound(GlobalErrorMsg.NotValidId));
			case err instanceof WorkspaceNotFound:
				return next(new Forbidden(WorkspaceErrorMsg.WorkspaceNotFound));
			case err instanceof MemberNotFound:
				return next(new Forbidden(ErrorMsg.MemberNotFound));
			case err instanceof NotResourceOwner:
				return next(new Forbidden(GlobalErrorMsg.NotResourceOwner));
			case err instanceof MemberDeletionFailed:
				return next(new Forbidden(ErrorMsg.MemberDeletionFailed));
			default:
				return next(err);
		}
	}
};
