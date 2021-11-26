import { Schema, model, Document } from 'mongoose'
import mongooseFuzzySearching from 'mongoose-fuzzy-searching'

export interface ProductInterface extends Document {
  self?: boolean
  store: string
  user: any
  categories?: Array<any>
  promotions?: Array<any>
  name: string
  price: number
  about?: string
  uri?: string

  spinOff?: boolean //se é um additional e não está a venda
  single?: boolean //indica que n é um grupo
  // additionals?: Array<any> //produtos adicionais pagar a mais

  // não vai precisar do adicionais pois se passar do teto começará a ser cobrado

  offset?: number // maximo de teto a ser alcançado em um combo// porcentagem, ex: 10

  products?: Array<any> // são os produtos para o combo
}

const ProductSchema = new Schema({
  single: {
    type: Boolean,
    default: true
  },
  spinOff: {
    type: Boolean,
    default: false
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    require: true,
  }],
  offset: {
    type: Number,
    default: 0
  },
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

// ProductSchema.watch().
// on('change', data => console.log(new Date(), data));

export default model<ProductInterface>('Product', ProductSchema)