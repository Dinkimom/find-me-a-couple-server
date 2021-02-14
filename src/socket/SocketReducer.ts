import { SocketAction } from './SocketAction';

export type SocketReducer<ActionType = any, Payload = any> = (
  action: SocketAction<ActionType, Payload>,
  connection: any
) => void;
