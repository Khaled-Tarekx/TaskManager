import type {z} from "zod";
import type {createReplySchema, updateReplySchema} from "./validation";

export type  createReplyDTO = z.infer<typeof createReplySchema>;
export type updateReplyDTO = z.infer<typeof updateReplySchema>;
