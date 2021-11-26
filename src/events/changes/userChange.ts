import { modelChangeInterface } from '../../components/monitorEventEmitter';
import { UserInterface } from '../../schemas/User';

import pubsub from '../../graphql/config/pubsub';

const NEW_USER_EVENT = 'NEW_USER_EVENT'

const userChange: modelChangeInterface<'User', UserInterface> = {
    User : {
        friendsByWhatsapp: { 
            pipeline: [], 
            insert: async next => {
                console.log('in event emiter');
                
                pubsub.publish(NEW_USER_EVENT, { 
                    newUser: { _id: next.documentKey._id }
                });
            },
            replace: async () => {
                
            },
            delete: async () => {
                
            },
        },
        friendsByTelegram: { 
            pipeline: [], 
            replace: async () => {
                
            }, 
        },
    }
};

export default userChange;