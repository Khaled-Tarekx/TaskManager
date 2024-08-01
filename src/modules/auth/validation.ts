import zod from "zod"

const regexString = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rolesEnum = ["user", "admin"] as const;
const positionEnum = ['Front-End', 'Back-End'] as const

export const userValidation = zod.object({
    username: zod.string({
        required_error: "Username is required",
        invalid_type_error: "Username must be a string",
    }),

    email: zod.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    }).email({message: "Invalid email address"}).regex(regexString),

    password: zod.string({
        required_error: "password is required",
        invalid_type_error: "password must be a string",
    }).min(5, 'password cant be less than 6 characters').max(255, 'password cant be less than 255 characters'),

    isLoggedIn: zod.boolean({
        invalid_type_error: "login state must be a boolean"
    }).optional(),

    roles: zod.enum(rolesEnum).optional(),
    position: zod.enum(positionEnum)
})

   export const loginValidation = zod.object({
       email: zod.string({
           required_error: "Email is required",
           invalid_type_error: "Email must be a string",
       }).email({message: "Invalid email address"}).regex(regexString),

       password: zod.string({
           required_error: "password is required",
           invalid_type_error: "password must be a string",
       }).min(5, 'password cant be less than 6 characters').max(255, 'password cant be less than 255 characters'),
   })
