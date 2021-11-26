import { ObjectId } from "mongoose"
import { getAuthUser, selfVerify } from "../middlewares/auth"
import Category from "../schemas/Category"
import Feedback from "../schemas/Feedback"
import Follower from "../schemas/Follower"
import Order from "../schemas/Order"
import Product from "../schemas/Product"
import Promotion from "../schemas/Promotion"
import Store, { StoreInterface } from "../schemas/Store"
import User from "../schemas/User"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexStore (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)
        
        const stores = await Store.find(match, {}, options)

        if (!stores) { throw new Error("Store or Stores not exists!") }

        stores?.forEach(store => { store.self = store?.user?.equals(auth) })

        return stores
    } catch (err) { throw new Error("Error searching stores") }
} 

export async function searchStore (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const store = await Store.findOne(match, {}, options)

        if (!store) { throw new Error("Store not exists!") }

        store.self = store?.user?.equals(auth)

        return store
    } catch (err) { throw new Error("Error searching store") }
} 

export async function createStore ({ user, name, ...input }: any) {
    try {
        const storeAlreadyExists = await Store.findOne({ name })

        if (storeAlreadyExists) { throw new Error("Store already exists!") }

        const store = await Store.create({ user, name, ...input })
        
        await User.findByIdAndUpdate(user, { $push: { stores: store?._id } })

        store.self = true

        return store
    } catch (err) { throw new Error("Error creating store") }
} 

export async function updateStore (_id: string, user: string, update: Partial<StoreInterface>) {
    try {
        const store = await Store.findOneAndUpdate({ _id, user }, update)

        if (!store) { throw new Error("Store not exists!") }
        
        store.self = true

        return store
    } catch (err) { throw new Error("Error updating store") }
}

export async function deleteStore (_id: string, user: string) {
    try {
        const store = await Store.findOneAndDelete({ _id, user  })

        if (!store) { throw new Error("Store not exists!") }

        await User.findByIdAndUpdate(store?.user, { $pull: { stores: _id } })

        await Product.remove({ _id: { $in: store?.products } })
        await Category.remove({ _id: { $in: store?.categories } })
        await Promotion.remove({ _id: { $in: store?.promotions } })

        await Feedback.remove({ _id: { $in: store?.feedbacks } })
        await Follower.remove({ _id: { $in: store?.followers } })

        await Order.remove({ _id: { $in: store?.orders } })

        return store
    } catch (err) { throw new Error("Error deleting store") }
}

