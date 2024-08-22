import { Forbidden, NotFound } from '../../custom-errors/main';
import InviteLink from './models';
import {
	findResourceById,
	checkUser,
	checkResource,
} from '../../setup/helpers';
import { Role } from '../workspaces/workspace_members/types';
import { WorkSpace, Member } from '../workspaces/models';
import { isResourceOwner } from '../users/helpers';
import type { acceptInviteDTO, createInviteDTO } from './types';

export const createInviteLink = async (
	inviteData: createInviteDTO,
	user: Express.User | undefined
) => {
	const { workspaceId, receiverId } = inviteData;
	try {
		const loggedInUser = await checkUser(user);
		const workspace = await findResourceById(WorkSpace, workspaceId);
		await isResourceOwner(loggedInUser.id, workspace.owner.id);

		const invitation = await InviteLink.create({
			receiver: receiverId,
			workspace: workspaceId,
		});
		return checkResource(invitation);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};

export const acceptInvitation = async (token: acceptInviteDTO) => {
	try {
		const invitation = await InviteLink.findOne({
			token,
		});

		const validatedResource = await checkResource(invitation);

		if (validatedResource.expiresAt <= validatedResource.createdAt) {
			throw new NotFound('invite link already expired');
		}

		const member = await Member.create({
			member: validatedResource.receiver.id,
			workspace: validatedResource.workspace.id,
			role: Role.member,
		});

		return checkResource(member);
	} catch (err: any) {
		throw new Forbidden(err.message);
	}
};
