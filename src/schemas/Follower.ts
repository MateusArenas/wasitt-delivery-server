import { Schema, model } from 'mongoose'

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

export default model('Follower', FollowerSchema)
//follower