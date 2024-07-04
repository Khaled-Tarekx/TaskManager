import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt"
import passport from 'passport'
import  User, { IUserDocument }  from "../users/models.js";
import UnAuthenticated from "../../../custom-errors/unauthenticated.js";

const secret: string | undefined = process.env.SECRET_KEY;
const validSecret: string = secret ?? '';

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: validSecret,
}

passport.serializeUser((user, done) => {
    done(null, (user as IUserDocument)._id);
  })


passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user);
    } catch (err){
        done(err)
    }
})

export default passport.use(new Strategy(opts, async (jwt_payload, done) => {   
        try {
            if (!jwt_payload.id) {
                return done(new UnAuthenticated('Invalid token: subject missing'), false)}
            const user  = await User.findById(jwt_payload.id)

            if (!user) {
                return done(null, false)
            } 
            else {
                return done(null, user)
            }
        } catch(err: any) {
            return done(err, false)
        }
}))

