import { BadRequest, Forbidden, NotFound } from '../../../custom-errors/main';
import { Member, WorkSpace } from '../models';
import User from '../../users/models';
import {
	checkResource,
	findResourceById,
	validateObjectIds,
	isResourceOwner,
} from '../../../utills/helpers';
import { Role, type deleteMemberParams } from './types';

export const getMemberByUsername = async <T>(username: T) => {
	const user = await User.findOne({ username });
	const validateUser = await checkResource(user);

	const member = await Member.findOne({ user: validateUser.id }).populate({
		path: 'user',
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
	if (role === 'owner')
		throw new BadRequest('you have to enter a role between member and admin');
	const workspace = await findResourceById(WorkSpace, workspaceId);
	const workspaceOwner = await findResourceById(Member, workspace.owner._id);
	const workspaceMember = await findResourceById(Member, memberId);
	const isWorkspaceOwner = await isResourceOwner(
		user.id,
		workspaceOwner.user._id
	);

	if (!isWorkspaceOwner || workspaceMember.role !== 'admin') {
		throw new Forbidden('you are not allowed to update this member');
	}
	console.log(workspaceMember.user._id);
	console.log(workspace._id);
	const updatedMember = await Member.findOneAndUpdate(
		{ user: workspaceMember.user._id, workspace: workspace._id },
		{ role },
		{ new: true }
	);
	const validatedResource = await checkResource(updatedMember);
	return validatedResource;
};

export const deleteMember = async (
	params: deleteMemberParams,
	user: Express.User
) => {
	const { memberId, workspaceId } = params;
	validateObjectIds([workspaceId, memberId]);
	const workspace = await findResourceById(WorkSpace, workspaceId);
	const workspaceOwner = await findResourceById(Member, workspace.owner._id);

	const workspaceMember = await findResourceById(Member, memberId);

	await isResourceOwner(user.id, workspaceOwner.user._id);
	await isResourceOwner(user.id, workspaceMember.user._id);

	await Member.findOneAndDelete({
		workspace: workspace.id,
		member: workspaceMember.user.id,
	});

	return workspace;
};
