import NotFound from "../custom-errors/not-found.js";
import  UserModel  from "./models.js";
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export const  getUsers = async (req: Request, res: Response) => {
  const users = await UserModel.find()
    res.status(StatusCodes.OK).json({ data: users, dbHits: users.length })
    mongoose.connection.close();

  }

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await UserModel.findById(id);
  console.log(user)
  if (!user) throw new NotFound(`no user found`)
  
  res.status(StatusCodes.OK).json({ data: user })
};

export const register = async (req: Request, res: Response) => {
  const userData = req.body
  // potato trial code
  const user = await UserModel.create(userData)
  res.status(StatusCodes.CREATED).json({ data: user })
};

export const login = async (req: Request, res: Response) => {
  // potato trial code
  const {email, password} = req.body
  const user = await UserModel.findOne({ email, password });
  if (!user) throw new NotFound(`no user found`)
  res.status(StatusCodes.OK).json({ data: user })

};

export const updateUser = async (req: Request, res: Response) => {
  // potato trial code
  const users = await UserModel.find();
};

export const deleteUser = async (req: Request, res: Response) => {
  // potato trial code
  const users = await UserModel.find();
};

