import {getModelForClass, prop, type Ref} from '@typegoose/typegoose';
import {TimeStamps} from '@typegoose/typegoose/lib/defaultClasses';
import {WorkSpaceSchema} from '../work_spaces/models.js';
import {UserSchema} from '../users/models.js';
import {Role} from './types.js';

export class MemberSchema extends TimeStamps {
    @prop({ref: WorkSpaceSchema, required: true})
    public workspace!: Ref<WorkSpaceSchema>;

    @prop({ref: UserSchema, required: true})
    public member!: Ref<UserSchema>;

    @prop({enum: Role, default: Role.member})
    public role!: Role;
}

export const MemberModel = getModelForClass(MemberSchema);

export default MemberModel;
