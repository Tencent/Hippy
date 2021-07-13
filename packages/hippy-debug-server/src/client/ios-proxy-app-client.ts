import WebSocket from 'ws/index.js';
import { AppClientType, ClientEvent } from '../@types/enum';
import { AppClient } from './app-client';
import { sendMessage } from '../message-channel/tunnel';
import messageChannel from '../message-channel';

export class IosProxyClient extends AppClient {
  url: string;
  ws: WebSocket;

  constructor(url) {
    super(url);
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
      console.debug(`ios proxy client opened: ${this.url}`);
      for (const msg of this.msgBuffer) {
        this.send(msg);
      }
      this.msgBuffer = [];
    });
    this.ws.on('close', () => {
      this.emit(ClientEvent.Close);
    });
    this.ws.on('error', e => {
      console.error('ios proxy client error: ', e)
    })
  }

  send(msg: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const msgStr = JSON.stringify(msg);
      this.ws.send(msgStr);
    } else {
      this.msgBuffer.push(msg);
    }
  }

  resume() {
    sendMessage({
      module: 'jsDebugger',
      content: 'chrome_socket_closed',
    } as any);
  }
}
