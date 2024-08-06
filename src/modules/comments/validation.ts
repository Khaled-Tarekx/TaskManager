import z from "zod"
import { Types } from "mongoose"


export const commentValidation = z.object({
    context: z.string({
        required_error: "you have to provide context for the comment"
    }).min(1, 'length must be 1 char least'),
    owner: z.string({
        required_error: "owner is required",
        invalid_type_error: "owner must be a string",
    }),
    task: z.string({
        required_error: "task is required",
        invalid_type_error: "task must be a string",
    }),
    id: z.custom(v => Types.ObjectId.isValid(v),
     {message: 'id is not valid mongoose id '})
})

export type CommentCreateSchema = z.infer<typeof commentValidation>
