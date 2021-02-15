import { clients } from 'src';
import { SocketReducer } from 'src/socket/SocketReducer';
import { MainActionType } from './MainActionType';

export const mainReducer: SocketReducer<MainActionType> = (
  action,
  connection
) => {
  const { user_id } = action;

  switch (action.type) {
    case MainActionType.INIT:
      {
        if (!clients[user_id]) {
          clients[user_id] = [];
        }

        clients[user_id].push(connection);
      }
      break;
  }
};
