import { NextFunction, Request, Response, Router } from 'express'

import CategoryController from './controllers/CategoryController'
import FollowerController from './controllers/FollowerController'
import PromotionController from './controllers/PromotionController'
import ProductController from './controllers/ProductContoller'
import StoreController from './controllers/StoreController'
import AuthController from './controllers/AuthController'

import authMiddleware from './middlewares/auth'

import Store from './schemas/Store'
import Category from './schemas/Category'
import UserController from './controllers/UserController'
import FeedbackController from './controllers/FeedbackController'
import Product from './schemas/Product'
import Promotion from './schemas/Promotion'
import OrderController from './controllers/OrderController'
import User from './schemas/User'

const routes = Router()

routes.get('/manage', authMiddleware, StoreController.index)
routes.post('/manage', authMiddleware, StoreController.create)
routes.get('/manage/:id', authMiddleware, StoreController.search)
routes.put('/manage/:id', authMiddleware, StoreController.update)
routes.delete('/manage/:id', authMiddleware, StoreController.delete)

routes.get('/users', authMiddleware, UserController.search)
routes.put('/users', authMiddleware, UserController.update)
routes.delete('/users', authMiddleware, UserController.delete)

routes.get('/users/:id/stores', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  const { id: user } = req.params;
  try {
    const stores = await Store.find({ user }).select(['uri', 'name'])

    return res.json(stores)
  } catch (err) {
    return res.status(400).json({ message: 'Oi'})
  }
})

async function getStore (req: Request, res: Response, next: NextFunction): Promise<Response> {
  const { storeName: name } = req.params;
  try {
    const store = await Store.findOne({ name })
    res.locals.store = store._id
    next() // pass control to the next handler
  } catch (err) {
    return res.status(400).json({ message: 'Oi'})
  }
}

routes.get('/store', StoreController.index)
routes.get('/stores/:id', StoreController.search)

routes.post('/register', AuthController.register)
routes.post('/authenticate', AuthController.authenticate)
routes.put('/forgotpass/:email', AuthController.forgotpass)
routes.post('/resetpass', AuthController.resetpass)

routes.post('/ok', authMiddleware, (req, res) => res.json({ message: 'ok' }))

async function home (req: Request, res: Response): Promise<Response> {
  const { cityName: city, name } = req.params;
  const where = Object.assign(name !== "undefined" ? {name} : {}, city !== "undefined" ? {city} : {})
  const skip = Number(req.query?.skip)
  const limit = Number(req.query?.limit)
  try {
    const categories = await Category.find(where).skip(skip).limit(limit).populate([{
      path: 'products',
      model: 'Product',
      // Get categories of products - populate the 'categories' array for every products
      populate: [
        { path: 'categories', model: 'Category' },
        { path: 'promotions', model: 'Promotion', select: ['percent', 'name'] }
      ]
    }, { path: 'store' }])

    const totalCount: any = await Category.countDocuments(where)

    res.set('x-total-count', totalCount)
    
    return res.json(categories)
  } catch(err) {
    return res.status(400).json({ message: '' })
  }
}
// expand store...
routes.get('/city/:cityName/categories/:name', home)

async function explore (req: Request, res: Response): Promise<Response> {
  const { cityName: city } = req.params;
  const where = Object.assign(city !== "undefined" ? {city} : {})
  const skip = Number(req.query?.skip)
  const limit = Number(req.query?.limit)
  try {
    const tags = await Category.find().skip(skip).limit(limit).sort({ name: 1 }).distinct('name')

    const data = await Promise.all(tags?.map(async name => {
      const categories = await Category.find({ name }).populate([{
        path: 'products',
        // Get categories of products - populate the 'categories' array for every products
        options: { skip: 0, limit: 1 },
        populate: { path: 'categories' }
      }, { path: 'store' }])

      const products = categories?.map(item => item?.products)?.flat()

      return ({ name, products })
    }).filter(async item => (await item).products?.length > 0))

    const totalCount: any = await Category.find().sort({ name: 1 }).distinct('name').count()

    res.set('x-total-count', totalCount)

    return res.json(data)
  } catch(err) {
    return res.status(400).json({ message: '' })
  }
}

