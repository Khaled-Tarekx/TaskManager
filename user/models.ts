import { genSalt, compare, hash } from "bcrypt";
import { NextFunction } from "express";

import mongoose, { Schema, Document, model } from 'mongoose';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

const regexString = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface IUser extends Document {
  username: string;
  isLoggedIn: boolean;
  roles: string;
  email: string;
  password: string;
  position: string;
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  isLoggedIn: { type: Boolean, default: false },
  roles: { type: String, default: "user" },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => regexString.test(v),
      message: 'Email: {VALUE} isn\'t a valid email',
    },
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Must be at least 6, got {VALUE}'],
    maxlength: 16,
  },
  position: {
    type: String,
    enum: {
      values: ['Front-End', 'Back-End'],
      message: '{VALUE} is not supported',
    },
  },
});


userSchema.pre<IUser>('save', async function (next) {  // only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  genSalt(SALT_ROUNDS), (err: Error| undefined, salt: number) => {
    if (err) return next(err);
    hash(this.password, salt), (err: Error | undefined, hash: string) => {
      if (err) return next(err);
      this.password = hash;
      next();
    }};
  })

  userSchema.methods.comparePassword = function (
    this: IUser, 
    candidatePassword: string, 
    cb: (err: Error | null, isMatch?: boolean) => void
  ): void {
    compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  };

const User = model<IUser>('User', userSchema);
export default User 

