import { NotFound } from '../../../custom-errors/main.js';
import WorkSpaceMembers from './models.js';
import { isResourceOwner } from '../users/helpers.js';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
} from 'src/setup/helpers.js';
import WorkSpace from '../work_spaces/models.js';
import type { deleteMemberParams } from './types.js';

export const getMembersOfWorkSpace = async (workSpaceId: string) => {
	validateObjectIds([workSpaceId]);
	const members = await WorkSpaceMembers.find({
		workspace: workSpaceId,
	}).populate('member');

	return members;
};

export const getMemberByUsername = async (username: string) => {
	const member = await WorkSpaceMembers.findOne({
		'member.username': username,
	});

	if (!member) throw new NotFound(`no member found`);
	return member;
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
