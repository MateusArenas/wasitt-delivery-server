import { Schema, model, Document } from 'mongoose'
import mongooseFuzzySearching from 'mongoose-fuzzy-searching'

interface ProductInterface extends Document {
  store: string
  user: any
  categories: Array<any>
  promotions: Array<any>
  name: string
  price: number
  about?: string
  uri?: string
}

const ProductSchema = new Schema({
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
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    require: true,
  }],
  promotions: [{
    type: Schema.Types.ObjectId,
    ref: 'Promotion',
    require: true,
  }],
  name: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  about: String,
  uri: String,
}, {
  timestamps: true,
})

ProductSchema.plugin(mongooseFuzzySearching, {
  fields: [
    {
      name: 'name',
    },
    {
      name: 'about',
    }
  ],
})

export default model<ProductInterface>('Product', ProductSchema)