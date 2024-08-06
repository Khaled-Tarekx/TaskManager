import {ExtractJwt, Strategy, StrategyOptions} from "passport-jwt"
import passport from 'passport'
import User  from "../users/models.js";
import UnAuthenticated from "../../../custom-errors/unauthenticated.js";
import CustomError from "../../../custom-errors/custom-error.js";
import {NextFunction, Request, Response} from "express"
import { userSchemaWithId } from "./validation.js";

const secret: string | undefined = process.env.SECRET_KEY;
const validSecret: string = secret ?? '';

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: validSecret,
}

passport.serializeUser((user, done) => {
    done(null, (user as userSchemaWithId)._id);
})


passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user);
    } catch (err) {
        done(err)
    }
})

export default passport.use(new Strategy(opts, async (jwt_payload, done) => {
    try {
        if (!jwt_payload.id) {
            return done(new UnAuthenticated('Invalid token: subject missing'), false)
        }
        const user = await User.findById(jwt_payload.id)
        if (!user) {
            return done(null, false)
        } else {
            return done(null, user)
        }
    } catch (err: any) {
        return done(err, false)
    }
}))


export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((err: CustomError) => {
            next(new Error(err.message))
        })
    }
}



// export const asyncHandler = (fn: Function) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         fn(req, res, next).catch(next)
//     }
// }
