import { getAuthUser } from "../middlewares/auth"
import Follower, { FollowerInterface } from "../schemas/Follower"
import Store from "../schemas/Store"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexFollower (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const followers = await Follower.find(match, {}, options)

        if (!followers) { throw new Error("Follower or Feedbacks not exists!") }

        followers?.forEach(follower => { follower.self = follower?.user?.equals(auth) })

        return followers
    } catch (err) { throw new Error("Error searching followers") }
} 

export async function searchFollower (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const follower = await Follower.findOne(match, {}, options)

        if (!follower) { throw new Error("Follower not exists!") }

        follower.self = follower?.user?.equals(auth)

        return follower
    } catch (err) { throw new Error("Error searching follower") }
} 

export async function createFollower ({ store, user, ...input }: any) {
    try {
        const followeAlreadyExists = await Follower.findOne({ store, user }) 

        if (followeAlreadyExists) { throw new Error("You as follower in this Store!") }

        const follower = await Follower.create({ store, user, ...input })

        await Store.findByIdAndUpdate(store, { $push: { followers: follower?._id } })

        follower.self = true

        return follower
    } catch (err) { throw new Error("Error creating follower") }
} 

export async function updateFollower (_id: string, user: string, update: Partial<FollowerInterface>) {
    try {
        const follower = await Follower.findOneAndUpdate({ _id, user }, update)

        if (!follower) { throw new Error("Follower not exists!") }

        follower.self = true

        return follower
    } catch (err) { throw new Error("Error updating follower") }
}

export async function deleteFollower (_id: string, user: string) {
    try {
        const follower = await Follower.findOneAndRemove({ _id, user })

        if (!follower) { throw new Error("Follower not exists!") }

        await Store.findByIdAndUpdate(follower?.store, { $pull: { followers: follower?._id } })

        follower.self = true

        return follower
    } catch (err) { throw new Error("Error deleting follower") }
}