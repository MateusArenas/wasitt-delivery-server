import express, { NextFunction, Request, Response } from 'express';
import "express-async-errors"
import cors from 'cors'
import mongoose from 'mongoose'
import routes from './routes'
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './graphql/auto/types'
import resolvers from './graphql/auto/resolvers'
import { monitorAllEventEmitter } from './components/monitorEventEmitter';
import changes from './events/auto/changes';

export const schema = makeExecutableSchema({ typeDefs, resolvers })

export const PORT = 3000 

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
    //for services
    this.express.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      if (error instanceof Error) {
        return res.status(400).json(error.message)
      } 
      
      return res.status(500).json(error)
    })

    process.on('uncaughtException', function (err) {
      console.error(err);
      console.log("Node NOT Exiting...");
    });
    process.on('unhandledRejection', function (err) {
      console.error(err);
      console.log("Node NOT Exiting...");
    });
//     process.on('uncaughtException', (e)=>{  
//     console.error('process error is:', e.message);  
//     process.exit(1);
// });
// process.on('unhandledRejection', (e)=>{  
//     console.error('unhandledRejection error is:', e?.message);  
//     process.exit(1);
// });
    
    //graphql
    this.express.use('/graphql', graphqlHTTP((request, response) => ({
      schema,
      context: { authorization: request.headers.authorization },
      graphiql: {
        headerEditorEnabled: true,
        subscriptionEndpoint: `ws://localhost:${PORT}/subscriptions`
      },
    })))
  }

  private async database () {
    
    mongoose.connect('mongodb://mongo:27017/wasitt-d?retryWrites=true&w=majority', {//db docker
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
      useCreateIndex: true,
      ignoreUndefined: true,  
      authSource: 'admin',
    })

    mongoose.connection.on('error', () => console.error('connection error:'))
    mongoose.connection.once('open', () => console.log('database connected'))
    
    await monitorAllEventEmitter(changes)
  }

  private routes (): void {
    this.express.use(routes)
  }
}

export default new App().express
