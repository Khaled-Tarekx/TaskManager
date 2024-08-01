import User, {IUserDocument} from '../users/models.js'
import jwt from 'jsonwebtoken'
import {CustomError, NotFound} from '../../../custom-errors/main.js';
import {StatusCodes} from 'http-status-codes';
import zod, {AnyZodObject} from "zod"
import {Request, Response, NextFunction} from "express";
const secret: string | undefined = process.env.SECRET_KEY;
const validSecret: string = secret ?? '';

export const createTokenUser = async (user: IUserDocument) => {
    try {
        const tokenUser = await User.findOne({email: user.email});
        if (!tokenUser) {
            throw new NotFound('User not found');
        }
        return jwt.sign({id: tokenUser._id}, validSecret, {
            expiresIn: '1d',
        });
    } catch (err: any) {
        throw new CustomError(`Token creation failed: ${err.message}`, StatusCodes.BAD_REQUEST);
    }
};

let result: any
export const validateResource = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
           result = await schema.parseAsync(req.body, req.params)
            next()
        } catch (err: any) {
           next(new CustomError(err.message, 422))
        }
    }
}