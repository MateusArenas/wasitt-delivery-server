import { authVerify } from "../../middlewares/auth";
import { countDocumentsOf } from "../../utils/countDocumentsOf";
import { indexPopulate } from "../../utils/populate";

import { 
    deleteUser, 
    indexUser,
    searchUser,
    updateUser,
} from "../../services/userService";

const UserResolver = {
    User: { 
        stores: async (user, { options, match }, context, info) => {
            const stores = await indexPopulate(user, info, match, options, 'Store')
            return stores
        },
    },
    Query: {
        async users(_, { match, options }, { authorization }) {
            const users = await indexUser(match, options, authorization)
            return users
        },
        async user(_, { match, options }, { authorization }) {
            const user = await searchUser(match, options, authorization)
            return user
        },
    },
    Mutation: {
        updateUser: async (_, { input }, { authorization: token }) => await authVerify(token, 
            async auth => {
                const user = await updateUser(auth, input)
                return user
            }
        ),
        deleteUser: async (_, { }, { authorization: token }) => await authVerify(token, 
            async auth => {
                const user = await deleteUser(auth)
                return user
            }
        ),
    },
    
}

export default UserResolver

