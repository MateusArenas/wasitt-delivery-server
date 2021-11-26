import { getAuthUser } from "../middlewares/auth"
import Follower, { FollowerInterface } from "../schemas/Follower"
import Order, { OrderInterface } from "../schemas/Order"
import Store from "../schemas/Store"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexOrder (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const orders = await Order.find(match, {}, options)

        if (!orders) { throw new Error("Order or Orders not exists!") }

        orders?.forEach(order => { order.self = order?.user?.equals(auth) })

        return orders
    } catch (err) { throw new Error("Error searching orders") }
} 

export async function searchOrder (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const order = await Order.findOne(match, {}, options)

        if (!order) { throw new Error("Order not exists!") }

        order.self = order?.user?.equals(auth)

        return order
    } catch (err) { throw new Error("Error searching order") }
} 

export async function createOrder ({ store, ...input }: any) {
    try {
        const order = await Order.create({ store, ...input })

        await Store.findByIdAndUpdate(store, { $push: { orders: order?._id } })

        order.self = true

        return order
    } catch (err) { throw new Error("Error creating order") }
} 

export async function updateOrder (_id: string, update: Partial<OrderInterface>) {
    try {
        const order = await Order.findByIdAndUpdate(_id, update)

        if (!order) { throw new Error("Order not exists!") }

        order.self = true

        return order
    } catch (err) { throw new Error("Error updating order") }
}

export async function deleteOrder (_id: string) {
    try {
        const order = await Order.findByIdAndRemove(_id)

        if (!order) { throw new Error("Order not exists!") }

        await Store.findByIdAndUpdate(order?.store, { $pull: { orders: _id } })

        order.self = true

        return order
    } catch (err) { throw new Error("Error deleting order") }
}