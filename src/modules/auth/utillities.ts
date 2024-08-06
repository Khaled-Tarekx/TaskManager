import User, { userSchemaM } from '../users/models.js'
import jwt from 'jsonwebtoken'
import { CustomError, NotFound } from '../../../custom-errors/main.js';
import { StatusCodes } from 'http-status-codes';
import { AnyZodObject, ZodError } from "zod"
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from './middleware.js';
import { createUserSchema } from './validation.js';
import { HydratedDocumentFromSchema } from 'mongoose';
const secret: string | undefined = process.env.SECRET_KEY;
const validSecret: string = secret ?? '';

export const createTokenUser = async (
    user: HydratedDocumentFromSchema<typeof userSchemaM> | null) => {
    try {
        const tokenUser = await User.findOne({ email: user?.email });
        if (!tokenUser) {
            throw new NotFound('User not found');
        }
        return jwt.sign({ id: tokenUser._id }, validSecret, {
            expiresIn: '1d',
        });
    } catch (err: any) {
        throw new CustomError(`Token creation failed: ${err.message}`, StatusCodes.BAD_REQUEST);
    }
};

type zodSchema = {
    bodySchema?: AnyZodObject,
    querySchema?: AnyZodObject,
    paramsSchema?: AnyZodObject
}

export const validateResource = ({
    bodySchema,
    querySchema,
    paramsSchema
}: zodSchema) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (bodySchema) {
                await bodySchema.parseAsync(req.body)
            }
            if (querySchema) {
                await querySchema.parseAsync(req.query)
            }
            if (paramsSchema) {
                await paramsSchema.parseAsync(req.params)
            }
            next()
        } catch (err: any) {
            if (err instanceof ZodError) {
                const errorMessages = err.issues.map((issue) => [ issue.path, issue.message ]);
                next(new CustomError(errorMessages.join(', '), 422));   
            } else {
                next(new CustomError(err.message, 422))
            }
        }
    })
}
