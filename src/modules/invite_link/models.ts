import mongoose, {Document, model, Schema} from 'mongoose';

export interface  InviteLinkInterface extends Document {
  link: String,
  user: mongoose.Types.ObjectId
  workspace:  mongoose.Types.ObjectId
  expiresAt: Date,
  createdAt: Date
}



const InviteLinkSchema = new Schema ({
  link: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSpace' },
   expiresAt: { type: Date, default: () => Date.now() / 1000 + 3600 }, // expires in 1 hour
  createdAt: { type: Date, default: Date.now }
})

const inviteLink = model('inviteLink', InviteLinkSchema)

export default inviteLink
