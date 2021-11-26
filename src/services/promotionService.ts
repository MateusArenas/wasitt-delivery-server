import { getAuthUser } from "../middlewares/auth"
import Product from "../schemas/Product"
import Promotion, { PromotionInterface } from "../schemas/Promotion"
import Store from "../schemas/Store"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexPromotion (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const promotions = await Promotion.find(match, {}, options)

        if (!promotions) { throw new Error("Promotion or Feedbacks not exists!") }

        promotions?.forEach(promotion => { promotion.self = promotion?.user?.equals(auth) })

        return promotions
    } catch (err) { throw new Error("Error searching promotions") }
} 

export async function searchPromotion (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const promotion = await Promotion.findOne(match, {}, options)

        if (!promotion) { throw new Error("Promotion not exists!") }

        promotion.self = promotion?.user?.equals(auth)

        return promotion
    } catch (err) { throw new Error("Error searching promotion") }
} 

export async function createPromotion ({ store, name, user, ...input }: any) {
    try {
        const promotionAlreadyExists = await Promotion.findOne({ store, name }) 

        if (promotionAlreadyExists) { throw new Error("already exists Promotion equal name in Store!") }

        const promotion = await Promotion.create({ store, name, user, ...input})
        
        const { products } = input

        if (products?.length > 0) {
        await Product.updateMany({ _id: { $in: products } }, { $push: { promotions: promotion?._id } })
        }

        await Store.findByIdAndUpdate(store, { $push: { promotions: promotion?._id } })

        promotion.self = true

        return promotion
    } catch (err) { throw new Error("Error creating promotion") }
} 

export async function updatePromotion (_id: string, user: string, update: Partial<PromotionInterface>) {
    try {
        const promotion = await Promotion.findOneAndUpdate({ _id, user }, update)

        if (!promotion) { throw new Error("Promotion not exists!") }

        const { products } = update

        if (products?.length > 0) {
        //remove id da promoção dos produtos antigos
        await Product.updateMany({ _id: { $in: promotion?.products } }, { $pull: { promotions: _id } })

        //adiciona id da promoção nos produtos novos
        await Product.updateMany({ _id: { $in: products } }, { $pull: { promotions: _id } })
        await Product.updateMany({ _id: { $in: products } }, { $push: { promotions: _id } })
        }

        promotion.self = true

        return promotion
    } catch (err) { throw new Error("Error updating promotion") }
}

export async function deletePromotion (_id: string, user: string) {
    try {
        const promotion = await Promotion.findOneAndRemove({ _id, user }) 

        if (!promotion) { throw new Error("Promotion not exists!") }

        await Product.updateMany({ _id: { $in: promotion?.products } }, { $pull: { promotions: _id } })

        await Store.findByIdAndUpdate(promotion?.store, { $pull: { promotions: _id } })

        promotion.self = true

        return promotion
    } catch (err) { throw new Error("Error deleting promotion") }
}