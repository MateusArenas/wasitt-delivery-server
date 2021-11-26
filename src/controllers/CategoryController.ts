import { Request, Response } from 'express'
import { selfVerify } from '../middlewares/auth'

import Category from '../schemas/Category'
import Product from '../schemas/Product'
import Store from '../schemas/Store'

class CategoryController {
  public async index (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const name = req.query?.name as string
    
    try {
      const categories = await Category.find({store, name}).populate([
        { path: 'products', model: 'Product', populate: [
          { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] }
        ] }
      ])

      const data = await Promise.all(categories?.map(async category => {
        const otherCategories = await Category.find({ store: category?.store }).select('name')
        const data = JSON.parse(JSON.stringify(category))
        data.otherCategories = otherCategories
        data.self = await selfVerify(req.headers?.authorization, self => self === data?.user)
        return data
      }))

      return res.json(data)
    } catch(err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async search (req: Request, res: Response): Promise<Response> {
    const { id } = req.params //id
    const search = req.query?.search as string
    const skip = Number(req.query?.skip)
    const limit = Number(req.query?.limit)
    try {
      const category = await Category.findById(id).populate([
        { 
          path: 'products', 
          model: 'Product', 
          match: { name: { $regex: new RegExp(search), $options: 'i' } },
          options: { skip, limit },
          populate: [
            { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] }
          ] 
        }
      ])
      
      if (!category) return res.status(404).json({ message: '' })

      const totalCount: any = await Product.countDocuments({ 
        categories: { $in: [id] },
        name: { $regex: new RegExp(search), $options: 'i' },
      })

      res.set('x-total-count', totalCount)

      console.log('ee', req.query)

      const otherCategories = await Category.find({ store: category?.store }).select('name')
      const data = JSON.parse(JSON.stringify(category))
      data.otherCategories = otherCategories
      data.self = await selfVerify(req.headers?.authorization, self => self === data?.user)

      return res.json(data)
    } catch(err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async create (req: Request, res: Response): Promise<Response> {
    const { store, user } = res.locals //id
    const { name, products } = req.body
    try {

      const findCategory = await Category.findOne({ store, name, user }) 
      if (findCategory) {
        return res.status(404).json({ message: 'Já existe uma categoria com mesmo nome na loja.' })
      }

      const category = await Category.create({ store, name, user, products })

      if (products?.length > 0) {
        await Product.updateMany({ _id: { $in: products } }, { $push: { categories: category?._id } })
      }

      await Store.findByIdAndUpdate(store, { $push: { categories: category?._id } })

      return res.json(category)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params
    try {
      const category = await Category.remove({ _id: id, store })
      
      await Product.updateMany({ _id: { $in: category?.products } }, { $pull: { categories: id } })

      await Store.findByIdAndUpdate(store, { $pull: { categories: id } })

      return res.json(category)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params
    try {
      const category = await Category.findByIdAndUpdate(id, req.body)

      const products: Array<string> = req.body?.products

      if (products?.length > 0) {
        //remove id da promoção dos produtos antigos
        await Product.updateMany({ _id: { $in: category?.products } }, { $pull: { categories: id } })
  
        //adiciona id da promoção nos produtos novos
        await Product.updateMany({ _id: { $in: products } }, { $pull: { categories: id } })
        await Product.updateMany({ _id: { $in: products } }, { $push: { categories: id } })
      }

      return res.json(category)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new CategoryController()