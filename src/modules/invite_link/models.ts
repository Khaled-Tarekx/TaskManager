import { getModelForClass, prop, type Ref } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import { UserSchema } from '../users/models';
import { WorkSpaceSchema } from '../workspaces/models';

export class InviteSchema {
	@prop({ type: String, default: uuidv4() })
	public token?: string;

	@prop({ ref: UserSchema, required: true })
	public receiver!: Ref<UserSchema>;

	@prop({ ref: WorkSpaceSchema, required: true })
	public workspace!: Ref<WorkSpaceSchema>;
	@prop({
		type: Date,
		required: true,
		default: () => new Date(Date.now() + 3600 * 1000),
	})
	public expiresAt!: Date;

	@prop({ type: Date, required: true, default: new Date(Date.now()) })
	public createdAt!: Date;
}

const InviteLinkModel = getModelForClass(InviteSchema);

export default InviteLinkModel;
