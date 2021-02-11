import './pre-start'; // Must be the first import
import { MessageDto } from '@dtos/MessageDto';
import { EntityEnum } from '@enums/EntityEnum';
import app from '@server';
import logger from '@shared/Logger';
import { getCollection } from '@utils/getCollection';
import { ObjectId } from 'mongodb';

// Start the server
const port = Number(process.env.PORT || 5000);

// Export server instance
export const server = app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});

// Setup WebSockets
const webSocketServer = require('websocket').server;

const wsServer = new webSocketServer({
  httpServer: server,
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

const clients: { [key: string]: any[] } = {};

wsServer.on('request', function (request: any) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();

    return;
  }

  const connection = request.accept('echo-protocol', request.origin);

  connection.on('message', async function (message: any) {
    if (message.type === 'utf8') {
      const data: {
        user_id: string;
        type: 'GET' | 'POST' | 'INIT';
        payload: {
          receiver: string;
          message: MessageDto;
        };
      } = JSON.parse(message.utf8Data);

      const { user_id } = data;

      switch (data.type) {
        case 'INIT':
          {
            if (!clients[user_id]) {
              clients[user_id] = [];
            }

            clients[user_id].push(connection);
          }
          break;

        case 'GET':
          {
            const { receiver } = data.payload;

            if (receiver === user_id) {
              return connection.sendUTF;
            }

            const collection = getCollection(EntityEnum.Chats);

            let chat = await collection.findOne({
              participants: { $all: [receiver, user_id] },
            });

            if (!chat) {
              await collection.insertOne({
                participants: [receiver, user_id],
                messages: [],
              });

              chat = await collection.findOne({
                participants: { $all: [receiver, user_id] },
              });
            }

            const usersCollection = getCollection(EntityEnum.Users);

            try {
              const receiverId = new ObjectId(receiver);

              const companion = await usersCollection.findOne({
                _id: receiverId,
              });

              if (companion) {
                clients[user_id].forEach((item) =>
                  item.sendUTF(
                    JSON.stringify({
                      status: 200,
                      result: {
                        companion: {
                          name: companion.name,
                          image: companion.image,
                        },
                        lastMessage: chat.messages[chat.messages.length - 1],
                        messages: chat.messages,
                      },
                    })
                  )
                );
              } else {
                clients[user_id].forEach((item) =>
                  item.sendUTF(JSON.stringify({ status: 404 }))
                );
              }
            } catch {
              clients[user_id].forEach((item) =>
                item.sendUTF(JSON.stringify({ status: 404 }))
              );
            }
          }

          break;
        case 'POST':
          {
            const { receiver } = data.payload;

            const user = String(user_id);

            const collection = getCollection(EntityEnum.Chats);

            const chat = (
              await collection
                .find({ participants: { $all: [receiver, user] } })
                .toArray()
            )[0];

            if (!clients[user]) {
              clients[user_id] = [];

              clients[user_id].push(connection);
            }

            if (chat) {
              const { messages } = chat;

              messages.push({ user_id: user, ...data.payload.message });

              collection.updateOne(
                { participants: { $all: [receiver, user] } },
                { $set: { messages } }
              );

              clients[user_id].forEach((item) =>
                item.sendUTF(
                  JSON.stringify({
                    status: 201,
                    type: 'CHAT',
                    result: {
                      receiver,
                    },
                  })
                )
              );

              if (clients[receiver]) {
                clients[receiver].forEach((item) =>
                  item.sendUTF(JSON.stringify({ status: 201, type: 'CHAT' }))
                );
              }
            } else {
              clients[user_id].forEach((item) =>
                item.sendUTF(JSON.stringify({ status: 404 }))
              );
            }
          }
          break;

        default:
          connection.sendUTF(message.utf8Data);
      }
    }
  });

  connection.on('close', function (message: any) {
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);

      delete clients[data.user_id];
    }

    console.log(
      new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.'
    );
  });
});
