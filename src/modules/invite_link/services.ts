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
import {
	InviteFailed,
	inviteLinkNotFound,
	WorkspaceNotFound,
	WorkspaceOwnerNotFound,
} from './errors/cause';
import { MemberCreationFailed } from '../workspaces/members/errors';

export const createInviteLink = async (
	inviteData: createInviteDTO,
	user: Express.User
) => {
	const { workspaceId, receiverId } = inviteData;
	const workspace = await findResourceById(
		WorkSpace,
		workspaceId,
		new WorkspaceNotFound('workspace to invite to not found')
	);
	const workspaceOwner = await findResourceById(
		Member,
		workspace.owner._id,
		new WorkspaceOwnerNotFound('workspace owner not found')
	);
	await isResourceOwner(user.id, workspaceOwner.user._id);

	const invitation = await InviteLink.create({
		receiver: receiverId,
		workspace: workspaceId,
	});
	checkResource(invitation, new InviteFailed('invitation failed to create'));
	return invitation;
};

export const acceptInvitation = async (token: string) => {
	const invitation = await InviteLink.findOne({
		token,
	});
	checkResource(
		invitation,
		new inviteLinkNotFound('invite link was not found, token not correct?')
	);
	isExpired(invitation.expiresAt, invitation.createdAt);
	const member = await Member.create({
		user: invitation.receiver._id,
		workspace: invitation.workspace._id,
		role: Role.member,
	});

	checkResource(
		member,
		new MemberCreationFailed('membership creation failed')
	);
	return member;
};
