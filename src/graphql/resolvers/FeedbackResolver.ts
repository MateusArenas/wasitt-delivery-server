import { authVerify } from "../../middlewares/auth"
import { countDocumentsOf } from "../../utils/countDocumentsOf"
import { indexPopulate } from "../../utils/populate"
import populateFields from "../config/populate"
import { 
    indexFeedback, 
    searchFeedback,
    createFeedback, 
    deleteFeedback, 
    updateFeedback, 
} from "../../services/feedbackService"


const FeedbackResolver = {
    Feedback: { 
        user: async (feedback, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await feedback.populate(populate).execPopulate()).user;
        },
        store: async (feedback, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await feedback.populate(populate).execPopulate()).store;
        },
        reply: async (feedback, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await feedback.populate(populate).execPopulate()).reply;
        },
        replies: async (feedback, { options, match }, context, info) => {
            const replies = await indexPopulate(feedback, info, match, options, 'Feedback')
            return replies
        },
    },
    Query: {
        async feedbacks(_, { match, options }, { authorization }) {
            const feedbacks = await indexFeedback(match, options, authorization)
            return feedbacks
        },
        async feedback(_, { match, options }, { authorization }) {
            const feedback = await searchFeedback(match, options, authorization)
            return feedback
        },
    },
    Mutation: {
        async createFeedback (_, { input }, { authorization: token }) {
            const feedback = await createFeedback(input)
            return feedback
        },
        async updateFeedback (_, { _id, input }, { authorization: token }) {
            const feedback = await updateFeedback(_id, input)
            return feedback
        },
        async deleteFeedback (_, { _id }, { authorization: token }) {
            const feedback = await deleteFeedback(_id)
            return feedback
        },
    },
}

export default FeedbackResolver

