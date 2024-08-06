import mongoose, { model, Schema} from 'mongoose';
import uuid from "uuid"

export const InviteLinkSchema = new Schema ({
  path: { type: String, default: uuid.v4() },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSpace', required: true },
  expiresAt: { type: Date, default: () => Date.now() / 1000 + 3600 }, // expires in 1 hour
  createdAt: { type: Date, default: Date.now }
})

const InviteLink = model('InviteLink', InviteLinkSchema)

export default InviteLink
