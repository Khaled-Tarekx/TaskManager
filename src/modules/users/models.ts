import { genSalt, compare, hash } from "bcrypt";
import { CustomError, UnAuthenticated } from "../../../custom-errors/main.js";

import  { Schema, Document, model } from 'mongoose';
import { StatusCodes } from "http-status-codes";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

const regexString = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  username: string;
  isLoggedIn: boolean;
  roles: string;
  email: string;
  password: string;
  position: string;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  isLoggedIn: { type: Boolean, default: false },
  roles: { type: String, default: "user",
   enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not supported',
    }},
  email: {
    type: String,
    required: true,
    match: [regexString, 'Email: {VALUE} isn\'t a valid email'],
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Must be at least 6'],
    maxlength: 255,
  },
  position: {
    type: String,
    enum: {
      values: ['Front-End', 'Back-End'],
      message: '{VALUE} is not supported',
    }
  }
},
{ timestamps: true, strict: true });

userSchema.pre<IUserDocument>('save', async function (next) {
  try {

    if (!this.isModified('password')) return next();
    const salt = await genSalt(SALT_ROUNDS);
    this.password = await hash(this.password, salt);
    next();

  } catch (err: any) {
    next(err);
  }
});

  userSchema.pre<IUserDocument>('save', async function (next) {
    try {
      const existingUser = await User.findOne({email: this.email});
      if (existingUser) {
         next(new CustomError("this email already exists", StatusCodes.BAD_REQUEST)) 
        }
      next()
    } catch (err: any) {
      next(err)
  }
})
  

  userSchema.methods.comparePassword = async function (
    candidatePassword: string,
  ) {
    try {
      return await compare(candidatePassword, this.password)
    } catch(err: any){
      throw new UnAuthenticated( `err checking password: ${err.message}`)
    }
  }


const User = model<IUserDocument>('User', userSchema);
export default User 

