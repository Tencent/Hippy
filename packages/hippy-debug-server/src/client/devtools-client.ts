import createDebug from 'debug';
import { EventEmitter } from 'events';
import WebSocket from 'ws/index.js';
import { ClientEvent } from '../@types/enum';
import { Tunnel } from '../@types/tunnel';
import { getHeapMeta, saveHeapMeta } from '../controller/heap-controller';
import { registerModuleCallback, sendMessage } from '../message-channel/tunnel';
import { isCdpDomains } from '../utils/cdp';

const debug = createDebug('devtools-client');
createDebug.enable('devtools-client');
const noop = () => {};
/**
 * 对外接口：
 *  on:
 *    message
 *    close     devtools 断连后触发
 *  send
 *  close
 **/
export class DevtoolsClient extends EventEmitter {
  id: string;
  domainListeners: Map<string, Array<Adapter.DomainCallback>> = new Map();
  // 记录下行消息 id 和 method 的map，在消息上行时可以根据id获取其 method
  msgIdMethodMap: Map<number, string> = new Map();
  sendToDevtools: (msg: Adapter.CDP.Res) => void = noop;
  // app端断连，devtools ws主动断连。socket-bridge中赋值
  close: () => void = noop;
  connectionList = [];
  onCloseList = [];

  constructor(id) {
    super();
    this.id = id;
  }

  /**
   * 消息下行至 tunnel/app
   * @param msg
   */
  sendMessage(msg: Tunnel.Req | Adapter.CDP.Req) {
    // 自定义协议无需适配，下行至 tunnel
    if ('module' in msg) {
      if (msg.module !== undefined) {
        if (msg.module === 'fetchHeapMeta') {
          const id = msg.content[0].id;
          getHeapMeta(id).then((data) => {
            this.sendToDevtools({ ...msg, content: data.content } as any);
          });
        } else sendMessage(msg as Tunnel.Req);
      }
    }
    // CDP/IWDP 协议需适配，下行至 adapter
    else {
      this.msgIdMethodMap.set(msg.id, msg.method);
      this.emit(ClientEvent.Message, msg as Adapter.CDP.Req);
    }
  }

  /**
   * 消息上行至 devtools/listener
   * @param msg
   * @returns
   */
  send(msg: Adapter.CDP.Res) {
    if (!msg) return;
    // if ('error' in msg) return;

    if ('id' in msg) msg.method = this.msgIdMethodMap.get(msg.id);

    // if (!msg.method) return;

    if (this.sendToDevtools) {
      // const msgStr = JSON.stringify(msg);
      const method = msg.method || (msg as any).module;
      if (method === 'getHeapMeta') {
        saveHeapMeta(msg);
      }

      this.sendToDevtools(msg);
    }

    const domain = msg.method?.split('.')[0];
    const listeners = (this.domainListeners.get(domain) || []).concat(this.domainListeners.get(msg.method) || []);
    listeners.forEach((listener) => {
      listener(msg);
    });
  }

  /**
   * 注册非jsDebugger模块的回调
   * @param module
   * @param cb
   */
  registerModuleCallback(module, cb) {
    registerModuleCallback(module, cb);
  }

  /**
   * 注册jsDebugger模块的回调，根据 domain/method 区分
   * @param domain
   * @param cb
   */
  registerDomainCallback(domain, cb) {
    if (!this.domainListeners.has(domain)) this.domainListeners.set(domain, []);
    this.domainListeners.get(domain).push(cb);
  }

  addConnection({ ws, customDomains }: Adapter.Connection<WebSocket>, onClose) {
    ws.on('message', (msg: string) => {
      try {
        const msgObj = JSON.parse(msg);
        this.sendMessage(msgObj);
      } catch (e) {
        debug('parse devtools ws message error!');
      }
    });
    ws.on('close', () => {
      this.emit(ClientEvent.Close);
      onClose();
    });

    this.onCloseList.push(onClose);
    this.connectionList.push({ ws, customDomains });

    this.sendToDevtools = (msg: Adapter.CDP.Res) => {
      // TODO msg 可能是 Tunnel.Res 类型，后续统一协议后修改
      const domain = msg.method?.split('.')[0] || (msg as any).module;
      debug('%j', msg);
      this.connectionList.forEach(({ ws, customDomains }) => {
        if (isCdpDomains(domain) || customDomains.indexOf(domain) !== -1) {
          ws.send(JSON.stringify(msg));
        }
      });
    };

    this.close = () => {
      this.connectionList.forEach(({ ws }) => {
        ws.close();
      });
      this.onCloseList.forEach((cb) => cb());
    };
  }

  // bindConnection(connectionList: Adapter.ConnectionList<WebSocket>, removeChannel) {
  //   connectionList.forEach(({ ws }) => {});
  // }

  handleHeapData(msg) {}
}
