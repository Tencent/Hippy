import WebSocket from 'ws/index.js';
import { AppClientType, ClientEvent } from '../@types/enum';
import { AppClient } from './app-client';
import createDebug from 'debug';

const debug = createDebug('app-client:ios-proxy');

export class IwdpAppClient extends AppClient {
  url: string;
  ws: WebSocket;

  constructor(url, option) {
    super(url, option);
    this.url = url;
    this.connect();
  }

  connect() {
    if(this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

    this.ws = new WebSocket(this.url);
    this.type = AppClientType.IosProxy;
    this.ws.on('message', (msg: string) => {
      const msgObj = JSON.parse(msg);
      this.emit(ClientEvent.Message, msgObj);
    });
    this.ws.on('open', () => {
      debug(`ios proxy client opened: ${this.url}`);
      for (const msg of this.msgBuffer) {
        this.send(msg);
      }
      this.msgBuffer = [];
    });
    this.ws.on('close', () => {
      this.isClosed = true;
      this.emit(ClientEvent.Close);
    });
    this.ws.on('error', e => {
      debug('ios proxy client error: %j', e)
    })
  }

  send(msg: Adapter.CDP.Req) {
    if(!this.filter(msg)) return;

    if (this.ws?.readyState === WebSocket.OPEN) {
      const msgStr = JSON.stringify(msg);
      this.ws.send(msgStr);
    } else {
      this.msgBuffer.push(msg);
    }
  }

  resume() {
    // ios 的 resume 需要发送 Debugger.disable
    this.send({
      id: Date.now(),
      method: 'Debugger.disable',
      params: {},
    });
  }
}
