import { NotFound } from '../../../custom-errors/main';
import { Member, WorkSpace } from '../models';
import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
} from '../../../utills/helpers';
import type { deleteMemberParams } from './types';

export const getMemberByUsername = async <T>(username: T) => {
	console.log(username);
	const member = await Member.findOne({}).populate({
		path: 'member',
		match: { username },
		select: '-password',
	});
	const validatedResource = await checkResource(member);
	return validatedResource;
};

export const updateMemberPermissions = async (
	params: deleteMemberParams,
	user: Express.User,
	role: string
) => {
	const { memberId, workspaceId } = params;
	validateObjectIds([workspaceId, memberId]);
	const workspace = await findResourceById(WorkSpace, workspaceId);
	const workspaceOwner = await findResourceById(
		Member,
		workspace.owner._id.toString()
	);
	const workspaceMember = await findResourceById(Member, memberId);
	await isResourceOwner(user.id, workspaceOwner.member._id);
	await isResourceOwner(user.id, workspaceMember.member._id);
	const updatedMember = await Member.findOneAndUpdate(
		{ _id: workspaceMember.member._id, workspace: workspace._id },
		{ role },
		{ new: true }
	);
	if (!updatedMember) throw new NotFound(`no member found with the given id`);
	return updatedMember;
};

export const deleteMember = async (
	params: deleteMemberParams,
	user: Express.User
) => {
	const { memberId, workspaceId } = params;
	validateObjectIds([workspaceId, memberId]);
	const workspace = await findResourceById(WorkSpace, workspaceId);
	const workspaceOwner = await findResourceById(
		Member,
		workspace.owner._id.toString()
	);
	const workspaceMember = await findResourceById(Member, memberId);
	await isResourceOwner(user.id, workspaceOwner.member._id);
	await isResourceOwner(user.id, workspaceMember.member._id);

	await Member.findOneAndDelete({
		workspace: workspace._id,
		member: workspaceMember.member._id,
	});

	return workspace;
};
