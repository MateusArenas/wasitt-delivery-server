import { Schema, model, Document } from 'mongoose'
import mongooseFuzzySearching from 'mongoose-fuzzy-searching'

export interface CategoryInterface extends Document {
  self?: boolean
  user: any
  store: string
  products?: Array<any>
  name: string
}

const CategorySchema = new Schema({
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
    ref: 'Product'
  }],
  name: {
    type: String,
    require: true,
  },
}, {
  timestamps: true,
})

CategorySchema.plugin(mongooseFuzzySearching, {
  fields: [
    {
      name: 'name',
    },
    {
      name: 'about',
    }
  ],
})

export default model<CategoryInterface>('Category', CategorySchema)