routes.get('/city/:cityName/top/categories', explore)


//index -> todos / podendo ter /s?=pizza%de%queijo
//search -> id
//create -> cria
//delete -> remove
//show -> method especial de 'sugestoes'

routes.get('/store/:storeName/orders', authMiddleware, getStore, OrderController.index)
routes.get('/store/:storeName/orders/:id', authMiddleware, getStore, OrderController.search)
routes.post('/store/:storeName/orders', getStore, OrderController.create)
routes.put('/store/:storeName/orders/:id', getStore, OrderController.update)
routes.delete('/store/:storeName/orders/:id', getStore, OrderController.delete)

routes.get('/store/:storeName/promotions', getStore, PromotionController.index)
routes.get('/store/:storeName/promotions/:id', getStore, PromotionController.search)
routes.post('/store/:storeName/promotions', authMiddleware, getStore, PromotionController.create)
routes.put('/store/:storeName/promotions/:id', authMiddleware, getStore, PromotionController.update)
routes.delete('/store/:storeName/promotions/:id', authMiddleware, getStore, PromotionController.delete)

routes.get('/store/:storeName/followers', getStore, FollowerController.index)
routes.get('/store/:storeName/followers/:id', getStore, FollowerController.search)
routes.post('/store/:storeName/followers', authMiddleware, getStore, FollowerController.create)
routes.put('/store/:storeName/followers/:id', authMiddleware, getStore, FollowerController.update)
routes.delete('/store/:storeName/followers/:id', authMiddleware, getStore, FollowerController.delete)

routes.get('/store/:storeName/feedbacks', getStore, FeedbackController.index)
routes.get('/store/:storeName/feedbacks/:id', getStore, FeedbackController.search)
routes.post('/store/:storeName/feedbacks', getStore, FeedbackController.create)
routes.put('/store/:storeName/feedbacks/:id', getStore, FeedbackController.update)
routes.delete('/store/:storeName/feedbacks/:id', getStore, FeedbackController.delete)

routes.get('/store/:storeName/categories', getStore,CategoryController.index)
routes.get('/store/:storeName/categories/:id', getStore, CategoryController.search)
routes.post('/store/:storeName/categories', authMiddleware, getStore, CategoryController.create)
routes.put('/store/:storeName/categories/:id', authMiddleware, getStore, CategoryController.update)
routes.delete('/store/:storeName/categories/:id', authMiddleware, getStore, CategoryController.delete)

routes.get('/store/:storeName/products', getStore, ProductController.index)
routes.get('/store/:storeName/products/:id', getStore, ProductController.search)
routes.post('/store/:storeName/products', authMiddleware, getStore, ProductController.create)
routes.put('/store/:storeName/products/:id', authMiddleware, getStore, ProductController.update)
routes.delete('/store/:storeName/products/:id', authMiddleware, getStore, ProductController.delete)



routes.get('/products', async (req: Request, res: Response): Promise<Response> => {
  const name = req.query?.name as string
  const skip = Number(req.query?.skip)
  const limit = Number(req.query?.limit)
  try {
    const products = await Product.find({ name: { $regex: new RegExp(name), $options: 'i' } })
    .skip(skip).limit(limit).populate([
      {
        path: 'store',
        model: 'Store',
        select: ['name'],
      }
    ])

    if (name) {
      if (!products?.length) return res.status(404).json({ message: '' })
    }

    const totalCount: any = await Product.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })

    res.set('x-total-count', totalCount)

    const data = products.map(item => {
      const data = JSON.parse(JSON.stringify(item))
      return data
    })

    return res.json(data)
  } catch(err) {
    return res.status(400).json({ message: '' })
  }
})

