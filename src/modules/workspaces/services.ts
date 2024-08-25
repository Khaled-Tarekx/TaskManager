import { WorkSpace, Member } from './models';

import {
	findResourceById,
	validateObjectIds,
	checkResource,
	isResourceOwner,
} from '../../utills/helpers';
import { Role } from './members/types';
import type { updateWorkSpaceDTO, workSpaceDTO } from './types';

export const getWorkSpaces = async () => {
	return WorkSpace.find({});
};

export const getMembersOfWorkSpace = async (workspaceId: string) => {
	validateObjectIds([workspaceId]);

	return Member.find({
		workspace: workspaceId,
	}).populate({ path: 'user', select: '-password' });
};

export const createWorkSpace = async (
	workSpaceData: workSpaceDTO,
	user: Express.User
) => {
	const { name, type, description } = workSpaceData;

	const workSpaceOwner = new Member({
		role: Role.owner,
		user: user.id,
		description,
	});

	const work_space = await WorkSpace.create({
		name,
		type,
		owner: workSpaceOwner.id,
		description,
	});

	workSpaceOwner.workspace = work_space.id;
	await workSpaceOwner.save();
	await checkResource(workSpaceOwner);
	await checkResource(work_space);
	return { work_space, workSpaceOwner };
};

export const getWorkSpace = async (workspaceId: string) => {
	validateObjectIds([workspaceId]);
	return findResourceById(WorkSpace, workspaceId);
};

export const updateWorkSpace = async (
	workspaceId: string,
	workSpaceData: updateWorkSpaceDTO,
	user: Express.User
) => {
	const { name, description, type } = workSpaceData;
	validateObjectIds([workspaceId]);
	const workspace = await findResourceById(WorkSpace, workspaceId);
	const userToCompare = await findResourceById(Member, workspace.owner._id);

	await isResourceOwner(user.id, userToCompare.user._id);

	const updatedWorkSpace = await WorkSpace.findByIdAndUpdate(
		workspace.id,
		{ name, description, type },
		{ new: true }
	);

	return checkResource(updatedWorkSpace);
};

export const deleteWorkSpace = async (
	workspaceId: string,
	user: Express.User
) => {
	validateObjectIds([workspaceId]);
	const workspace = await findResourceById(WorkSpace, workspaceId);

	const userToCompare = await findResourceById(Member, workspace.owner._id);
	await isResourceOwner(user.id, userToCompare.user._id);
	await WorkSpace.findByIdAndDelete(workspace._id);
	return workspace;
};
