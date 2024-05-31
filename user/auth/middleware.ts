import { Strategy, ExtractJwt } from "passport-jwt"
import passport from 'passport'
import  crypto  from 'crypto'
import  User  from "user/models";
const secretKey = crypto.randomBytes(32).toString('hex');


const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey,
}

passport.use(new Strategy(opts, (jwt_payload, done) => {
    User.findOne({ id: jwt_payload.sub },
         (err: Error | undefined, user: typeof User) => {
            if (err) {
                return done(err, false)
            } 

            if (user) {
                return done(null, user)
            } 

            else {
                return done(null, false)
                // or you could create a new account

            }
    })

}))
