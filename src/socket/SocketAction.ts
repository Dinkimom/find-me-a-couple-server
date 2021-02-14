export interface SocketAction<ActionType = any, Payload = any> {
  type: ActionType;
  user_id: string;
  payload: Payload;
}
