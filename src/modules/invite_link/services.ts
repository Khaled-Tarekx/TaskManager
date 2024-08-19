import { NotFound } from '../../../custom-errors/main.js';
import InviteLink from './models.js';
import {
	findResourceById,
	checkUser,
	checkResource,
} from 'src/setup/helpers.js';
import Members from '../work_space_members/models.js';
import { Role } from '../work_space_members/types.js';
import WorkSpace from '../work_spaces/models.js';
import { isResourceOwner } from '../users/helpers.js';
import type { acceptInviteDTO, createInviteDTO } from './types.js';

export const createInviteLink = async (
	inviteData: createInviteDTO,
	user: Express.User | undefined
) => {
	const { workspaceId, receiverId } = inviteData;
	const loggedInUser = await checkUser(user);
	const workspace = await findResourceById(WorkSpace, workspaceId);
	await isResourceOwner(loggedInUser.id, workspace.owner.id);

	const invitation = await InviteLink.create({
		receiver: receiverId,
		workspace: workspaceId,
	});
	return checkResource(invitation);
};

export const acceptInvitation = async (token: acceptInviteDTO) => {
	const invitation = await InviteLink.findOne({
		token,
	});

	const validatedResource = await checkResource(invitation);

	if (validatedResource.expiresAt <= validatedResource.createdAt) {
		throw new NotFound('invite link already expired');
	}

	const member = await Members.create({
		member: validatedResource.receiver.id,
		workspace: validatedResource.workspace.id,
		role: Role.member,
	});

	return checkResource(member);
};
