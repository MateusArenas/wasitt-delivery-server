import { Request, Response } from 'express'
import Category from '../schemas/Category'
import Store from '../schemas/Store'
import { Schema, model } from 'mongoose'

import Product from '../schemas/Product'
import { selfVerify } from '../middlewares/auth'
import Promotion from '../schemas/Promotion'

class ProductController {

  public async index (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const name = req.query?.name as string
    const skip = Number(req.query?.skip)
    const limit = Number(req.query?.limit)
    try {
      const products = await Product.find({ store, name: { $regex: new RegExp(name as string), $options: 'i' } })
      .skip(skip).limit(limit).populate([
        { 
          path: 'products', 
          model: 'Product', 
          populate: [
            { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] },
            { 
              path: 'products', 
              model: 'Product', 
              // match: { spinOff: true },
              populate: [
                { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] }
              ]
            }
          ]
        },
        {
          path: 'promotions', 
          model: 'Promotion', 
          select: ['percent', 'name'] 
        },
        {
          path: 'categories',
          model: 'Category',
        },
        {
          path: 'store',
          model: 'Store',
          select: ['uri', 'delivery', 'deliveryPrice', 'deliveryTimeMin', 'deliveryTimeMax', 'minDeliveryBuyValue'],
        }
      ])

      if (name) {
        if (!products?.length) return res.status(404).json({ message: '' })
      }

      const totalCount: any = await Product.countDocuments({ 
        store,
        name: { $regex: new RegExp(name), $options: 'i' },
      })

      res.set('x-total-count', totalCount)

      console.log('ee', totalCount, req.query)


      const data = await Promise.all(products.map(async item => {
        const data = JSON.parse(JSON.stringify(item))
        data.self = await selfVerify(req, self => self === data?.user)
        return data
      }))

      return res.json(data)
    } catch(err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async search (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params //id
    try {
      const product = await Product.findById(id).populate([
        { 
          path: 'products', 
          model: 'Product', 
          populate: [
            { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] },
            { 
              path: 'products', 
              model: 'Product', 
              // match: { spinOff: true },
              populate: [
                { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] }
              ]
            }
          ]
        },
        { 
          path: 'promotions', 
          model: 'Promotion', 
          select: ['percent', 'name'] 
        },
        {
          path: 'categories',
          model: 'Category',
        },
        {
          path: 'store',
          model: 'Store',
          select: ['uri', 'delivery', 'deliveryPrice', 'deliveryTimeMin', 'deliveryTimeMax', 'minDeliveryBuyValue'],
        }
      ])

      if (!product) return res.status(404).json({ message: '' })
      

      const data = JSON.parse(JSON.stringify(product))
      data.self = await selfVerify(req, self => self === data?.user)

      return res.status(200).json(data)
    } catch(err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async create (req: Request, res: Response): Promise<Response> {
    const { store, user } = res.locals //id
    const { products, categories, promotions, name, single } = req.body
    try {

      const findProduct = await Product.findOne({ store, name, user }) 
      if (findProduct) {
        return res.status(400).json({ message: 'Já existe um produto com mesmo nome na loja.' })
      }

      const product = await Product.create({ ...req.body, store, user })

      if (categories?.length > 0) {
        await Category.updateMany({ _id: { $in: categories } }, { $push: { products: product?._id } })
      }
      if (promotions?.length > 0) {
        await Promotion.updateMany({ _id: { $in: promotions } }, { $push: { products: product?._id } })
      }

      await Store.findByIdAndUpdate(store, { $push: { products: product?._id } })

      return res.json(product)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params
    try {
      const product = await Product.findByIdAndRemove(id)

      await Product.updateMany({ _id: { $in: product?.products } }, { $pull: { products: id } })
      await Category.updateMany({ _id: { $in: product?.categories } }, { $pull: { products: id } })
      await Promotion.updateMany({ _id: { $in: product?.promotions } }, { $pull: { products: id } })

      await Store.findByIdAndUpdate(store, { $pull: { products: id } })

      return res.json(product)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params
    try {
      const product = await Product.findByIdAndUpdate(id, req.body)

      const { products, categories, promotions } = req.body

      if (categories?.length > 0) {
        await Category.updateMany({ _id: { $in: product?.categories } }, { $pull: { products: id } })
        await Category.updateMany({ _id: { $in: categories } }, { $pull: { products: id } })
        await Category.updateMany({ _id: { $in: categories } }, { $push: { products: id } })
      }

      if (promotions?.length > 0) {
        await Promotion.updateMany({ _id: { $in: product?.promotions } }, { $pull: { products: id } })
        await Promotion.updateMany({ _id: { $in: promotions } }, { $pull: { products: id } })
        await Promotion.updateMany({ _id: { $in: promotions } }, { $push: { products: id } })
      }

      return res.json(product)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new ProductController()