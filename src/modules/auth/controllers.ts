import {NextFunction, Request, Response} from 'express'
import {createTokenUser} from "./utillities.js";
import User, {IUserDocument} from "../users/models.js";
import {StatusCodes} from 'http-status-codes';
import { NotFound, UnAuthenticated} from "../../../custom-errors/main.js";
import {asyncHandler} from "./middleware.js";
import {userValidation} from "./validation.js";


export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userData = req.body
        await userValidation.safeParseAsync(userData)
        const user = await User.create(userData)
        res.status(StatusCodes.CREATED).json({data: user})
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body
    const user = await User.findOne({email: email});
        if (!user) {
            return next(new NotFound(`no user found with the
          given email or password`))
        }
        const isCorrect = await user?.comparePassword(password);
        if (!isCorrect) {
           return next(new UnAuthenticated('user password is wrong'))
        }
        const updatedUser: IUserDocument | any = await User.findOneAndUpdate({email: email}
            , {isLoggedIn: true}, { new: true });
        const token = await createTokenUser(updatedUser)
        res.status(StatusCodes.OK).json({token: token})

});
