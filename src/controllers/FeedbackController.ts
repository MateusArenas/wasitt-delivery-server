import { Request, Response } from 'express'
import { selfVerify } from '../middlewares/auth'

import Feedback from '../schemas/Feedback'
import Store from '../schemas/Store'

class FeedbackController {

  public async index (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const name = req.query?.name
    try {
      const feedbacks = await Feedback.find(Object.assign(
        {store},
        { reply: { $exists: false } },
        !!name && { 'user.name': name},
      )).populate([
        {
          path: 'user',
          model: 'User',
          select: ['uri', 'name'],
        },
        {
          path: 'replies',
          model: 'Feedback',
          populate: { path: 'user', model: 'User', select: ['uri', 'name'] },
        },
      ])

      const data = await Promise.all(feedbacks.map(async item => {
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
      const feedback = await Feedback.findById(id).populate({
        path: 'user',
        model: 'User',
        select: ['uri', 'name'],
      })

      const data = JSON.parse(JSON.stringify(feedback))
      data.self = await selfVerify(req.headers?.authorization, self => self === data?.user?._id)
      
      return res.json(data)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async create (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const reply = req.body?.reply
    try {
      
      const feedback = await Feedback.create({...req.body, store })
      
      await Store.findByIdAndUpdate(store, { $push: { feedbacks: feedback?._id } })
      
      if(reply) {
        await Feedback.findByIdAndUpdate(reply, { $push: { replies: feedback?._id } })
      }
      
      return res.json(feedback)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { store } = res.locals //id
    const { id } = req.params //id
    try {
      const feedback = await Feedback.findByIdAndRemove(id)

      await Store.findByIdAndUpdate(store, { $pull: { feedbacks: id } })
  
      return res.json(feedback)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { id } = req.params //id
    try {
      const feedback = await Feedback.findByIdAndUpdate(id, req.body)
  
      return res.json(feedback)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new FeedbackController()