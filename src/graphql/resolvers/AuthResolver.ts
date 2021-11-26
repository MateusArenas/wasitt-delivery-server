import { authVerify } from "../../middlewares/auth";
import { 
    register as userRegister, 
    authenticate as userAuthenticate,
    forgotpass as userForgotpass
} from "../../services/authService"
import { indexPopulate } from "../../utils/populate";
import pubsub from "../config/pubsub";
const NEW_USER_EVENT = 'NEW_USER_EVENT'

const AuthResolver = {
    Auth: { 
        stores: async (user, { options, match }, context, info) => {
            const stores = await indexPopulate(user, info, match, options, 'Store')
            return stores
        },
    },
    Query: {
        async authenticate (_, { email, password }, { authorization }, info) {
            const user = await userAuthenticate(email, password)
            return user
        },
        async authorization (_, {}, { authorization }) {
            return await authVerify(authorization, user => user)
        },
    },
    Mutation: {
        async register (_, { email, password }, { }) {
            const user = await userRegister(email, password)
            return user
        },
        async forgotpass (_, { email }, context) {
            const user = await userForgotpass(email)
            return user
        },
    },
    
}

export default AuthResolver

