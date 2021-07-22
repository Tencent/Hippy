import { EventEmitter } from 'events';
import { DebugPage } from '../../@types/tunnel.d';
import { DevtoolsClient, AppClient } from '../../client';
import { ClientEvent } from '../../@types/enum';
import createDebug from 'debug';

const debug = createDebug('target:ios');
const debugDown = createDebug('↓↓↓');
const debugUp = createDebug('↑↑↑');

export class IosTarget extends EventEmitter {
  devtoolsClient;
  appClients;
  _sendToDevtools;
  _sendToApp;
  private _data: DebugPage;
  private _messageFilters: Map<string, ((msg: any) => Promise<any>)[]> = new Map();
  private _toolRequestMap: Map<number, string> = new Map();
  private _adapterRequestMap: Map<number, { resolve: (any) => void; reject: (any) => void }> = new Map();
  private _requestId: number = 0;
  private _targetBased: boolean = false;
  private _targetId: string = null;
  private _contextId: number = 0;

  constructor(devtoolsClient: DevtoolsClient, appClients: AppClient[], data?: DebugPage) {
    super();
    this._data = data;
    this.appClients = appClients;
    this.devtoolsClient = devtoolsClient;

    this.devtoolsClient.on(ClientEvent.Message, msg => {
      this.appClients.forEach(appClient => {
        if(!appClient.useAdapter) {
          appClient.send(msg);
        }
      });
      this.onMessageFromTools(msg);
    });

    this.appClients.forEach(appClient => {
      appClient.on(ClientEvent.Message, this.onMessageFromApp.bind(this));
    });
    this.devtoolsClient.on(ClientEvent.Close, () => {
      debug('devtools client close');
      this.appClients.forEach(appClient => {
        appClient.resume();
      });
    });
    this.appClients.forEach(appClient => {
      appClient.on(ClientEvent.Close, () => {
        debug('app client closed')
        devtoolsClient.close()
      });
    });

    this._sendToDevtools = devtoolsClient.send.bind(devtoolsClient);
    this._sendToApp = (msg) => {
      this.appClients.forEach(appClient => {
        if(appClient.useAdapter)
          appClient.send(msg);
      });
    }
  }

  public get data(): DebugPage {
    return this._data;
  }

  public set targetBased(isTargetBased: boolean) {
    this._targetBased = isTargetBased;
  }

  public set targetId(targetId: string) {
    this._targetId = targetId;
  }

  public addMessageFilter(method: string, filter: (msg: any) => Promise<any>): void {
    if (!this._messageFilters.has(method)) {
      this._messageFilters.set(method, []);
    }

    this._messageFilters.get(method).push(filter);
  }

