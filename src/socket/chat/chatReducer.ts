import { UsersStateDto } from '@dtos/UsersStateDto';
import { EntityEnum } from '@enums/EntityEnum';
import { UsersStateEnum } from '@enums/UserStateEnum';
import { getCollection } from '@utils/getCollection';
import { ObjectId } from 'mongodb';
import { clientsControl } from 'src';
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

        if (chat) {
          const { messages } = chat;

          const newMessage = { user_id: user, ...action.payload.message };

          messages.push(newMessage);

          collection.updateOne(
            { participants: { $all: [receiver, user] } },
            { $set: { messages } }
          );

          clientsControl.sendMessage(
            user_id,
            chatActions.updateChat(newMessage)
          );

          const usersCollection = getCollection(EntityEnum.Users);

          const userData = await usersCollection.findOne({
            _id: new ObjectId(user),
          });

          delete userData.password;

          clientsControl.sendMessage(
            receiver,
            chatActions.messageReceived(userData, newMessage)
          );
        } else {
          clientsControl.sendMessage(user_id, mainActions.notFound());
        }
      }
      break;

    case ChatActionType.UPDATE_USERS:
    case ChatActionType.GET_USERS:
      {
        const { users } = action.payload;

        const usersState: UsersStateDto = {};

        users.forEach((item: string) => {
          usersState[item] = clientsControl.getClientState(item);
        });

        clientsControl.sendMessage(
          user_id,
          chatActions.updateUsers(usersState)
        );

        users.forEach((companion_id: string) => {
          clientsControl.sendMessage(
            companion_id,
            chatActions.updateUsers({ [user_id]: UsersStateEnum.ONLINE })
          );
        });
      }
      break;

    case ChatActionType.TYPING_STATUS:
      {
        const { receiver, status } = action.payload;

        clientsControl.sendMessage(
          receiver,
          chatActions.updateUsersTypingState({ [user_id]: status })
        );
      }
      break;
  }
};
