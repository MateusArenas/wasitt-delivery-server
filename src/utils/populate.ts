import mongose, { isValidObjectId } from 'mongoose'
import populateFields from '../graphql/config/populate'
import { capitalize } from "../utils/format"

export async function transformMatchWithOptions(match={}, options={ regex: [] }) {

    const o = await Promise.all(Object.keys(match)
    ?.map(async key => {
        if (typeof match[key] === 'object' 
            && !match[key]?.$regex
            && !match[key]?.$options
        ) {
            if (!Array.isArray(match[key])) {
                const modelName = capitalize(key)
                
                console.log({ [key]: 'document?._id' });
                
                const document = await mongose.model(modelName).findOne(match[key]).select(['_id'])

                return { [key]: document?._id }
            }
        }
        return { [key]: match[key] }
    }))

    const y = o?.reduce((acc, val) => ({ ...acc, ...val }), {})
    

        options?.regex?.forEach(key => {
            if (!isValidObjectId(y[key])) {
                
                y[key] = { $regex: new RegExp(y[key]), $options: 'i' }
            }
            if (!isValidObjectId(match[key])) {
                match[key] = { $regex: new RegExp(match[key]), $options: 'i' }
            }
        });


    const i = Object.keys(options)
        ?.filter(key => key !== 'regex')
        ?.reduce((acc, val) => ({ ...acc, [val]: options[val] }), {})


    console.log({ y, i });
    

    return { match: y, options: i }
}

export async function indexPopulate(model, info, _match, _options, modelName) {
    const path = info.path.key

    const populate = await populateFields(info, { options: _options, match: _match })
    const collection = (await model.populate(populate).execPopulate())[path]

    const {match, options} = await transformMatchWithOptions(_match, _options)

    const totalCount = await mongose.model(modelName).countDocuments(match)

    collection?.forEach(item => { item.totalCount = totalCount })

    return collection
}
