import User, { IUserDocument } from '../models.js'
import jwt from 'jsonwebtoken'
import { CustomError, NotFound } from '../../custom-errors/main.js';
import { StatusCodes } from 'http-status-codes';

const secret: string | undefined = process.env.SECRET_KEY;
const validSecret: string = secret ?? '';

export const createTokenUser = async (user: IUserDocument) => {
    try {
        const tokenUser = await User.findOne({ email: user.email });
        if (!tokenUser) {
            throw new NotFound('User not found');
        }
        const token = jwt.sign({ id: tokenUser._id }, validSecret, {
            expiresIn: '1d',
        });
        return token;
    } catch (err: any) {
        throw new CustomError(`Token creation failed: ${err.message}`, StatusCodes.BAD_REQUEST);
    }
};