  public callTarget(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this._requestId -= 1;
      const request = {
        id: this._requestId,
        method,
        params,
      };

      this._adapterRequestMap.set(request.id, {
        resolve,
        reject,
      });
      this.sendToApp(request);
    });
  }

  public fireEventToTools(method: string, params: any): void {
    this.sendToDevtools({
      method,
      params,
    });
  }

  public fireResultToTools(id: number, params: any): void {
    this.sendToDevtools({
      id,
      result: params,
    });
  }

  public replyWithEmpty(msg: any): Promise<any> {
    this.fireResultToTools(msg.id, {});
    return Promise.resolve(null);
  }

  private onMessageFromTools(msg: Adapter.CDP.Req): void {
    const eventName = `tools::${msg.method}`;

    this._toolRequestMap.set(msg.id, msg.method);
    this.emit(eventName, msg.params);

    if (this._messageFilters.has(eventName)) {
      let sequence = Promise.resolve(msg);

      this._messageFilters.get(eventName).forEach((filter) => {
        sequence = sequence.then((filteredMessage) => filter(filteredMessage));
      });

      sequence.then((filteredMessage) => {
        // Only send on the message if it wasn't completely filtered out
        if (filteredMessage) {
          this.sendToApp(filteredMessage);
        }
      });
    } else {
      // Pass it on to the target
      this.sendToApp(msg);
    }
  }

  private onMessageFromApp(msg: Adapter.CDP.Res): void {
    debugDown(`↓↓↓ %j`, {
      id: (msg as any).id,
      method: (msg as any).method,
      error: (msg as any).error,
    });
    this.mockEventsToDevtools(msg);
    if (this._targetBased) {
      if (!(msg as any).method || !(msg as any).method.match(/^Target/)) {
        debug(JSON.stringify(msg));
        return;
      }
      if ((msg as any).method === 'Target.dispatchMessageFromTarget') {
        const rawMessage = (msg as any).params.message;
        msg = JSON.parse(rawMessage);
      }
    }

    if ('id' in msg) {
      if (this._toolRequestMap.has(msg.id)) {
        // Reply to tool request
        let eventName = `target::${this._toolRequestMap.get(msg.id)}`;
        this.emit(eventName, (msg as any).params);

        this._toolRequestMap.delete(msg.id);

        if ('error' in msg && this._messageFilters.has('target::error')) {
          eventName = 'target::error';
        }

        if (this._messageFilters.has(eventName)) {
          let sequence = Promise.resolve(msg);

          this._messageFilters.get(eventName).forEach((filter) => {
            sequence = sequence.then((filteredMessage) => filter(filteredMessage));
          });

          sequence.then((filteredMessage) => {
            this.sendToDevtools(filteredMessage);
          });
        } else {
          // Pass it on to the tools
          this.sendToDevtools(msg);
        }
      } else if (this._adapterRequestMap.has(msg.id)) {
        // Reply to adapter request
        const resultPromise = this._adapterRequestMap.get(msg.id);
        this._adapterRequestMap.delete(msg.id);

        if ('result' in msg) {
          resultPromise.resolve(msg.result);
        } else if ('error' in msg) {
          resultPromise.reject(msg.error);
        } else {
          debug(`Unhandled type of request message from target %j`, msg);
        }
      } else {
        debug(`Unhandled message from target %j`, msg);
      }
    } else {
      const eventName = `target::${msg.method}`;
      this.emit(eventName, msg);

      if (this._messageFilters.has(eventName)) {
        let sequence = Promise.resolve(msg);

        this._messageFilters.get(eventName).forEach((filter) => {
          sequence = sequence.then((filteredMessage) => filter(filteredMessage));
        });

        sequence.then((filteredMessage) => {
          if(!filteredMessage) return;
          this.sendToDevtools(filteredMessage);
        });
      } else {
        this.sendToDevtools(msg);
      }
    }

    this.mockResultToDevtools(msg);
  }

  private mockEventsToDevtools(msg) {
    if (msg.method === 'Runtime.enable') {
      debug('emit event Runtime.executionContextCreated');
      this._contextId += 1;
      this.fireEventToTools('Runtime.executionContextCreated', {
        context: {
          id: this._contextId,
          name: 'tdf',
          origin: '',
        },
      });
    }
  }

  private mockResultToDevtools(msg) {
    const mockSucMethodList = [
      'Runtime.enable',
      'Debugger.enable',
      'Debugger.setBlackboxPatterns',
      'Debugger.setPauseOnExceptions',
    ];
    if (mockSucMethodList.indexOf(msg.method) !== -1) {
      this.sendToDevtools({
        id: msg.id,
        result: {},
      });
    }

    const mockFailMethodList = ['Page.enable'];
    if (mockFailMethodList.indexOf(msg.method) !== -1) {
      this.sendToDevtools({
        id: msg.id,
        error: {
          code: -32601,
          message: `'${msg.method}' wasn't found`,
        },
      });
    }
  }

  private sendToDevtools(msg: Adapter.CDP.Res): void {
    this._sendToDevtools(msg);
  }

  private sendToApp(msg: Adapter.CDP.Req): void {
    let newMsg = msg;
    if (this._targetBased) {
      if (!msg.method.match(/^Target/)) {
        newMsg = {
          id: msg.id,
          method: 'Target.sendMessageToTarget',
          params: {
            id: msg.id,
            message: JSON.stringify(msg),
            targetId: this._targetId,
          },
        };
      }
    }

    debugUp(`%j`, newMsg);
    this._sendToApp(newMsg);
  }
}
