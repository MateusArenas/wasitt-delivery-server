
import graphqlFields from 'graphql-fields'
import { GraphQLResolveInfo } from "graphql"
import mongose, { isValidObjectId } from 'mongoose'
import { transformMatchWithOptions } from './populate'

export function createPopulateFields (paths: string[]) {
    async function populateFields(info: GraphQLResolveInfo, extra:any={}) {
        const rootPath = info.path.key
        const fields = graphqlFields(info as any)

        const topLevelFields = { root: { [rootPath]: fields } }
    
        function deepPopulate (myTop, path='root') {
            return Object.keys(myTop[path])?.filter(p => paths?.find(i => p === i))?.map(byPath => ({
                path: byPath,
                select: Object.keys(myTop[path][byPath]),
                populate: deepPopulate(myTop[path], byPath)
            }))
        }
        const [populate] = deepPopulate(topLevelFields)
        
        const { match, options } = await transformMatchWithOptions(extra?.match, extra?.options)
        
        return {...populate, ...extra, match, options }
    }
    
    return populateFields
}