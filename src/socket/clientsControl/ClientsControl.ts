import { UsersStateEnum } from '@enums/UserStateEnum';

export class ClientsControl {
  private clients: {
    [key: string]: any[];
  };

  constructor() {
    this.clients = {};
  }

  public addConnection(user_id: string, connection: any) {
    if (!this.clients[user_id]) {
      this.clients[user_id] = [];
    }

    this.clients[user_id].push(connection);
  }

  public sendMessage(user_id: string, message: string) {
    if (this.clients[user_id]) {
      this.clients[
        user_id
      ].forEach((connection: any, connectionIndex: number) =>
        this.closeOrSend(user_id, connection, connectionIndex, () =>
          connection.sendUTF(message)
        )
      );
    }
  }

  public getClientState(user_id: string): UsersStateEnum {
    return this.clients[user_id] && this.clients[user_id].length
      ? UsersStateEnum.ONLINE
      : UsersStateEnum.OFFLINE;
  }

  private closeOrSend(
    user_id: string,
    connection: any,
    connectionIndex: number,
    callback: (...args: any) => void
  ) {
    if (connection.connected) {
      callback();
    } else {
      this.clients[user_id].splice(connectionIndex, 1);
    }
  }
}
