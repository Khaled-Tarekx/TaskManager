import { NotFound } from '../../../custom-errors/main';
import { Member, WorkSpace } from '../models';
import { isResourceOwner } from '../../users/helpers';
import {
	checkResource,
	checkUser,
	findResourceById,
	validateObjectIds,
} from '../../../setup/helpers';
import type { deleteMemberParams } from './types';

export const getMembersOfWorkSpace = async (workSpaceId: string) => {
	validateObjectIds([workSpaceId]);

	return Member.find({
		workspace: workSpaceId,
	}).populate('member');
};

export const getMemberByUsername = async <T>(username: T) => {
	const member = await Member.findOne({
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

	const updatedMember = await Member.findOneAndUpdate(
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

	await Member.findOneAndDelete({
		workspace: workSpace.id,
		member: memberId,
	});
	return 'member Deleted Successfully';
};
