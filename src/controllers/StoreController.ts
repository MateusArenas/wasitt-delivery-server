import { Request, Response } from 'express'
import { selfVerify } from '../middlewares/auth'
import Category from '../schemas/Category'
import Feedback from '../schemas/Feedback'
import Follower from '../schemas/Follower'
import Order from '../schemas/Order'
import Product from '../schemas/Product'
import Promotion from '../schemas/Promotion'

import Store from '../schemas/Store'
import User from '../schemas/User'

class StoreController {
  public async index (req: Request, res: Response): Promise<Response> {
    const name = req.query?.name as string

    try {
      const stores = await Store.find({ name }).populate([
        { path: 'user', model: 'User', select: ['email', 'name'] },
        { path: 'categories', populate: [
          { path: 'products', model: 'Product', populate: [
            { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] },
          ] }
        ] },
        { path: 'promotions', model: 'Promotion' },
        { path: 'followers', model: 'Follower', select: ['user'] }
      ])

      const data = await Promise.all(stores?.map(async store => {
        const otherStores = await Store.find({ user: store?.user }).select('name')
        const data = JSON.parse(JSON.stringify(store))
        data.otherStores = otherStores
        data.self = await selfVerify(req.headers?.authorization, self => self === data?.user?._id)
        return data
      }))

      return res.status(200).json(data)
    } catch(err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async search (req: Request, res: Response): Promise<Response> {
    const { id } = req.params //id
    try {
      const store = await Store.findById(id)

      if (!store) return res.status(404).json({ message: '' })

      const data = JSON.parse(JSON.stringify(store))
      data.self = await selfVerify(req.headers?.authorization, self => self === data?.user)

      return res.status(200).json(data)
    } catch(err) {
      return res.status(404).json({ message: '' })
    }
  }

  public async create (req: Request, res: Response): Promise<Response> {
    const { user } = res.locals//id
    try {
      const store = await Store.create({...req.body, user})
      
      await User.findByIdAndUpdate(user, { $push: { stores: store?._id } })
  
      return res.json(store)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { user } = res.locals//id
    const { id } = req.params
    try {
      const store = await Store.findByIdAndRemove(id)

      await User.findByIdAndUpdate(user, { $pull: { stores: id } })

      await Product.remove({ _id: { $in: store?.products } })
      await Category.remove({ _id: { $in: store?.categories } })
      await Promotion.remove({ _id: { $in: store?.promotions } })

      await Feedback.remove({ _id: { $in: store?.feedbacks } })
      await Follower.remove({ _id: { $in: store?.followers } })

      await Order.remove({ _id: { $in: store?.orders } })
  
      return res.json(store)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { user } = res.locals//id
    const { id } = req.params
    try {
      const store = await Store.findByIdAndUpdate(id, req.body)
  
      return res.json(store)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new StoreController()