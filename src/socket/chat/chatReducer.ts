import { EntityEnum } from '@enums/EntityEnum';
import { getCollection } from '@utils/getCollection';
import { ObjectId } from 'mongodb';
import { clients } from 'src';
import { SocketReducer } from 'src/socket/SocketReducer';
import { mainActions } from '../main/actions';
import { chatActions } from './chatActions';
import { ChatActionType } from './ChatActionType';

export const chatReducer: SocketReducer<ChatActionType> = async (
  action,
  connection
) => {
  const { user_id } = action;

  switch (action.type) {
    case ChatActionType.CHAT_SEND_MESSAGE: {
      const { receiver } = action.payload;

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

        const newMessage = { user_id: user, ...action.payload.message };

        messages.push(newMessage);

        collection.updateOne(
          { participants: { $all: [receiver, user] } },
          { $set: { messages } }
        );

        clients[user_id].forEach((item) =>
          item.sendUTF(chatActions.updateChat(newMessage))
        );

        if (clients[receiver]) {
          const usersCollection = getCollection(EntityEnum.Users);

          const userData = await usersCollection.findOne({
            _id: new ObjectId(user),
          });

          delete userData.password;

          clients[receiver].forEach((item) =>
            item.sendUTF(chatActions.messageReceived(userData, newMessage))
          );
        }
      } else {
        clients[user_id].forEach((item) =>
          item.sendUTF(mainActions.notFound())
        );
      }
    }
  }
};
