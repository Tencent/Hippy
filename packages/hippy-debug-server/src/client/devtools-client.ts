import { Tunnel } from '../@types/tunnel';
import { EventEmitter } from 'events';
import { sendMessage, registerModuleCallback } from '../message-channel/tunnel';
import { ClientEvent } from '../@types/enum';
// import { CDP } from '../@types/cdp';

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
  sendToDevtools: (msg: string) => void;
  // app端断连，devtools ws主动断连。socket-bridge中赋值
  close: () => void;

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
    if('module' in msg) {
      if (msg.module !== 'jsDebugger') {
        sendMessage(msg as Tunnel.Req);
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
    if(this.sendToDevtools) {
      const msgStr = JSON.stringify(msg);
      this.sendToDevtools(msgStr);
    }

    if('error' in msg) return ;

    let method;
    if('id' in msg) method = this.msgIdMethodMap.get(msg.id);
    else method = msg.method;

    if(!method) return;
    const domain = method.split('.')[0];
    const listeners = (this.domainListeners.get(domain) || [])
      .concat(this.domainListeners.get(method) || [])
    listeners.forEach(listener => {
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
}
