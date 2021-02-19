import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import { rootReducer } from './socket';
import { ClientsControl } from '@socket/clientsControl/ClientsControl';

// Start the server
const port = Number(process.env.PORT || 5000);

// Export server instance
export const server = app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});

// Setup WebSockets
const webSocketServer = require('websocket').server;

const wsServer = new webSocketServer({
  httpServer: server,
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

export const clientsControl = new ClientsControl();

wsServer.on('request', function (request: any) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();

    return;
  }

  const connection = request.accept('echo-protocol', request.origin);

  connection.on('message', function (message: any) {
    if (message.type === 'utf8') {
      const action: any = JSON.parse(message.utf8Data);

      rootReducer(action, connection);
    }
  });
});
