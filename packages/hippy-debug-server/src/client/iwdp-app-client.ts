import createDebug from 'debug';
import WebSocket from 'ws/index.js';
import { AppClientType, ClientEvent } from '../@types/enum';
import { getRequestId } from '../middlewares/global-id';
import { AppClient } from './app-client';

const debug = createDebug('app-client:ios-proxy');

export class IwdpAppClient extends AppClient {
  private url: string;
  private ws: WebSocket;
  private requestPromiseMap: Adapter.RequestPromiseMap = new Map();

  constructor(url, option) {
    super(url, option);
    this.url = url;
    this.connect();
    this.registerMessageListener();
  }

  public resumeApp() {
    // ios 的 resume 需要发送 Debugger.disable
    this.sendToApp({
      id: getRequestId(),
      method: 'Debugger.disable',
      params: {},
    });
  }

  protected connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

    this.ws = new WebSocket(this.url);
    this.type = AppClientType.IosProxy;
  }

  protected registerMessageListener() {
    this.ws.on('message', (msg: string) => {
      const msgObj = JSON.parse(msg);
      this.onMessage(msgObj);
      const requestPromise = this.requestPromiseMap.get(msgObj.id);
      if (requestPromise) {
        requestPromise.resolve(msgObj);
      }
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

      const e = new Error('ws closed');
      for (const requestPromise of this.requestPromiseMap.values()) {
        requestPromise.reject(e);
      }
    });

    this.ws.on('error', (e) => {
      debug('ios proxy client error: %j', e);
    });
  }

  protected sendToApp(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const msgStr = JSON.stringify(msg);
        this.ws.send(msgStr);
        this.requestPromiseMap.set(msg.id, { resolve, reject });
      } else {
        this.msgBuffer.push(msg);
      }
    });
  }
}
