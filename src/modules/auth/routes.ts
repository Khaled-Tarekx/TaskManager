import express from 'express'
import { login, register} from './controllers.js'
import {validateResource} from "./utillities.js";
import {loginValidation, userValidation} from "./validation.js";

const router = express.Router()


router.route("/register").post(validateResource({ bodySchema: userValidation }), register)
router.route("/login").post(validateResource({ bodySchema: loginValidation }), login)

export default router