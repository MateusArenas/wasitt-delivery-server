import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import authConfig from '../config/auth.json'
import util from 'util'

async function authMiddleware (req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const authHeader = req.headers.authorization

    if(!authHeader) { throw new Error('No token provider') }

    const parts = authHeader.split(' ')

    if(parts.length !== 2) { throw new Error('Token error') }

    const [scheme, token] = parts

    if(!/^Bearer$/i.test(scheme)) { throw new Error('Token malformatted') }

    jwt.verify(token, authConfig.secret, (err, decoded : any) => {
      if(err) { throw new Error('Token invalid') }

      res.locals.user = decoded.id 
      return next()
    })
  } catch(err) { throw new Error(err?.message) }
}

export async function getAuthUser (authorization: string): Promise<string | undefined> {
  let self = undefined

  if(!authorization) return undefined

  const parts = authorization.split(' ')

  if(parts.length !== 2) return undefined

  const [scheme, token] = parts

  if(!/^Bearer$/i.test(scheme)) return undefined

  jwt.verify(token, authConfig.secret, (err, decoded : any) => {
    if(err) return undefined
    self = decoded?.id 
    return self
  })

  return self
}

export async function authVerify (authorization: string, callback: (user: string) => Promise<any> | any ): Promise<any> {
  let user = undefined
  
  if(!authorization) { throw new Error('No token provider') }

  const parts = authorization.split(' ')

  if(parts.length !== 2) { throw new Error('Token error') }

  const [scheme, token] = parts

  if(!/^Bearer$/i.test(scheme)) { throw new Error('Token malformatted') }

  jwt.verify(token, authConfig.secret, (err, decoded : any) => {
    if(err) { throw new Error('Token invalid') }
    user = decoded?.id 
    return false
  })

  if (util.types.isAsyncFunction(callback)) {
    return await callback(user)
  }

  return callback(user)
}

export async function selfVerify (authorization: string, callback: (self: string) => Promise<boolean> | boolean , restrict?: boolean): Promise<boolean> {
  let self = undefined
  try {
    if(!authorization) return false

    const parts = authorization.split(' ')

    if(parts.length !== 2) { throw new Error('Token error') }

    const [scheme, token] = parts

    if(!/^Bearer$/i.test(scheme)) { throw new Error('Token malformatted') }

    jwt.verify(token, authConfig.secret, (err, decoded : any) => {
      if(err) { throw new Error('Token invalid') }
      self = decoded?.id 
      return false
    })

    const equalSelf = await callback(self)

    if (restrict && !equalSelf) { throw new Error('Token invalid or user is not self!') }

    return equalSelf
  } catch(err) {
    return false
  }

}

export default authMiddleware