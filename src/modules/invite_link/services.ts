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
import { MemberCreationFailed } from '../workspaces/members/errors/cause';

export const createInviteLink = async (
	inviteData: createInviteDTO,
	user: Express.User
) => {
	const { workspaceId, receiverId } = inviteData;
	const workspace = await findResourceById(
		WorkSpace,
		workspaceId,
		WorkspaceNotFound
	);
	const workspaceOwner = await findResourceById(
		Member,
		workspace.owner._id,
		WorkspaceOwnerNotFound
	);
	await isResourceOwner(user.id, workspaceOwner.user._id);

	const invitation = await InviteLink.create({
		receiver: receiverId,
		workspace: workspaceId,
	});
	checkResource(invitation, InviteFailed);
	return invitation;
};

export const acceptInvitation = async (token: string) => {
	const invitation = await InviteLink.findOne({
		token,
	});
	checkResource(invitation, inviteLinkNotFound);
	isExpired(invitation.expiresAt, invitation.createdAt);
	const member = await Member.create({
		user: invitation.receiver._id,
		workspace: invitation.workspace._id,
		role: Role.member,
	});

	checkResource(member, MemberCreationFailed);
	return member;
};
