import { authVerify } from "../../middlewares/auth"
import { countDocumentsOf } from "../../utils/countDocumentsOf"
import { indexPopulate } from "../../utils/populate"
import populateFields from "../config/populate"

import { 
    indexPromotion, 
    searchPromotion,
    createPromotion, 
    updatePromotion,
    deletePromotion, 
} from "../../services/promotionService"

const PromotionResolver = {
    Promotion: { 
        user: async (promotion, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await promotion.populate(populate).execPopulate()).user;
        },
        store: async (promotion, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await promotion.populate(populate).execPopulate()).store;
        },
        products: async (promotion, { options, match }, context, info) => {
            const products = await indexPopulate(promotion, info, match, options, 'Product')
            return products
        },
    },
    Query: {
        async promotions(_, { match, options }, { authorization }) {
            const promotions = await indexPromotion(match, options, authorization)
            return promotions
        },
        async promotion(_, { match, options }, { authorization }) {
            const promotion = await searchPromotion(match, options, authorization)
            return promotion
        },
    },
    Mutation: {
        createPromotion: async (_, { input }, { authorization: token }) => await authVerify(token, 
            async () => {
                const promotion = await createPromotion(input)
                return promotion
            }
        ),
        updatePromotion: async (_, { _id, input }, { authorization: token }) => await authVerify(token, 
            async user => {
                const promotion = await updatePromotion(_id, user, input)
                return promotion
            }
        ),
        deletePromotion: async (_, { _id }, { authorization: token }) => await authVerify(token, 
            async user => {
                const promotion = await deletePromotion(_id, user)
                return promotion
            }
        ),
    },
}

export default PromotionResolver

