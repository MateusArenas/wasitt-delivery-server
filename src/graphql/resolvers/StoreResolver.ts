import { authVerify, getAuthUser } from "../../middlewares/auth"
import { countDocumentsOf } from "../../utils/countDocumentsOf"
import { indexPopulate } from "../../utils/populate"
import populateFields from "../config/populate"

import { 
    indexStore, 
    searchStore, 
    createStore, 
    updateStore,
    deleteStore,
} from "../../services/storeService"


const StoreResolvers = {
    Store: { 
        user: async (store, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await store.populate(populate).execPopulate()).user;
        },
        products: async (store, { options, match }, context, info) => {
            const products = await indexPopulate(store, info, match, options, 'Product')
            return products
        },
        categories: async (store, { options, match }, context, info) => {
            const categories = await indexPopulate(store, info, match, options, 'Category')
            return categories
        },
        promotions: async (store, { options, match }, context, info) => {
            const promotions = await indexPopulate(store, info, match, options, 'Promotion')
            return promotions
        },
        followers: async (store, { options, match }, context, info) => {
            const followers = await indexPopulate(store, info, match, options, 'Follower')
            return followers
        },
        feedbacks: async (store, { options, match }, context, info) => {
            const feedbacks = await indexPopulate(store, info, match, options, 'Feedback')
            return feedbacks
        },
    },
    Query: {
        async stores(_, { match, options }, { authorization }) {
            const stores = await indexStore(match, options, authorization)
            return stores
        },
        async store(_, { match, options }, { authorization }) {
            const store = await searchStore(match, options, authorization)
            return store
        },
    },
    Mutation: {
        createStore: async (_, { input }, { authorization: token }) => await authVerify(token, 
            async () => {
                const store = await createStore(input)
                return store
            }
        ),
        updateStore: async (_, { _id, input }, { authorization: token }) => await authVerify(token, 
            async user => {
                const store = await updateStore(_id, user, input)
                return store
            }
        ),
        deleteStore: async (_, { _id }, { authorization: token }) => await authVerify(token, 
            async user => {
                const store = await deleteStore(_id, user)
                return store
            }
        ),
    },
}

export default StoreResolvers

