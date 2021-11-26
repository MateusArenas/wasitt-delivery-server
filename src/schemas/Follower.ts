import { Schema, model, Document } from 'mongoose'

export interface FollowerInterface extends Document {
  self?: boolean
  user: any
  store: any
}

const FollowerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    require: true,
  },
}, {
  timestamps: true,
})

export default model<FollowerInterface>('Follower', FollowerSchema)