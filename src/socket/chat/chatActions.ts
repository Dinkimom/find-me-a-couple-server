import { ChatDto } from '@dtos/ChatDto';
import { MessageDto } from '@dtos/MessageDto';
import { UserDto } from '@dtos/UserDto';
import { UsersStateDto } from '@dtos/UsersStateDto';
import { ChatActionType } from './ChatActionType';

export const chatActions = {
  sendChat(companion: UserDto, chat: ChatDto) {
    return JSON.stringify({
      status: 200,
      payload: {
        companion: {
          name: companion.name,
          image: companion.image,
        },
        lastMessage: chat.messages[chat.messages.length - 1],
        messages: chat.messages,
      },
    });
  },
  messageReceived(sender: UserDto, lastMessage: MessageDto) {
    return JSON.stringify({
      status: 200,
      type: ChatActionType.MESSAGE_RECEIVED,
      payload: {
        user: sender,
        lastMessage,
      },
    });
  },
  updateChat(lastMessage: MessageDto) {
    return JSON.stringify({
      status: 201,
      type: ChatActionType.UPDATE_CHAT,
      payload: {
        lastMessage,
      },
    });
  },
  sendUsers(usersState: UsersStateDto) {
    return JSON.stringify({
      status: 200,
      type: ChatActionType.GET_USERS,
      payload: {
        usersState,
      },
    });
  },
  updateUsers(usersState: UsersStateDto) {
    return JSON.stringify({
      status: 200,
      type: ChatActionType.UPDATE_USERS,
      payload: {
        usersState,
      },
    });
  },
};
