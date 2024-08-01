import zod from "zod"

const commentValidation = zod.object({
    context: zod.string({
        required_error: "you have to provide context for the comment"
    }).min(1, 'length must be 1 char least'),
    owner: zod.string({
        required_error: "owner is required",
        invalid_type_error: "owner must be a string",
    }),
    task: zod.string({
        required_error: "task is required",
        invalid_type_error: "task must be a string",
    })
})
