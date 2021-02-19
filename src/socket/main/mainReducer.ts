import { clientsControl } from '@socket/clientsControl';
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
        clientsControl.addConnection(user_id, connection);
      }
      break;
  }
};
