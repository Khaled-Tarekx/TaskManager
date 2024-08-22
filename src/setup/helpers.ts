import z from 'zod';
import { client } from '../../main';
import { Types, Model, type HydratedDocument } from 'mongoose';
import { NotFound, UnAuthenticated, BadRequest } from '../custom-errors/main';

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
// export const findResourceById = async <T extends AnyParamConstructor<any>>(
// 	model: ReturnModelType<T>,
// 	id: string | undefined
// ): Promise<DocumentType<T>> => {
// 	if (!id) throw new Error('ID is required');

// 	const resource = await model.findById(id);
// 	const checkedResource = await checkResource(resource);

// 	return checkedResource;
// };

export const findResourceById = async <T>(
	model: Model<T>,
	id: string | undefined
): Promise<HydratedDocument<T>> => {
	const resource = await model.findById(id);

	if (!resource)
		throw new NotFound(`the resource you are trying to access is not found`);
	return resource;
};

export const checkUser = async (
	user: Express.User | undefined
): Promise<Express.User> => {
	if (!user) {
		throw new UnAuthenticated('log in first to grant access');
	}
	return user;
};
export const checkResource = async <T>(
	resource: T | undefined | null
): Promise<T> => {
	if (!resource) {
		throw new NotFound('Resource want returned or created successfully');
	}
	return resource;
};

export const validateObjectIds = (ids: string[]) => {
	const isValidIds = ids.every((id) => Types.ObjectId.isValid(id));
	if (!isValidIds) {
		throw new BadRequest('Invalid Object Id');
	}
};
