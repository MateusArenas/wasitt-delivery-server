import { Request, Response } from 'express'
import Category from '../schemas/Category'
import Store from '../schemas/Store'
import { Schema, model } from 'mongoose'

import Product from '../schemas/Product'
import { selfVerify } from '../middlewares/auth'
import Order from '../schemas/Order'

class OrderController {

  public async index (req: Request, res: Response): Promise<Response> {
    const { store, user } = res.locals //id
    const name = req.query?.name as string
    const skip = Number(req.query?.skip)
    const limit = Number(req.query?.limit)
    try {
      const storeSelf = await Store.findOne({ user, _id: store })

      const orders = await Order.find({ store: storeSelf?._id, name: { $regex: new RegExp(name), $options: 'i' } })
      .skip(skip).limit(limit).populate([
        {
          path: 'store',
          model: 'Store',
          select: ['uri', 'user', 'delivery', 'deliveryPrice', 'deliveryTimeMin', 'deliveryTimeMax', 'minDeliveryBuyValue'],
        }
      ])

      console.log('order', JSON.stringify(orders?.map(item => item?.bag)?.map(item => item?.bundles)));
      

      if (name) {
        if (!orders?.length) return res.status(404).json({ message: '' })
      }

      const totalCount: any = await Order.countDocuments({ 
        store,
        name: { $regex: new RegExp(name), $options: 'i' },
      })

      res.set('x-total-count', totalCount)

      const data = await Promise.all(orders.map(async item => {
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
    const { store, user } = res.locals //id
    const { id } = req.params //id
    try {
      const storeSelf = await Store.findOne({ user, _id: store })

      const order = await Order.findOne({ store: storeSelf?._id, _id: id }).populate([
        {
          path: 'store',
          model: 'Store',
          select: ['uri', 'user', 'name', 'about', 'delivery', 'deliveryPrice', 'deliveryTimeMin', 'deliveryTimeMax', 'minDeliveryBuyValue'],
        }
      ])

      if (!order) return res.status(404).json({ message: '' })

      const data = JSON.parse(JSON.stringify(order))
      data.self = await selfVerify(req.headers?.authorization, self => self === data?.user)

      return res.status(200).json(data)
    } catch(err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async create (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    try {

      const order = await Order.create({ ...req.body, store })

      await Store.findByIdAndUpdate(store, { $push: { orders: order?._id } })

      return res.json(order)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params
    try {
      const order = await Order.findByIdAndRemove(id)

      await Store.findByIdAndUpdate(store, { $pull: { orders: id } })

      return res.json(order)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params
    try {
      const order = await Order.findByIdAndUpdate(id, req.body)

      return res.json(order)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new OrderController()