import type { z } from 'zod';
import type { createCommentSchema, updateCommentSchema } from './validation';

export type createCommentDTO = z.infer<typeof createCommentSchema>;
export type updateCommentDTO = z.infer<typeof updateCommentSchema>;
export type taskParam = { taskId: string };

import type { createReplySchema, updateReplySchema } from './validation';

export type createReplyDTO = z.infer<typeof createReplySchema>;
export type updateReplyDTO = z.infer<typeof updateReplySchema>;
