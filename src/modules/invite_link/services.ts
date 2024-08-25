import { Forbidden, NotFound } from '../../custom-errors/main';
import InviteLink from './models';
import {
	findResourceById,
	checkResource,
	isResourceOwner,
	isExpired,
} from '../../utills/helpers';
import { WorkSpace, Member } from '../workspaces/models';
import type { createInviteDTO } from './types';
import { Role } from '../workspaces/members/types';

export const createInviteLink = async (
	inviteData: createInviteDTO,
	user: Express.User
) => {
	const { workspaceId, receiverId } = inviteData;
	try {
		const workspace = await findResourceById(WorkSpace, workspaceId);
		const workspaceOwner = await findResourceById(
			Member,
			workspace.owner._id
		);
		await isResourceOwner(user.id, workspaceOwner.user._id);

		const invitation = await InviteLink.create({
			receiver: receiverId,
			workspace: workspaceId,
		});
		return checkResource(invitation);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const acceptInvitation = async (token: string) => {
	try {
		const invitation = await InviteLink.findOne({
			token,
		});
		const validatedResource = await checkResource(invitation);
		isExpired(validatedResource.expiresAt, validatedResource.createdAt);
		const member = await Member.create({
			user: validatedResource.receiver._id,
			workspace: validatedResource.workspace._id,
			role: Role.member,
		});

		return checkResource(member);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
