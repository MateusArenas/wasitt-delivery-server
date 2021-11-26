import { Request, Response } from 'express'
import { selfVerify } from '../middlewares/auth'

import Store from '../schemas/Store'
import Promotion from '../schemas/Promotion'
import Product from '../schemas/Product'

class PromotionController {

  public async index (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const name = req.query?.name as string
    
    try {
      const promotions = await Promotion.find({ store, name }).populate([
        { path: 'products', model: 'Product', 
          populate: [
            { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] }
          ] 
        }
      ])

      if (name) {
        if (!promotions?.length) return res.status(404).json({ message: '' })
      }

      const data = await Promise.all(promotions?.map(async item => {
        const data = JSON.parse(JSON.stringify(item))
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
      
      const promotion = await Promotion.findById(id).populate([
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

      if (!promotion) return res.status(404).json({ message: '' })

      const totalCount: any = await Product.countDocuments({ 
        promotions: { $in: [id] },
        name: { $regex: new RegExp(search), $options: 'i' },
      })

      res.set('x-total-count', totalCount)

      const data = JSON.parse(JSON.stringify(promotion))
      data.self = await selfVerify(req.headers?.authorization, self => self === data?.user)

      return res.status(200).json(data)
    } catch(err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async create (req: Request, res: Response): Promise<Response> {
    const { store, user } = res.locals //id
    const { products, name } = req.body
    try {

      const findPromotion = await Promotion.findOne({ store, name, user }) 
      if (findPromotion) {
        return res.status(400).json({ message: 'Já existe um produto com mesmo nome na loja.' })
      }

      const promotion = await Promotion.create({ ...req.body, store, user })
      
      if (products?.length > 0) {
        await Product.updateMany({ _id: { $in: products } }, { $push: { promotions: promotion?._id } })
      }

      await Store.findByIdAndUpdate(store, { $push: { promotions: promotion?._id } })

      return res.json(promotion)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params
    try {
      const findPromotion = await Promotion.findById(id) 

      const promotion = await Promotion.remove({ _id: id, store })

      await Product.updateMany({ _id: { $in: findPromotion?.products } }, { $pull: { promotions: id } })

      await Store.findByIdAndUpdate(store, { $pull: { promotions: id } })

      return res.json(promotion)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    try {
      const promotion = await Promotion.findByIdAndUpdate(id, req.body)

      const products: Array<string> = req.body?.products

      if (products?.length > 0) {
        //remove id da promoção dos produtos antigos
        await Product.updateMany({ _id: { $in: promotion?.products } }, { $pull: { promotions: id } })
  
        //adiciona id da promoção nos produtos novos
        await Product.updateMany({ _id: { $in: products } }, { $pull: { promotions: id } })
        await Product.updateMany({ _id: { $in: products } }, { $push: { promotions: id } })
      }
  
      return res.json(promotion)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new PromotionController()