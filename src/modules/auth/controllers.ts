import { NextFunction, Request, Response } from 'express'
import { createTokenUser } from "./utillities.js";
import User from "../users/models.js";
import { StatusCodes } from 'http-status-codes';
import { NotFound } from "../../../custom-errors/main.js";
import { asyncHandler } from "./middleware.js";
import { loginSchema, createUserSchema, userWithMethods } from "./validation.js";
import { HydratedDocumentFromSchema } from 'mongoose';
import { userSchemaM } from '../users/models.js';


export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, roles, position }: createUserSchema = req.body
    const user: HydratedDocumentFromSchema<typeof userSchemaM> = await User.create({ username, email, password, roles, position })
    res.status(StatusCodes.CREATED).json({ data: user })
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: loginSchema = req.body
    const user: userWithMethods | null = await User.findOne({ email: email });
    if (!user || !await user.comparePassword(password)) {
        return next(new NotFound(`no user found with the
          given email or password`))
    }
    const updatedUser: HydratedDocumentFromSchema<typeof userSchemaM> | null = await User.findOneAndUpdate({ email: user.email }
        , { isLoggedIn: true }, { new: true })
    const token = await createTokenUser(updatedUser)
    res.status(StatusCodes.OK).json({ token: token })
});
