import { getAuthUser } from "../middlewares/auth"
import Category from "../schemas/Category"
import Feedback from "../schemas/Feedback"
import Follower from "../schemas/Follower"
import Order from "../schemas/Order"
import Product from "../schemas/Product"
import Promotion from "../schemas/Promotion"
import Store from "../schemas/Store"
import User from "../schemas/User"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexUser (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const users = await User.find(match, {}, options)

        if (!users) { throw new Error("Promotion or Feedbacks not exists!") }

        users?.forEach(user => { user.self = user?._id.equals(auth) })

        return users
    } catch (err) { throw new Error("Error searching users") }
} 

export async function searchUser (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const user = await User.findOne(match, {}, options)

        if (!user) { throw new Error("Promotion not exists!") }

        user.self = user?._id?.equals(auth)

        return user
    } catch (err) { throw new Error("Error searching user") }
} 


export async function updateUser (id: string, input: any) {
    try {
        const user = await User.findByIdAndUpdate(id, input)

        if (!user) { throw new Error("User not exists!") }

        user.self = true

        return user
    } catch (err) { throw new Error("Error updating user") }
} 

export async function deleteUser (_id: string) {
    try {
        const user = await User.findByIdAndDelete(_id)

        if (!user) { throw new Error("User not exists!") }

        await Store.remove({ _id: { $in: user?.stores } })

        await Product.remove({ store: { $in: user?.stores } })
        await Category.remove({ store: { $in: user?.stores } })
        await Promotion.remove({ store: { $in: user?.stores } })

        await Feedback.remove({ store: { $in: user?.stores } })
        await Follower.remove({ store: { $in: user?.stores } })

        await Order.remove({ store: { $in: user?.stores } })

        user.self = true

        return user
    } catch (err) { throw new Error("Error deleting user") }
}