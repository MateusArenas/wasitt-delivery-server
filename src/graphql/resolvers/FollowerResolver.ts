import { authVerify } from "../../middlewares/auth"
import { countDocumentsOf } from "../../utils/countDocumentsOf"
import populateFields from "../config/populate"
import { 
    indexFollower, 
    searchFollower,
    createFollower, 
    updateFollower, 
    deleteFollower, 
} from "../../services/followerService"

const FollowerResolver = {
    Follower: { 
        user: async (follower, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await follower.populate(populate).execPopulate()).user;
        },
        store: async (follower, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await follower.populate(populate).execPopulate()).store;
        },
    },
    Query: {
        async followers(_, { match, options }, { authorization }) {
            const followers = await indexFollower(match, options, authorization)
            return followers
        },
        async follower(_, { match, options }, { authorization }) {
            const follower = await searchFollower(match, options, authorization)
            return follower
        },
    },
    Mutation: {
        createFollower: async (_, { input }, { authorization: token }) => await authVerify(token, 
            async () => {
                const follower = await createFollower(input)
                return follower
            }
        ),
        updateFollower: async (_, { _id, input }, { authorization: token }) => await authVerify(token, 
            async user => {
                const follower = await updateFollower(_id, user, input)
                return follower
            }
        ),
        deleteFollower: async (_, { _id }, { authorization: token }) => await authVerify(token, 
            async user => {
                const follower = await deleteFollower(_id, user)
                return follower
            }
        ),
    },
}

export default FollowerResolver

