import { Member, WorkSpace } from '../models';
import User from '../../users/models';
import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
} from '../../../utills/helpers';
import { type deleteMemberParams } from './types';
import {
	InvalidRole,
	MemberDeletionFailed,
	MemberNotFound,
	MemberUpdateNotPermitted,
	MemberUpdatingFailed,
} from './errors/cause';
import { UserNotFound } from '../../auth/errors/cause';
import { WorkspaceNotFound } from '../errors/cause';

export const getMemberByUsername = async <T>(username: T) => {
	const user = await User.findOne({ username });
	checkResource(user, UserNotFound);

	const member = await Member.findOne({ user: user.id }).populate({
		path: 'user',
		select: '-password',
	});

	checkResource(member, MemberNotFound);
	return member;
};

export const updateMemberPermissions = async (
	params: deleteMemberParams,
	user: Express.User,
	role: string
) => {
	const { memberId, workspaceId } = params;
	validateObjectIds([workspaceId, memberId]);
	if (role === 'owner') throw new InvalidRole();
	const workspace = await findResourceById(
		WorkSpace,
		workspaceId,
		WorkspaceNotFound
	);
	const workspaceOwner = await findResourceById(
		Member,
		workspace.owner._id,
		MemberNotFound
	);
	const workspaceMember = await findResourceById(
		Member,
		memberId,
		MemberNotFound
	);
	const isWorkspaceOwner = await isResourceOwner(
		user.id,
		workspaceOwner.user._id
	);

	if (!isWorkspaceOwner || workspaceMember.role !== 'admin') {
		throw new MemberUpdateNotPermitted();
	}

	const updatedMember = await Member.findOneAndUpdate(
		{ user: workspaceMember.user._id, workspace: workspace._id },
		{ role },
		{ new: true }
	);
	checkResource(updatedMember, MemberUpdatingFailed);
	return updatedMember;
};

export const deleteMember = async (
	params: deleteMemberParams,
	user: Express.User
) => {
	const { memberId, workspaceId } = params;
	validateObjectIds([workspaceId, memberId]);
	const workspace = await findResourceById(
		WorkSpace,
		workspaceId,
		WorkspaceNotFound
	);
	const workspaceOwner = await findResourceById(
		Member,
		workspace.owner._id,
		MemberNotFound
	);

	const workspaceMember = await findResourceById(
		Member,
		memberId,
		MemberNotFound
	);

	await isResourceOwner(user.id, workspaceOwner.user._id);
	await isResourceOwner(user.id, workspaceMember.user._id);

	const deletedMember = await Member.findOneAndDelete({
		workspace: workspace.id,
		member: workspaceMember.user.id,
	});
	if (!deleteMember) {
		throw new MemberDeletionFailed();
	}
	return deletedMember;
};
