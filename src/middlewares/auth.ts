import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import authConfig from '../config/auth.json'

async function authMiddleware (req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const authHeader = req.headers.authorization

    if(!authHeader)
      return res.status(401).json({ message: 'No token provider' })

    const parts = authHeader.split(' ')

    if(parts.length !== 2)
      return res.status(401).json({ message: 'Token error' })

    const [scheme, token] = parts

    if(!/^Bearer$/i.test(scheme))
      return res.status(401).json({ message: 'Token malformatted' })

    jwt.verify(token, authConfig.secret, (err, decoded : any) => {
      if(err) return res.status(401).json({ message: 'Token invalid' })

      res.locals.user = decoded.id 
      return next()
    })

  } catch(err) {
    return res.status(400).json({ message: '' })
  }
}

export async function selfVerify (req: Request, callback: (self: string) => Promise<boolean> | boolean ): Promise<boolean> {
  try {
    let self = undefined

    const authHeader = req.headers.authorization

    if(!authHeader)
      return false

    const parts = authHeader.split(' ')

    if(parts.length !== 2)
      return false

    const [scheme, token] = parts

    if(!/^Bearer$/i.test(scheme))
      return false

    jwt.verify(token, authConfig.secret, (err, decoded : any) => {
      if(err) return false
      self = decoded?.id 
      return false
    })

    return await callback(self)
  } catch(err) {
    return false
  }

}

export default authMiddleware