routes.get('/categories', async (req: Request, res: Response): Promise<Response> => {
  const name = req.query?.name as string
  const skip = Number(req.query?.skip)
  const limit = Number(req.query?.limit)
  try {
    const categories = await Category.find({ name: { $regex: new RegExp(name), $options: 'i' } })
    .skip(skip).limit(limit).populate([
      {
        path: 'store',
        model: 'Store',
        select: ['name'],
      }
    ])

    if (name) {
      if (!categories?.length) return res.status(404).json({ message: '' })
    }

    const totalCount: any = await Category.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })

    res.set('x-total-count', totalCount)

    const data = categories.map(item => {
      const data = JSON.parse(JSON.stringify(item))
      return data
    })

    return res.json(data)
  } catch(err) {
    return res.status(400).json({ message: '' })
  }
})

routes.get('/promotions', async (req: Request, res: Response): Promise<Response> => {
  const name = req.query?.name as string
  const skip = Number(req.query?.skip)
  const limit = Number(req.query?.limit)
  try {
    const promotions = await Promotion.find({ name: { $regex: new RegExp(name), $options: 'i' }})
    .skip(skip).limit(limit).populate([
      {
        path: 'store',
        model: 'Store',
        select: ['name'],
      }
    ])

    if (name) {
      if (!promotions?.length) return res.status(404).json({ message: '' })
    }

    const totalCount: any = await Promotion.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })

    res.set('x-total-count', totalCount)

    const data = promotions.map(item => {
      const data = JSON.parse(JSON.stringify(item))
      return data
    })

    return res.json(data)
  } catch(err) {
    return res.status(400).json({ message: '' })
  }
})

routes.get('/stores', async (req: Request, res: Response): Promise<Response> => {
  const name = req.query?.name as string
  const skip = Number(req.query?.skip)
  const limit = Number(req.query?.limit)
  try {
    const stores = await Store.find({ name: { $regex: new RegExp(name), $options: 'i' }})
    .skip(skip).limit(limit)

    if (name) {
      if (!stores?.length) return res.status(404).json({ message: '' })
    }

    const totalCount: any = await Store.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })

    res.set('x-total-count', totalCount)

    const data = stores.map(item => {
      const data = JSON.parse(JSON.stringify(item))
      return data
    })

    return res.json(data)
  } catch(err) {
    return res.status(400).json({ message: '' })
  }
})

routes.get('/all', async (req: Request, res: Response): Promise<Response> => {
  const name = req.query?.name as string
  const skip = Number(req.query?.skip)
  const limit = Number(req.query?.limit)
  try {
    const stores = await Store.find({ name: { $regex: new RegExp(name), $options: 'i' }})
    .skip(skip).limit(limit)
    const products = await Product.find({ name: { $regex: new RegExp(name), $options: 'i' } })
    .skip(skip).limit(limit).populate([ { path: 'store', model: 'Store', select: ['name'] } ])
    const categories = await Category.find({ name: { $regex: new RegExp(name), $options: 'i' } })
    .skip(skip).limit(limit).populate([ { path: 'store', model: 'Store', select: ['name'] } ])
    const promotions = await Promotion.find({ name: { $regex: new RegExp(name), $options: 'i' } })
    .skip(skip).limit(limit).populate([ { path: 'store', model: 'Store', select: ['name'] } ])

    const setType = (data: Array<any>, type: string) => 
      data?.map(item => ({ ...JSON.parse(JSON.stringify(item)), type }))

    const data = []
    .concat(setType(stores, 'store'))
    .concat(setType(products, 'product'))
    .concat(setType(categories, 'category'))
    .concat(setType(promotions, 'promotion'))

    const totalStore = await Store.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })
    const totalProduct = await Product.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })
    const totalCategory = await Category.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })
    const totalPromotion = await Promotion.countDocuments({ name: { $regex: new RegExp(name), $options: 'i' } })

    const totalCount: any = totalStore+totalProduct+totalCategory+totalPromotion

    res.set('x-total-count', totalCount)

    if (!data?.length) return res.status(404).json({ message: '' })

    return res.json(data)
  } catch(err) {
    return res.status(400).json({ message: '' })
  }
})

routes.get('/', async (req, res) => {
   res.send("Mano Low White é muito é gay ")
})


export default routes