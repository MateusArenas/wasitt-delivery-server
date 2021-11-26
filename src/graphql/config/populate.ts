import mongoose from 'mongoose';
import { createPopulateFields } from '../../utils/createPopulateFields';

function checkFieldRef (field) {
    const ref = Array.isArray(field) ? field[0]?.ref : field?.ref

    if (typeof ref === 'string') {
        return mongoose.modelNames().includes(ref)
    }

    return (ref !== undefined)
}

const schemas = [];
mongoose.modelNames().forEach(function(modelName){
    const schema = mongoose.model(modelName).schema.obj

    const keys = Object.keys(schema)

    const paths = keys.filter(key => checkFieldRef(schema[key]))

    schemas.push(paths);
})

const fields = schemas.flat();
const paths = fields?.filter((v,i) => fields?.indexOf(v) === i)

const populateFields = createPopulateFields(paths)

export default populateFields