import { NotFound } from '../../custom-errors/main';
import WorkSpaceMembers from './models';
import { isResourceOwner } from '../users/helpers';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from '../../setup/helpers';
import WorkSpace from '../work_spaces/models';
import type { deleteMemberParams } from './types';

export const getMembersOfWorkSpace = async (workSpaceId: string) => {
	validateObjectIds([workSpaceId]);
	const members = await WorkSpaceMembers.find({
		workspace: workSpaceId,
	}).populate('member');

	return members;
};

export const getMemberByUsername = async <T>(username: T) => {
	const member = await WorkSpaceMembers.findOne({
		'member.username': username,
	});

	const validatedResource = await checkResource(member);
	return validatedResource;
};

export const updateMemberPermissions = async (
	params: deleteMemberParams,
	user: Express.User | undefined,
	role: string
) => {
	const { memberId, workSpaceId } = params;
	validateObjectIds([workSpaceId, memberId]);
	const loggedInUser = await checkUser(user);
	const work_space = await findResourceById(WorkSpace, workSpaceId);
	await isResourceOwner(loggedInUser.id, work_space.owner.id);

	const updatedMember = await WorkSpaceMembers.findOneAndUpdate(
		{ memberId, workspace: work_space.id },
		{ role },
		{ new: true }
	);
	if (!updatedMember) throw new NotFound(`no member found with the given id`);
	return updatedMember;
};

export const deleteMember = async (
	params: deleteMemberParams,
	user: Express.User | undefined
) => {
	const { memberId, workSpaceId } = params;
	validateObjectIds([workSpaceId, memberId]);
	const loggedInUser = await checkUser(user);
	const workSpace = await findResourceById(WorkSpace, workSpaceId);
	await isResourceOwner(loggedInUser.id, workSpace.owner.id);

	await WorkSpaceMembers.findOneAndDelete({
		workspace: workSpace.id,
		member: memberId,
	});
	return 'member Deleted Successfully';
};
