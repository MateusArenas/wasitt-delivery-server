import { Schema, model, Document } from 'mongoose'

export interface FeedbackInterface extends Document {
  self?: boolean
  reply?: any
  replies?: Array<any>
  user: any
  store: any
}

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

export default model<FeedbackInterface>('Feedback', FeedbackSchema)