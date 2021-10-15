import { Schema, model, Document } from 'mongoose'

interface OrderInterface extends Document {
  store: string
  user: string
  bag: {
    _id: string
    store: any
    user: any
    bundles: Array<{
      _id: string,
      store: any,
      user: any,
      product: any,
      quantity: number,
      comment?: string,
    }>
  }

  name: string
  phoneNumber: string

  ceep: string
  city: string
  district: string
  street: string
  houseNumber: string
  complement: string
  state: string

  delivery: boolean
  deliveryTimeMin: string
  deliveryTimeMax: string
  deliveryPrice: number
  pickup: boolean

  paymentMoney: boolean

  thing: boolean
  thingValue: number
  paymentDebt: boolean
  paymentCredit: boolean
  paymentMealTicket: boolean
}

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    require: true,
  },
  bag: {
    _id: String,
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      require: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    bundles: [{
      store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        require: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      product: Object,
      quantity: Number,
      comment: String,
    }]
  },
  name: {
    type: String,
    require: true
  },
  phoneNumber: {
    type: String,
    require: true
  },

  ceep: String,
  city: String,
  district: String,
  street: String,
  houseNumber: String,
  complement: String,
  state: String,

  delivery: { type: Boolean },
  deliveryTimeMin: String,
  deliveryTimeMax: String,
  deliveryPrice: Number,
  pickup: { type: Boolean },

  paymentMoney: Boolean,
  thing: { type: Boolean, default: false },
  thingValue: { type: Number },
  paymentDebt: Boolean,
  paymentCredit: Boolean,
  paymentMealTicket: Boolean,

  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: '1d' }
  }
}, {
  timestamps: true,
})

export default model<OrderInterface>('Order', OrderSchema)