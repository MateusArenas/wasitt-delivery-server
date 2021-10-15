import { Schema, model } from 'mongoose'

const FeedbackSchema = new Schema({
  message: String,
  reply: {
    type: Schema.Types.ObjectId,
    ref: 'Feedback',
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Feedback',
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    require: true,
  },
}, {
  timestamps: true,
})

export default model('Feedback', FeedbackSchema)