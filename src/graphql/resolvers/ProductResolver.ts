import { authVerify } from "../../middlewares/auth"
import { countDocumentsOf } from "../../utils/countDocumentsOf"
import { indexPopulate } from "../../utils/populate"
import populateFields from "../config/populate"

import { 
    indexProduct, 
    searchProduct, 
    createProduct, 
    updateProduct,
    deleteProduct,
} from "../../services/productService"

const ProductResolver = {
    Product: { 
        user: async (product, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await product.populate(populate).execPopulate()).user;
        },
        store: async (product, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await product.populate(populate).execPopulate()).store;
        },
        products: async (product, { options, match }, context, info) => {
            const products = await indexPopulate(product, info, match, options, 'Product')
            return products
        },
        categories: async (product, { options, match }, context, info) => {
            const categories = await indexPopulate(product, info, match, options, 'Category')
            return categories
        },
        promotions: async (product, { options, match }, context, info) => {
            const promotions = await indexPopulate(product, info, match, options, 'Promotion')
            return promotions
        },
    },
    Query: {
        async products(_, { match, options }, { authorization }) {
            const products = await indexProduct(match, options, authorization)
            return products
        },
        async product(_, { match, options }, { authorization }) {
            const product = await searchProduct(match, options, authorization)
            return product
        },
    },
    Mutation: {
        createProduct: async (_, { input }, { authorization: token }) => await authVerify(token, 
            async () => {
                const product = await createProduct(input)
                return product
            }
        ),
        updateProduct: async (_, { _id, input }, { authorization: token }) => await authVerify(token, 
            async user => {
                const product = await updateProduct(_id, user, input)
                return product
            }
        ),
        deleteProduct: async (_, { _id }, { authorization: token }) => await authVerify(token, 
            async user => {
                const product = await deleteProduct(_id, user)
                return product
            }
        ),
    },
}

export default ProductResolver

