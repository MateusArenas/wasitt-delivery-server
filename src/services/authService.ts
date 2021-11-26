import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import authConfig from '../config/auth.json'
import mailer from '../modules/mailer'

import User from '../schemas/User'
import Product from '../schemas/Product'

function generateToken (params = {}) {
    return jwt.sign(params, authConfig.secret, {
      expiresIn: 86400
    })
  }

export async function register (email: string, password: string) {
    try {
        if (await User.findOne({ email })) { throw new Error("User already exists") }

        const user = await User.create({ email, password })
        
        user.password = password

        const token = generateToken({ id: user._id })

        user.token = token

        return user
    } catch (err) { 
        console.log(err);
        
        throw new Error('Registration failed') 
    }
}

export async function authenticate (email: string, password: string) {
    try {
        const user = await User.findOne({ email }).select('+password').populate('stores')

        if (!user) { throw new Error('User not found') }

        if(!await bcrypt.compare(password, user.password)) { throw new Error('Invalid password') }

        user.password = password

        const token = generateToken({ id: user._id })

        user.token = token

        return user
    } catch (err) { throw new Error('Registration failed') }
}

export async function forgotpass (email: string) {
    try {
        const user = await User.findOne({ email })
        
        if (!user) { throw new Error('User not found') }

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
            if(err) { throw new Error('Cannot send forgot password email') }

            return user
        })
    } catch (err) { throw new Error('Error on forgot password, try again') }
  }


export async function resetpass (email, password, token) {
    try {
        const user = await User.findOne({ email })
        .select('+passwordResetToken passwordResetExpires')

        if (!user) { throw new Error('User not found') }

        if(token !== user.passwordResetToken) { throw new Error('Token invalid') }

        const now = new Date()

        if(now > user.passwordResetExpires) { throw new Error('Token expired, generate a new one') }

        user.password = password

        await user.save()

        return user
    } catch (err) { throw new Error("Cannot reset password, try again") }
}