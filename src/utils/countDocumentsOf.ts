import mongose from "mongoose"
import { transformMatchWithOptions } from "./populate"

export async function countDocumentsOf (modelName: string, _match: any, _options: any) {
    if (!modelName) { throw new Error(`Error model name not defined`) }
    try {

        const { match, options } = await transformMatchWithOptions(_match, _options)

        const totalCount = await mongose.model(modelName).countDocuments(match)

        return totalCount
    } catch (err) { throw new Error(`Error counting of model '${modelName}' this model not exist`) }
} 