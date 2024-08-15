import z from 'zod';
import { client } from '../../main.js';
import mongoose, { Types } from 'mongoose';
import { NotFound, CustomError } from '../../custom-errors/main.js';
import { Model } from 'mongoose';

const DEFAULT_EXPIRATION = process.env.DEFAULT_EXPIRATION_CASHE;

export const getOrSetCache = (
	key: string,
	model: mongoose.Model<any>,
	queryMethod: (model: mongoose.Model<any>) => Promise<any>
) => {
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

export const validateMongooseId = z.custom<string>(
	(v) => Types.ObjectId.isValid(v),
	{
		message: 'id is not valid mongoose id ',
	}
);

export const findResourceById = async <T>(
	model: Model<T>,
	id: string
): Promise<T> => {
	try {
		const resource = await model.findById(id);
		if (!resource)
			throw new NotFound(
				`the resource you are trying to access is not found`
			);
		return resource;
	} catch (err: any) {
		throw new CustomError(err.message, 401);
	}
};

export const findOneResource = async <T>(
	model: Model<T>,
	key: string
): Promise<T> => {
	try {
		const resource = await model.findOne({ key });
		if (!resource)
			throw new NotFound(
				`the resource you are trying to access is not found`
			);

		return resource;
	} catch (err: any) {
		throw new CustomError(err.message, 401);
	}
};
