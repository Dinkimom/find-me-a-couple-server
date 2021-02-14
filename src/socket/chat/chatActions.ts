import { ChatDto } from '@dtos/ChatDto';
import { MessageDto } from '@dtos/MessageDto';
import { UserDto } from '@dtos/UserDto';
import { ChatActionType } from './ChatActionType';

export const chatActions = {
  sendChat(companion: UserDto, chat: ChatDto) {
    return JSON.stringify({
      status: 200,
      result: {
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
      result: {
        user: sender,
        lastMessage,
      },
    });
  },
  updateChat(lastMessage: MessageDto) {
    return JSON.stringify({
      status: 201,
      type: ChatActionType.UPDATE_CHAT,
      result: {
        lastMessage,
      },
    });
  },
};
