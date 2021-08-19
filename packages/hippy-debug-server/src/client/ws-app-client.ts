import createDebug from 'debug';
import WebSocket from 'ws/index.js';
import { AppClientType, ClientEvent, DevicePlatform } from '../@types/enum';
import { getRequestId } from '../middlewares';
import { AppClient } from './app-client';

const debug = createDebug('app-client:ws');

export class WsAppClient extends AppClient {
  private ws: WebSocket;
  private requestPromiseMap: Adapter.RequestPromiseMap = new Map();

  constructor(id, option) {
    super(id, option);
    this.type = AppClientType.WS;
    this.ws = option.ws;

    this.registerMessageListener();
  }

  public resumeApp() {
    debug('ws app client resume');
    if (this.platform === DevicePlatform.Android) {
      this.ws.send(
        JSON.stringify({
          id: getRequestId(),
          method: 'TDFRuntime.resume',
          params: {},
        }),
      );
    }
    this.ws.send(
      JSON.stringify({
        id: getRequestId(),
        method: 'Debugger.disable',
        params: {},
      }),
    );
  }

  protected registerMessageListener() {
    this.ws.on('message', (msg: string) => {
      const msgObj: Adapter.CDP.Res = JSON.parse(msg);
      this.onMessage(msgObj);

      if ('id' in msgObj) {
        const requestPromise = this.requestPromiseMap.get(msgObj.id);
        if (requestPromise) requestPromise.resolve(msgObj);
      }
    });

    this.ws.on('close', (msg) => {
      this.isClosed = true;
      this.emit(ClientEvent.Close, msg);
    });
  }

  protected sendToApp(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    return new Promise((resolve, reject) => {
      const msgStr = JSON.stringify(msg);
      this.ws.send(msgStr);
      this.requestPromiseMap.set(msg.id, { resolve, reject });
    });
  }
}
