import { UserModel } from "./models.js";

export const getUsers = (req, res) => {
  // potato trial code
  const users = UserModel.find();
  console.log(users);
};
