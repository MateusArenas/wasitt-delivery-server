import { getAuthUser } from "../middlewares/auth"
import Category, { CategoryInterface } from "../schemas/Category"
import Product from "../schemas/Product"
import Store from "../schemas/Store"
import { transformMatchWithOptions } from "../utils/populate"

export async function indexCategory (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const categories = await Category.find(match, {}, options)

        if (!categories) { throw new Error("Category or Categories not exists!") }

        categories?.forEach(category => { category.self = category?.user?.equals(auth) })

        return categories
    } catch (err) { throw new Error("Error searching categories") }
} 

export async function searchCategory (_match: any, _options: any, authorization?: string) {
    try {
        const auth = await getAuthUser(authorization)
        
        const { match, options } = await transformMatchWithOptions(_match, _options)

        const category = await Category.findOne(match, {}, options)

        if (!category) { throw new Error("Category not exists!") }

        category.self = category?.user?.equals(auth)

        return category
    } catch (err) { throw new Error("Error searching category") }
} 

export async function createCategory ({ store, user, name, ...input }: any) {
    try {
        const categoryAlreadyExists = await Category.findOne({ store, name }) 

        if (categoryAlreadyExists) { throw new Error("already exists Category equal name in Store!") }

        const category = await Category.create({ store, name, user, ...input })
        
        const { products } = input
        
        if (products?.length > 0) {
        await Product.updateMany({ _id: { $in: products } }, { $push: { categories: category?._id } })
        }

        await Store.findByIdAndUpdate(store, { $push: { categories: category?._id } })

        category.self = true

        return category
    } catch (err) { throw new Error("Error creating category") }
} 

export async function updateCategory (_id: string, user: string, update: Partial<CategoryInterface>) {
    try {
        const category = await Category.findOneAndUpdate({ _id, user}, update)

        if (!category) { throw new Error("Category not exists!") }

        const { products } = update

        if (products?.length > 0) {
        //remove id da promoção dos produtos antigos
        await Product.updateMany({ _id: { $in: category?.products } }, { $pull: { categories: _id } })

        //adiciona id da promoção nos produtos novos
        await Product.updateMany({ _id: { $in: products } }, { $pull: { categories: _id } })
        await Product.updateMany({ _id: { $in: products } }, { $push: { categories: _id } })
        }

        category.self = true

        return category
    } catch (err) { throw new Error("Error updating category") }
}

export async function deleteCategory (_id: string, user: string) {
    try {
        const category = await Category.findOneAndRemove({ _id, user })

        if (!category) { throw new Error("Category not exists!") }
        
        await Product.updateMany({ _id: { $in: category?.products } }, { $pull: { categories: _id } })

        await Store.findByIdAndUpdate(category?.store, { $pull: { categories: _id } })

        category.self = true

        return category
    } catch (err) { throw new Error("Error deleting category") }
}

