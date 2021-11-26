import { authVerify } from "../../middlewares/auth"
import { countDocumentsOf } from "../../utils/countDocumentsOf"
import { indexPopulate } from "../../utils/populate"
import populateFields from "../config/populate"
import { 
    createCategory, 
    deleteCategory, 
    indexCategory, 
    searchCategory, 
    updateCategory
} from "../../services/categoryService"

const CategoryResolver = {
    Category: { 
        user: async (category, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await category.populate(populate).execPopulate()).user;
        },
        store: async (category, { options, match }, context, info) => {
            const populate = await populateFields(info, { options, match })
            return (await category.populate(populate).execPopulate()).store;
        },
        products: async (category, { options, match }, context, info) => {
            const products = await indexPopulate(category, info, match, options, 'Product')
            return products
        },
    },
    Query: {
        async categories(_, { match, options }, { authorization }) {
            const categories = await indexCategory(match, options, authorization)
            return categories
        },
        async category(_, { match, options }, { authorization }) {
            const category = await searchCategory(match, options, authorization)
            return category
        },
    },
    Mutation: {
        createCategory: async (_, { input }, { authorization: token }) => await authVerify(token, 
            async () => {
                const category = await createCategory(input)
                return category
            }
        ),
        updateCategory: async (_, { _id, input }, { authorization: token }) => await authVerify(token, 
            async user => {
                const category = await updateCategory(_id, user, input)
                return category
            }
        ),
        deleteCategory: async (_, { _id }, { authorization: token }) => await authVerify(token, 
            async user => {
                const category = await deleteCategory(_id, user)
                return category
            }
        ),
    },
}

export default CategoryResolver

