import { Request, Response } from 'express'
import { selfVerify } from '../middlewares/auth'

import User from '../schemas/User'

class UserController {

  public async search (req: Request, res: Response): Promise<Response> {
    const { user: _id } = res.locals//id
    try {
      const user = await User.findById(_id)

      const data = JSON.parse(JSON.stringify(user))
      data.self = await selfVerify(req, self => self === data?.user)
  
      return res.json(data)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const { user: _id } = res.locals//id
    try {
      const user = await User.remove({ _id })
  
      return res.json(user)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const { user: _id } = res.locals//id
    try {
      const user = await User.findByIdAndUpdate(_id, req.body)
  
      return res.json(user)
    } catch (err) {
      return res.status(400).json({ message: '' })
    }
  }

}

export default new UserController()