import { ChangeEvent, ChangeEventCR, ChangeEventDelete, ChangeEventUpdate } from 'mongodb'
import mongoose, { Document, ObjectId } from 'mongoose'

export type modelChangeInterface<T extends string, TSchema extends object = { _id: ObjectId }> = 
  Record<T, Record<string, modelChangeMethodProps<TSchema>>>

export interface modelChangeMethodProps<TSchema extends object = { _id: ObjectId }> {
    pipeline?: Array<Record<string, unknown>>
    insert?: (next: ChangeEventCR<TSchema>) => any
    replace?: (next: ChangeEventUpdate<TSchema>) => any
    delete?: (next: ChangeEventDelete<TSchema>) => any
    timeInMS?: number
}

export function bindChanges (changes=[]) {
    if (changes.length > 0) {
        return Object.assign({}, ...changes)
    }
    return {}
  }
  
  export async function monitorAllEventEmitter(changes) {
    const modelNames = Object.keys(changes)
    return await Promise.all(modelNames?.map(async modelName => {
        const methods = changes[modelName];
        const methodNames = Object.keys(changes[modelName])
  
        return await Promise.all(methodNames?.map(async methodName => {
            const { timeInMS, pipeline, ...callbacks } = methods[methodName]
  
            return await monitorEventEmitter(modelName, callbacks, timeInMS, pipeline);
        }))
    }))
  }
  
  export async function monitorEventEmitter(modelName, callbacks, timeInMS = Infinity, pipeline = []) {
    const changeStream = mongoose.model(modelName).watch(pipeline);
  
    changeStream.on('change', (next: ChangeEvent<any>) => {
      switch (next.operationType) {
        case 'insert': //create
          callbacks?.insert && callbacks?.insert(next)
          break;
        case 'replace': //update
          callbacks?.replace && callbacks?.replace(next)
          break;
        case 'delete': //remove
          callbacks?.delete && callbacks?.delete(next)
          break;
        default:
          break;
      }
    });
    
    await closeChangeStrem(timeInMS, changeStream);
  }
  
  /** 
   * Close the given change stream after the given amount of time
   * @param {*} timeInMS The amount of time in ms to monitor listings
   * @param {*} changeStream The open change stream that should be closed
  */
   export function closeChangeStrem (timeInMS = Infinity, changeStream) {
    return new Promise<void>((resolve) => {
      if (timeInMS !== Infinity) {
        setTimeout(() => {
          console.log('Closing the change stream');
          changeStream.close();
          resolve();
        }, timeInMS);
      } else { resolve() }
    })
  }
  