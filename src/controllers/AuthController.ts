import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import authConfig from '../config/auth.json'
import mailer from '../modules/mailer'

import User from '../schemas/User'

function generateToken (params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  })
}

class AuthController {

  public async register (req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body
    try {

      if (await User.findOne({ email }))
        return res.status(400).json({ error: 'User already exists' })

      const user = await User.create(req.body)
      
      user.password = password
  
      return res.json({ 
        user,
        token: generateToken({ id: user._id })
      })
    } catch (err) {
      return res.status(400).json({ error: JSON.stringify(err) })
    }
  }

  public async authenticate (req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body
    try {
      const user = await User.findOne({ email }).select('+password').populate('stores')

      if (!user) 
        return res.status(400).json({ error: 'User not found' })

      if(!await bcrypt.compare(password, user.password))
        return res.status(400).json({ error: 'Invalid password' })

      user.password = password

      return res.json({ 
        user, 
        token: generateToken({ id: user._id })
      })
    } catch (err) {
      return res.status(400).json({ error: 'Registration failed' })
    }
  }

  public async forgotpass (req: Request, res: Response): Promise<Response> {
    const { email } = req.params
    try {
      const user = await User.findOne({ email })

      if (!user) 
        return res.status(400).json({ error: 'User not found' })

      const token = crypto.randomBytes(20).toString('hex')

      const now = new Date()

      now.setHours(now.getHours() + 1)

      await User.findByIdAndUpdate(user._id, {
        $addFields: {
          passwordResetToken: token,
          passwordResetExpires: now
        }
      })

      mailer.sendMail({
        to: email,
        from: 'MateusArenas97@gmail.com',
        template: 'auth/forgotpass',
        context: { token }
      } as any, err => {
        if(err)
          return res.status(400).json({ error: 'Cannot send forgot password email' })

        return res.json()
      })
    } catch (err) {
      return res.status(400).json({ error: 'Error on forgot password, try again' })
    }
  }

  public async resetpass (req: Request, res: Response): Promise<Response> {
    const { email, token, password } = req.body
    try {
      const user = await User.findOne({ email })
        .select('+passwordResetToken passwordResetExpires')

      if (!user) 
        return res.status(400).json({ error: 'User not found' })

      if(token !== user.passwordResetToken)
        return res.status(400).json({ error: 'Token invalid' })

      const now = new Date()

      if(now > user.passwordResetExpires)
        return res.status(400).json({ error: 'Token expired, generate a new one' })

      user.password = password

      await user.save()

      return res.json()
    } catch (err) {
      return res.status(400).json({ error: 'Cannot reset password, try again' })
    }
  }
}

export default new AuthController()