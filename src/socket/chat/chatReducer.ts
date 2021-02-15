import { UsersStateDto } from '@dtos/UsersStateDto';
import { EntityEnum } from '@enums/EntityEnum';
import { UsersStateEnum } from '@enums/UserStateEnum';
import { closeOrAct } from '@utils/closeOrAct';
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
    case ChatActionType.CHAT_SEND_MESSAGE:
      {
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

          clients[user_id].forEach((item, index) => {
            closeOrAct(user_id, item, index, () =>
              item.sendUTF(chatActions.updateChat(newMessage))
            );
          });

          if (clients[receiver]) {
            const usersCollection = getCollection(EntityEnum.Users);

            const userData = await usersCollection.findOne({
              _id: new ObjectId(user),
            });

            delete userData.password;

            clients[receiver].forEach((item, index) => {
              closeOrAct(receiver, item, index, () =>
                item.sendUTF(chatActions.messageReceived(userData, newMessage))
              );
            });
          }
        } else {
          clients[user_id].forEach((item, index) => {
            closeOrAct(user_id, item, index, () =>
              item.sendUTF(mainActions.notFound())
            );
          });
        }
      }
      break;

    case ChatActionType.UPDATE_USERS:
    case ChatActionType.GET_USERS:
      {
        const { users } = action.payload;

        const usersState: UsersStateDto = {};

        users.forEach((item: string) => {
          usersState[item] =
            clients[item] && clients[item].length
              ? UsersStateEnum.ONLINE
              : UsersStateEnum.OFFLINE;
        });

        clients[user_id].forEach((item, index) => {
          closeOrAct(user_id, item, index, () =>
            item.sendUTF(chatActions.updateUsers(usersState))
          );
        });

        users.forEach((companion_id: string) => {
          if (clients[companion_id]) {
            clients[companion_id].forEach((item, index) => {
              closeOrAct(companion_id, item, index, () =>
                chatActions.updateUsers({ [user_id]: UsersStateEnum.ONLINE })
              );
            });
          }
        });
      }

      break;
  }
};
