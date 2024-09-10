import z from 'zod';
import { client } from '../../main';
import { Types, Model, type HydratedDocument } from 'mongoose';
import {
	LinkExpired,
	NotResourceOwner,
	NotValidId,
	WorkspaceMismatch,
} from './errors/cause';
import { UserNotFound } from '../modules/auth/errors/cause';

const DEFAULT_EXPIRATION = process.env.DEFAULT_EXPIRATION_CASHE;

export const getOrSetCache = async <T>(
	key: string,
	model: Model<T>,
	queryMethod: (model: Model<T>) => any
): Promise<HydratedDocument<T>> => {
	return new Promise(async (resolve, reject) => {
		try {
			const data = await client.get(key);
			if (data != null) {
				return resolve(JSON.parse(data));
			}

			const freshData = await queryMethod(model);
			await client.setEx(
				key,
				Number(DEFAULT_EXPIRATION),
				JSON.stringify(freshData)
			);
			resolve(freshData);
		} catch (err: any) {
			reject(err);
		}
	});
};

export const mongooseId = z.custom<string>(
	(v: string) => Types.ObjectId.isValid(v),
	{
		message: 'id is not valid mongoose id ',
	}
);

export const findResourceById = async <T>(
	model: Model<T>,
	id: string | Types.ObjectId,
	serviceError: new () => Error
): Promise<HydratedDocument<T>> => {
	const resource = await model.findById(id);

	if (!resource) {
		throw new serviceError();
	}
	return resource;
};

export function checkUser(
	user: Express.User | undefined
): asserts user is Express.User {
	if (!user) {
		throw new UserNotFound();
	}
}

export function checkResource<T>(
	resource: T | undefined | null,
	serviceError: new () => Error
): asserts resource is T {
	if (!resource) {
		throw new serviceError();
	}
}

export const validateObjectIds = (ids: string[]) => {
	const isValidIds = ids.every((id) => Types.ObjectId.isValid(id));

	if (!isValidIds) {
		throw new NotValidId();
	}
};

export const isResourceOwner = async (
	loggedInUserId: string,
	requesterId: string | Types.ObjectId
): Promise<Boolean> => {
	const userIsResourceOwner = loggedInUserId === requesterId.toString();
	if (!userIsResourceOwner) {
		throw new NotResourceOwner();
	}
	return true;
};

export const compareMembersWorkspace = async (
	assigneeWorkspace: Types.ObjectId,
	creatorWorkspacee: Types.ObjectId
): Promise<Boolean> => {
	const isSameWorkspace = assigneeWorkspace === creatorWorkspacee;
	if (!isSameWorkspace) {
		throw new WorkspaceMismatch();
	}

	return true;
};

export const isExpired = (expiresAt: Date, createdAt: Date): Boolean => {
	if (expiresAt.getTime() <= createdAt.getTime()) {
		throw new LinkExpired();
	}
	return true;
};
