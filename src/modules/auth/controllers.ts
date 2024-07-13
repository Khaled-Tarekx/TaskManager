import { Request, Response, NextFunction } from 'express'
import { createTokenUser } from "./utillities.js";
import  User, { IUserDocument }  from "../users/models.js";
import { StatusCodes } from 'http-status-codes';
import { UnAuthenticated, NotFound, BadRequest } from "../../../custom-errors/main.js";



export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = req.body
        // potato trial code
        const user = await User.create(userData)
        res.status(StatusCodes.CREATED).json({ data: user })
    } catch (err: any) {
        next(new BadRequest(err.message))
    } 
};
  
export const login = async (req: Request, res: Response, next: NextFunction) => {
    // potato trial code
    const { email, password } = req.body
  
    try {
      const user = await User.findOne({ email: email });
        if (!user) next(new NotFound(`no user found with the
          given email or password`))
  
          const isCorrect = await user?.comparePassword(password);
          if (!isCorrect) {
            next(new UnAuthenticated('user password is wrong'))
          } 
          const updatedUser: IUserDocument | any  = await User.findOneAndUpdate({ email: email }
            , { isLoggedIn: true }, { new: true }); 
          const token = await createTokenUser(updatedUser)
          res.status(StatusCodes.OK).json({ token: token })
  } catch (err: any) {
    next(new BadRequest(err.message))
    }
};
