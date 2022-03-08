import { HippyWebModule } from '../../base';
import { BaseModule, ModuleContext } from '../../types';
import { callbackToHippy, dispatchModuleEventToHippy } from '../common';
const enum EventType {
  ON_OPEN='onOpen',
  ON_CLOSE='onClose',
  ON_ERROR='onError',
  ON_MESSAGE='text',
}
export class WebSocketModule extends HippyWebModule {
  public static moduleName = 'WebSocketModule';
  private webSocketConnections: {[key: string]: WebsocketObject} = {};


  public connect(callBackId: number, data: {url?: string, headers?: {[key: string]: any} }) {
    const response = {
      code: -1,
      reason: '',
    };
    if (!data) {
      response.reason = 'invalid connect param';
      callbackToHippy(callBackId, response, true, 'connect', WebSocketModule.moduleName);
      return;
    }
    if (!data.url) {
      response.reason = 'no valid url for websocket';
      callbackToHippy(callBackId, response, true, 'connect', WebSocketModule.moduleName);
      return;
    }
    let protocols = [];
    if (data.headers && data.headers['Sec-WebSocket-Protocol']) {
      protocols =  data.headers['Sec-WebSocket-Protocol'].split(',');
    }
    const id = `websocket-key-${Object.keys(this.webSocketConnections).length}`;
    this.webSocketConnections[id] = new WebsocketObject(id, data.url, protocols);
    this.webSocketConnections[id].connect(this.dispatchEvent);
  }

  public send(callBackId: number, data: {id: string, data: any}) {
    if (!data || !data.id) {
      console.log('hippy', 'send: ERROR: request is null or no socket id specified');
      return;
    }
    if (!this.webSocketConnections[data.id] || !this.webSocketConnections[data.id].disconnected) {
      console.log('hippy', 'send: ERROR: no socket id specified or disconnected');
      return;
    }
    if (!data.data || typeof  data.data !== 'string') {
      console.log('hippy', 'send: ERROR: no data specified to be sent or data type error');
    }
    this.webSocketConnections[data.id]!.send(data.data);
  }

  public close(callBackId: number, data: { id: string, code: number, reason: string}) {
    if (!data || !data.id) {
      console.log('hippy', 'close: ERROR: request is null');
      return;
    }
    if (!this.webSocketConnections[data.id] || this.webSocketConnections[data.id].disconnected) {
      console.log('hippy', 'close: ERROR: no socket id specified, or not found, or not connected yet');
      return;
    }
    this.webSocketConnections[data.id].close(data.code, data.reason);
  }

  public dispatchEvent(id: string, eventType: EventType, data: any) {
    dispatchModuleEventToHippy(['hippyWebsocketEvents', { ...data, id, type: eventType }]);
  }

  public initialize() {

  }

  public destroy() {

  }
}

const enum WebSocketReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

class WebsocketObject {
  private id!: string;
  private connection?: WebSocket;
  private state?: WebSocketReadyState;
  private dispatchEvent?: (id: string, eventType: EventType, data?: {[key: string]: any}) => void;
  public constructor(id: string, url: string, protocols: string|string[]|undefined) {
    this.connection = new WebSocket(url, protocols);
    this.id = id;
  }

  public get disconnected() {
    return this.state !== WebSocketReadyState.OPEN;
  }

  public connect(dispatchEvent: (id: string, eventType: EventType, data: any) => void) {
    if (!this.connection) {
      return;
    }
    this.dispatchEvent = dispatchEvent;
    this.state = WebSocketReadyState.CONNECTING;
    this.connection.addEventListener('open', this.handleSocketOpen);
    this.connection.addEventListener('message', this.handleSocketMessage);
    this.connection.addEventListener('close', this.handleSocketClose);
    this.connection.addEventListener('error', this.handleSocketError);
  }

  public handleSocketOpen() {
    this.state = WebSocketReadyState.OPEN;
    this.dispatchEvent!(this.id, EventType.ON_OPEN);
  }

  public handleSocketClose() {
    this.state = WebSocketReadyState.CLOSED;
    this.dispatchEvent!(this.id, EventType.ON_CLOSE);
  }

  public handleSocketMessage(event: any) {
    this.dispatchEvent!(this.id, EventType.ON_MESSAGE, { data: event.data });
  }

  public handleSocketError(event: any) {
    this.dispatchEvent!(this.id, EventType.ON_ERROR, { reason: event.toString() });
  }

  public send(data: string) {
    this.connection?.send(data);
  }
  public close(code?: number, reason?: string) {
    this.connection?.close(code, reason);
    this.state = WebSocketReadyState.CLOSING;
  }
}
