import { clients } from 'src';

export const closeOrAct = (
  user_id: string,
  socket: any,
  index: number,
  callback: (...args: any) => void
) => {
  if (socket.connected) {
    callback();
  } else {
    clients[user_id].splice(index, 1);
  }
};
