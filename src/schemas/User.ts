import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

interface UserInterface extends Document {
  uri: string
  name: string
  email: string
  password: string
  stores: Array<any>
  passwordResetToken: string
  passwordResetExpires: Date
  phoneNumber: string
  ceep: string
  city: string
  district: string
  street: string
  houseNumber: string
  complement: string
  state: string
}

const UserSchema = new Schema({
  uri: String,
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  stores: [{
    type: Schema.Types.ObjectId,
    ref: 'Store',
  }],
  passwordResetToken: {
    type: String,
    default: Date.now
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  phoneNumber: String,
  ceep: String,
  city: String,
  district: String,
  street: String,
  houseNumber: String,
  complement: String,
  state: String,
}, {
  timestamps: true,
})


UserSchema.pre('save', async function(next) {
  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash

  next()
})

export default model<UserInterface>('User', UserSchema)