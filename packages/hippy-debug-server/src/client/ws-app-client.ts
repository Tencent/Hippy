import WebSocket from 'ws/index.js';
import { AppClientType, ClientEvent } from '../@types/enum';
import { AppClient } from './app-client';

export class WsAppClient extends AppClient {
  ws: WebSocket;

  constructor(id, ws: WebSocket) {
    super(id);
    this.type = AppClientType.WS;
    this.ws = ws;
    ws.on('message', (msg: string) => {
      const msgObj = JSON.parse(msg);
      this.emit(ClientEvent.Message, msgObj)
    });
    ws.on('close', (msg) => this.emit(ClientEvent.Close, msg));
  }

  send(msg: Adapter.CDP.Req) {
    const msgStr = JSON.stringify(msg);
    this.ws.send(msgStr);
  }

  resume() {
    this.ws.send('chrome_socket_closed');
    console.warn('chrome_socket_closed');
  }
}
