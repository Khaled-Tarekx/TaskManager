import type {z} from "zod";
import type {createUserSchema, loginSchema} from "./validation";

export type createUserSchema = z.infer<typeof createUserSchema>;
export type loginSchema = z.infer<typeof loginSchema>;