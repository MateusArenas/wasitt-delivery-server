import { authVerify } from "../../middlewares/auth"
import { countDocumentsOf } from "../../utils/countDocumentsOf"
import populateFields from "../config/populate"

import { 
    indexOrder, 
    searchOrder, 
    createOrder, 
    updateOrder,
    deleteOrder, 
} from "../../services/orderService"

const OrderResolver = {
    Order: { 
        user: async (order, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await order.populate(populate).execPopulate()).user;
        },
        store: async (order, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await order.populate(populate).execPopulate()).store;
        },
    },
    Query: {
        async orders(_, { match, options }, { authorization }) {
            const orders = await indexOrder(match, options, authorization)
            return orders
        },
        async order(_, { match, options }, { authorization }) {
            const order = await searchOrder(match, options, authorization)
            return order
        },
    },
    Mutation: {
        createOrder: async (_, { input }, { authorization: token }) => await authVerify(token, 
            async () => {
                const order = await createOrder(input)
                return order
            }
        ),
        updateOrder: async (_, { _id, input }, { authorization: token }) => await authVerify(token, 
            async () => {
                const order = await updateOrder(_id, input)
                return order
            }
        ),
        deleteOrder: async (_, { _id }, { authorization: token }) => await authVerify(token, 
            async () => {
                const order = await deleteOrder(_id)
                return order
            }
        ),
    },
}

export default OrderResolver

