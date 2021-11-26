import app, { PORT, schema } from './app'
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const server = createServer(app);

// const validateToken = (authToken) => {
//     // ... validate token and return a Promise, rejects in case of an error
// }

// const findUser = (authToken) => {
//     return (tokenValidationResult) => {
//         // ... finds user by auth token and return a Promise, rejects in case of an error
//     }
// }

server.listen({ port: PORT }, async () => {
    console.log(`GraphQL Server running on http://localhost:${PORT}/graphql`)
    SubscriptionServer.create({ 
        schema, execute, subscribe, 
    //     onConnect: (connectionParams, webSocket) => {
    //         if (connectionParams.authToken) {
    //              return validateToken(connectionParams.authToken)
    //                  .then(findUser(connectionParams.authToken))
    //                  .then((user) => {
    //                      return {
    //                          currentUser: user,
    //                      };
    //                  });
    //         }
     
    //         throw new Error('Missing auth token!');
    //      }
    //    },
        onConnect: ({ authorization, ...res }) => {
           console.log({ authorization }, 'aquiiiiii');
           return { authorization, ...res }
       },
    }, { server, path: '/subscriptions' });
    console.log(`WebSockets listening on ws://localhost:${PORT}/subscriptions`)
})

// process.on('uncaughtException', (e)=>{  
//     console.error('process error is:', e.message);  
//     process.exit(1);
// });
// process.on('unhandledRejection', (e)=>{  
//     console.error('unhandledRejection error is:', e?.message);  
//     process.exit(1);
// });