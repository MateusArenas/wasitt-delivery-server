import { Schema, model, Document } from 'mongoose'
import mongooseFuzzySearching from 'mongoose-fuzzy-searching'

export interface StoreInterface extends Document {
  self?: boolean
  name: string
  email: string
  user: any
  followers: Array<any>
  feedbacks: Array<any>
  products: Array<any>
  categories: Array<any>
  promotions: Array<any>
  orders: Array<any>
  uri: String,
  about: String,
  phoneNumber: String,
  whatsappNumber: String,
  delivery: Boolean,
  deliveryTimeMin: String,
  deliveryTimeMax: String,
  minDeliveryBuyValue: Number,
  deliveryAbout: String,
  deliveryPrice: Number,
  pickup: Boolean,
  paymentMoney: Boolean,
  paymentDebt: Boolean,
  paymentCredit: Boolean,
  paymentMealTicket: Boolean,

  monday: boolean,
  mondayStart: string,
  mondayEnd: string,

  tuesday: boolean,
  tuesdayStart: string, 
  tuesdayEnd: string, 

  wednesday: boolean,
  wednesdayStart: string,
  wednesdayEnd: string,

  thursday: boolean,
  thursdayStart: string, 
  thursdayEnd: string, 

  friday: boolean,
  fridayStart: string, 
  fridayEnd: string, 

  saturday: boolean,
  saturdayStart: string, 
  saturdayEnd: string, 

  sunday: boolean,
  sundayStart: string,
  sundayEnd: string,

  cnpj: string,

  debtPayments: Array<String>,
  creditPayments: Array<String>,
  mealTicketPayments: Array<String>,

  ceep: string,
  city: string,
  district: string,
  street: string,
  houseNumber: string,
  complement: string,
  state: string,
}

const StoreSchema = new Schema({
  name: {
    type: String,
    unique: true,
    require: true,
  },
  email: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'Follower'
  }],
  feedbacks: [{
    type: Schema.Types.ObjectId,
    ref: 'Feedback'
  }],
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  promotions: [{
    type: Schema.Types.ObjectId,
    ref: 'Promotion',
    require: true,
  }],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order',
    require: true,
  }],
  uri: String,
  about: String,
  phoneNumber: String,
  whatsappNumber: String,
  delivery: { type: Boolean },
  deliveryTimeMin: String,
  deliveryTimeMax: String,
  minDeliveryBuyValue: Number,
  deliveryAbout: String,
  deliveryPrice: Number,
  pickup: { type: Boolean },
  paymentMoney: { type: Boolean },
  paymentDebt: Boolean,
  paymentCredit: Boolean,
  paymentMealTicket: Boolean,

  monday: { type: Boolean, default: true },
  mondayStart: String,
  mondayEnd: String,

  tuesday: { type: Boolean, default: true },
  tuesdayStart: String, 
  tuesdayEnd: String, 

  wednesday: { type: Boolean, default: true },
  wednesdayStart: String,
  wednesdayEnd: String,

  thursday: { type: Boolean, default: true },
  thursdayStart: String, 
  thursdayEnd: String, 

  friday: { type: Boolean, default: true },
  fridayStart: String, 
  fridayEnd: String, 

  saturday: { type: Boolean, default: true },
  saturdayStart: String, 
  saturdayEnd: String, 

  sunday: { type: Boolean, default: true },
  sundayStart: String,
  sundayEnd: String,

  cnpj: String,

  debtPayments: [String],
  creditPayments: [String],
  mealTicketPayments: [String],

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

StoreSchema.plugin(mongooseFuzzySearching, {
  fields: [
    {
      name: 'name',
    },
    {
      name: 'about',
    }
  ],
})

export default model<StoreInterface>('Store', StoreSchema)