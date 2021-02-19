import { MessageDto } from '@dtos/MessageDto';
import { UserDto } from '@dtos/UserDto';
import { UsersStateDto } from '@dtos/UsersStateDto';
import { UsersTypingStateDto } from '@dtos/UsersTypingStateDto';
import { ChatActionType } from './ChatActionType';

export const chatActions = {
  messageReceived(sender: UserDto, lastMessage: MessageDto) {
    return JSON.stringify({
      type: ChatActionType.MESSAGE_RECEIVED,
      payload: {
        user: sender,
        lastMessage,
      },
    });
  },
  updateChat(lastMessage: MessageDto) {
    return JSON.stringify({
      type: ChatActionType.UPDATE_CHAT,
      payload: {
        lastMessage,
      },
    });
  },
  sendUsers(usersState: UsersStateDto) {
    return JSON.stringify({
      type: ChatActionType.GET_USERS,
      payload: {
        usersState,
      },
    });
  },
  updateUsers(usersState: UsersStateDto) {
    return JSON.stringify({
      type: ChatActionType.UPDATE_USERS,
      payload: {
        usersState,
      },
    });
  },
  updateUsersTypingState(usersTypingState: UsersTypingStateDto) {
    return JSON.stringify({
      type: ChatActionType.TYPING_STATUS,
      payload: {
        usersTypingState,
      },
    });
  },
};
