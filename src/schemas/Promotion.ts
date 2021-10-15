import { Schema, model, Document } from 'mongoose'
import mongooseFuzzySearching from 'mongoose-fuzzy-searching'

interface PromotionInterface extends Document {
  store: string
  user: any
  products: Array<any>
  name: string
  percent: number
  about?: string
  uri?: string
}

const PromotionSchema = new Schema({
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
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  name: {
    type: String,
    require: true
  },
  percent: {
    type: Number,
    require: true
  },
  about: String,
  uri: String,
}, {
  timestamps: true,
})

PromotionSchema.plugin(mongooseFuzzySearching, {
  fields: [
    {
      name: 'name',
    },
    {
      name: 'about',
    }
  ],
})

export default model<PromotionInterface>('Promotion', PromotionSchema)