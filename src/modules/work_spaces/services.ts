import WorkSpace from './models.js';
import WorkSpaceMembers from '../work_space_members/models.js';

import { isResourceOwner } from '../users/helpers.js';
import {
	findResourceById,
	checkUser,
	validateObjectIds,
	checkResource,
} from 'src/setup/helpers.js';
import { Role } from '../work_space_members/types.js';
import type { updateWorkSpaceDTO, workSpaceDTO } from './types.js';

export const getWorkSpaces = async () => {
	return WorkSpace.find({});
};

export const createWorkSpace = async (
	workSpaceData: workSpaceDTO,
	user: Express.User | undefined
) => {
	const { name, type, description } = workSpaceData;

	const loggedInUser = await checkUser(user);

	const workSpaceOwner = new WorkSpaceMembers({
		role: Role.owner,
		member: loggedInUser.id,
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

export const getWorkSpace = async (workSpaceId: string) => {
	validateObjectIds([workSpaceId]);
	return findResourceById(WorkSpace, workSpaceId);
};

export const updateWorkSpace = async (
	workSpaceId: string,
	workSpaceData: updateWorkSpaceDTO,
	user: Express.User | undefined
) => {
	const { name, description, type } = workSpaceData;
	validateObjectIds([workSpaceId]);

	const loggedInUser = await checkUser(user);
	const work_space = await findResourceById(WorkSpace, workSpaceId);
	await isResourceOwner(loggedInUser.id, work_space.owner.id);

	const updatedWorkSpace = await WorkSpace.findByIdAndUpdate(
		work_space.id,
		{ name, description, type },
		{ new: true }
	);

	return checkResource(updatedWorkSpace);
};

export const deleteWorkSpace = async (
	workSpaceId: string,
	user: Express.User | undefined
) => {
	validateObjectIds([workSpaceId]);
	const loggedInUser = await checkUser(user);
	const work_space = await findResourceById(WorkSpace, workSpaceId);
	await isResourceOwner(loggedInUser.id, work_space.owner.id);
	await WorkSpace.findByIdAndDelete(work_space.id);
	return 'Work Space Deleted Successfully';
};
