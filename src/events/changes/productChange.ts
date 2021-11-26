import { modelChangeInterface } from '../../components/monitorEventEmitter';
import { ProductInterface } from '../../schemas/Product';

const userChange: modelChangeInterface<'Product', ProductInterface> = {
    Product : {
        news: { 
            insert: async next => {
                
            },
            replace: async next => {
                
            },
            delete: async next => {
                
            },
        },
    }
};

export default userChange;