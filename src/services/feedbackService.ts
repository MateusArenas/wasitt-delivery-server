import { getAuthUser } from "../middlewares/auth"
import Feedback, { FeedbackInterface } from "../schemas/Feedback"
import Store from "../schemas/Store"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexFeedback (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const feedbacks = await Feedback.find(match, {}, options)

        if (!feedbacks) { throw new Error("Feedback or Feedbacks not exists!") }

        feedbacks?.forEach(feedback => { feedback.self = feedback?.user?.equals(auth) })

        return feedbacks
    } catch (err) { throw new Error("Error searching feedbacks") }
} 

export async function searchFeedback (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const feedback = await Feedback.findOne(match, {}, options)

        if (!feedback) { throw new Error("Feedback not exists!") }

        feedback.self = feedback?.user?.equals(auth)

        return feedback
    } catch (err) { throw new Error("Error searching feedback") }
} 

export async function createFeedback ({ store, ...input }: any) {
    try {
        const feedback = await Feedback.create({ store, ...input })
        
        await Store.findByIdAndUpdate(store, { $push: { feedbacks: feedback?._id } })
        
        const { reply } = input

        if(reply) {
        await Feedback.findByIdAndUpdate(reply, { $push: { replies: feedback?._id } })
        }

        feedback.self = true

        return feedback
    } catch (err) { throw new Error("Error creating feedback") }
} 

export async function updateFeedback (_id: string, update: Partial<FeedbackInterface>) {
    try {
        const feedback = await Feedback.findByIdAndUpdate(_id, update)

        if (!feedback) { throw new Error("Feedback not exists!") }

        feedback.self = true

        return feedback
    } catch (err) { throw new Error("Error updating feedback") }
}

export async function deleteFeedback (_id: string) {
    try {
        const feedback = await Feedback.findByIdAndRemove(_id)

        await Store.findByIdAndUpdate(feedback?.store, { $pull: { feedbacks: _id } })

        if (!feedback) { throw new Error("Feedback not exists!") }

        feedback.self = true

        return feedback
    } catch (err) { throw new Error("Error deleting feedback") }
}