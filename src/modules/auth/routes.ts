import express from 'express'
import {login, register} from './controllers.js'
import {validateResource} from "./utillities.js";
import {loginValidation, userValidation} from "./validation.js";

const router = express.Router()


router.route("/register").post(validateResource(userValidation), register)
router.route("/login").post(validateResource(loginValidation), login)

export default router