import { client,  } from "../../main.js";
import mongoose from "mongoose";

const DEFAULT_EXPIRATION = 3600 // 24 hours

export const getOrSetCache = (key: string, model: mongoose.Model<any>, queryMethod: (model: mongoose.Model<any>) => Promise<any>) => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await client.get(key);
            if (data != null) {
                return resolve(JSON.parse(data));
            }

            const freshData = await queryMethod(model);
            await client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
            resolve(freshData);
        } catch (err: any) {
            reject(err);
        }
    });
};
