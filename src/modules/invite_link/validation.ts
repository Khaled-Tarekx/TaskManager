import zod from "zod"

const inviteLinkValidation = zod.object({
    link: zod.string({
        required_error: "link is required",
        invalid_type_error: "link must be a string",
    }),
     user: zod.string({
        required_error: "user is required",
        invalid_type_error: "user must be a string",
    }),
    workspace: zod.string({
        required_error: "user is required",
        invalid_type_error: "user must be a string",
    }),
   expiresAt: zod.date({
       message: 'invalid date',
       invalid_type_error: "date must be a date object or a string"
   }),
   createdAt: zod.date({
       message: 'invalid date',
       invalid_type_error: "date must be a date object or a string"
   })
})