import { getAuthUser } from "../middlewares/auth"
import Category from "../schemas/Category"
import Product, { ProductInterface } from "../schemas/Product"
import Promotion from "../schemas/Promotion"
import Store from "../schemas/Store"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexProduct (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)
        
        const products = await Product.find(match, {}, options)
        
        if (!products) { throw new Error("Product or Products not exists!") }

        products?.forEach(product => { product.self = product?.user?.equals(auth) })

        return products
    } catch (err) { throw new Error("Error searching products") }
} 

export async function searchProduct (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const product = await Product.findOne(match, {}, options)

        if (!product) { throw new Error("Store not exists!") }

        product.self = product?.user?.equals(auth)

        return product
    } catch (err) { throw new Error("Error searching product") }
} 

export async function createProduct ({ user, store, name, ...input }: Partial<ProductInterface>) {
    try {
        const productAlreadyExists = await Product.findOne({ store, name })
        
        if (productAlreadyExists) { throw new Error("already exists Product equal name in Store!") }
        
        const product = await Product.create({ user, store, name, ...input })
        
        const { products, categories, promotions, single } = input
        
        if (categories?.length > 0) {
            await Category.updateMany({ _id: { $in: categories } }, { $push: { products: product?._id } })
        }
        if (promotions?.length > 0) {
            await Promotion.updateMany({ _id: { $in: promotions } }, { $push: { products: product?._id } })
        }
        
        await Store.findByIdAndUpdate(store, { $push: { products: product?._id } })
        
        product.self = true
        
        return product
    } catch (err) { throw new Error("Error creating new product") }
} 

export async function updateProduct (_id: string, user: string, update: Partial<ProductInterface>) {
    try {
    const product = await Product.findOneAndUpdate({ _id, user }, update)

    if (!product) { throw new Error("Product not exists!") }
        
    const { categories, promotions } = update

    if (categories?.length > 0) {
        await Category.updateMany({ _id: { $in: product?.categories } }, { $pull: { products: _id } })
        await Category.updateMany({ _id: { $in: categories } }, { $pull: { products: _id } })
        await Category.updateMany({ _id: { $in: categories } }, { $push: { products: _id } })
    }

    if (promotions?.length > 0) {
        await Promotion.updateMany({ _id: { $in: product?.promotions } }, { $pull: { products: _id } })
        await Promotion.updateMany({ _id: { $in: promotions } }, { $pull: { products: _id } })
        await Promotion.updateMany({ _id: { $in: promotions } }, { $push: { products: _id } })
    }

    product.self = true

    return product
    } catch (err) { throw new Error("Error updating product") }
}

export async function deleteProduct (_id: string, user: string ) {
    try {
        const product = await Product.findOneAndRemove({ _id, user })
    
        if (!product) { throw new Error("Product not exists!") }
    
        await Product.updateMany({ _id: { $in: product?.products } }, { $pull: { products: _id } })
        await Category.updateMany({ _id: { $in: product?.categories } }, { $pull: { products: _id } })
        await Promotion.updateMany({ _id: { $in: product?.promotions } }, { $pull: { products: _id } })
    
        await Store.findByIdAndUpdate(product?.store, { $pull: { products: _id } })
    
        return product
    } catch (err) { throw new Error("Error deleting product") }
}