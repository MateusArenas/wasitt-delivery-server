import { countDocumentsOf } from "../../utils/countDocumentsOf"
import { capitalize } from "../../utils/format"
import pubsub from "../config/pubsub"
import { withFilter } from 'graphql-subscriptions';
import User from "../../schemas/User";
import Product from "../../schemas/Product";
import asyncify from 'callback-to-async-iterator';
import { authVerify } from "../../middlewares/auth";

const NEW_USER_EVENT = 'NEW_USER_EVENT'

// const personEventEmitter = Product.watch()

// personEventEmitter.on('change', change => console.log(JSON.stringify(change)))


// productEventEmitter.on('change', change => console.log(JSON.stringify(change)))

const listenToNewMessages = async (callback) => {
    // const productEventEmitter = Product.watch()
    // return productEventEmitter.on('change', change =>  callback(change)) 
    return { oi: 0 }
}
  
  // Kick off the listener
  listenToNewMessages(change => {
    console.log(JSON.stringify(change))
  })


const DefaultResolvers = {
    Query: {
        async totalCounts(_, { querys }) {
            return await Promise.all(
                querys?.map(async ({model, match, options}) => 
                    await countDocumentsOf(capitalize(model), match, options)
                )
            )
        },
        async totalCount(_, { model, match, options }) {
            return await countDocumentsOf(capitalize(model), match, options)
        },
    },
    Subscription: {
        newUser: {
            resolve: (payload, args, context, info) => {
            // Manipulate and return the new value
                return payload.newUser
            },
            // subscribe: () => pubsub.asyncIterator(NEW_USER_EVENT),
            subscribe: withFilter(() => pubsub.asyncIterator(NEW_USER_EVENT), 
                async (payload, args, { authorization: token }) => await authVerify(token, auth => {
                    // context.user = auth;
                    return payload.newUser?._id !== auth
                })
            ),  
        }
    },
}

export default DefaultResolvers

