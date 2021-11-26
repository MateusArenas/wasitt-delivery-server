import { Request, Response } from 'express'
import { selfVerify } from '../middlewares/auth'

import Follower from '../schemas/Follower'
import Store from '../schemas/Store'

class FollowerController {

  public async index (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const name = req.query?.name
    try {
      const followers = await Follower.find(
        Object.assign(
          {store}, 
          !!name && { 'user.name': name},
          // { $addFields: {  } }
        )
      ).populate({
        path: 'user',
        model: 'User',
        select: ['uri', 'name'],
      })

      const data = await Promise.all(followers.map(async item => {
        const data = JSON.parse(JSON.stringify(item))
        data.self = await selfVerify(req.headers?.authorization, self => self === data?.user?._id)
        return data
      }))
  
      return res.json(data)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async search (req: Request, res: Response): Promise<Response> {
    const { id } = req.params //id
    try {
      const follower = await Follower.findById(id).populate({
        path: 'user',
        model: 'User',
        select: ['uri', 'name'],
      })

      const data = JSON.parse(JSON.stringify(follower))
      data.self = await selfVerify(req.headers?.authorization, self => self === data?.user?._id)
  
      return res.json(data)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async create (req: Request, res: Response): Promise<Response> {
    const { store, user } = res.locals //id
    try {
      
      const findFollower = await Follower.findOne({ store, user }) 
      if (findFollower) {
        return res.status(404).json({ message: 'Você já é seguidor nessa loja.' })
      }

      const follower = await Follower.create({ store, user })

      await Store.findByIdAndUpdate(store, { $push: { followers: follower?._id } })

      return res.json(follower)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { store, id } = req.params //id
    try {
      const follower = await Follower.findOneAndDelete({ store, user: id })

      await Store.findByIdAndUpdate(store, { $pull: { followers: follower?._id } })
  
      return res.json(follower)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { id } = req.params //id
    try {
      const follower = await Follower.findByIdAndUpdate(id, req.body)
  
      return res.json(follower)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new FollowerController()