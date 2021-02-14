import { SocketReducer } from 'src/socket/SocketReducer';
import { chatReducer } from './chat/chatReducer';
import { mainReducer } from './main/mainReducer';

const combinedReducers: SocketReducer[] = [mainReducer, chatReducer];

export const rootReducer: SocketReducer = (action, connection) => {
  combinedReducers.forEach((reducer) => reducer(action, connection));
};
