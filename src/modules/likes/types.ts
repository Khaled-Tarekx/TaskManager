import type {z} from "zod";
import type {createCommentLikeSchema, createReplyLikeSchema} from "./validation";


export type CommentLikeDTO = z.infer<typeof createCommentLikeSchema>;
export type ReplyLikeDTO = z.infer<typeof createReplyLikeSchema>;