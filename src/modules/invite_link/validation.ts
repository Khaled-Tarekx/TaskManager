import z from "zod"

export const inviteLinkValidation = z.object({
     userId: z.string({
        required_error: "user is required",
        invalid_type_error: "user must be a string",
    }),
    workspaceId: z.string({
        required_error: "user is required",
        invalid_type_error: "user must be a string",
    })
})

export type createInviteLinkSchema = z.infer<typeof inviteLinkValidation>
