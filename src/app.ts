import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose'
import routes from './routes'

class App {
  public express: express.Application

  public constructor () {
    this.express = express()

    this.middlewares()
    this.database()
    this.routes()
  }

  private middlewares (): void {
    this.express.use(express.json())
    this.express.use(cors())
  }

  private database (): void {
    mongoose.connect('mongodb://localhost:27017/wasitt-d?authSource=admin', {//db docker
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
      useCreateIndex: true,
      ignoreUndefined: true,
    })
    mongoose.connection.on('error', () => console.error('connection error:'))
    mongoose.connection.once('open', () => console.log('database connected'))
  }

  private routes (): void {
    this.express.use(routes)
  }
}

export default new App().express