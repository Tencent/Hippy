import WebSocket from 'ws/index.js';
import { AppClientType, ClientEvent } from '../@types/enum';
import { AppClient } from './app-client';
import createDebug from 'debug';

const debug = createDebug('app-client:ws');

export class WsAppClient extends AppClient {
  ws: WebSocket;

  constructor(id, option) {
    super(id, option);
    this.type = AppClientType.WS;
    this.ws = option.ws;
    this.ws.on('message', (msg: string) => {
      const msgObj = JSON.parse(msg);
      this.emit(ClientEvent.Message, msgObj)
    });
    this.ws.on('close', (msg) => {
      this.isClosed = true;
      this.emit(ClientEvent.Close, msg)
    });
  }

  send(msg: Adapter.CDP.Req) {
    if(!this.filter(msg)) return;

    const msgStr = JSON.stringify(msg);
    this.ws.send(msgStr);
  }

  resume() {
    debug('ws app client resume');
    this.ws.send('chrome_socket_closed');
    this.ws.send(JSON.stringify({
      id: Date.now(),
      method: 'Debugger.disable',
      params: {},
    }));
  }
}
