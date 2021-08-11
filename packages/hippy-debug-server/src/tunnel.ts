/**
 * 注意：请勿引用此文件接口🚫，需调用 dev-server/adapter 下的 messageChannel 做消息收发！！！
 */
import { EventEmitter } from 'events';
import { ClientEvent } from './@types/enum';
import { DomainRegister } from './utils/cdp';

export class Tunnel extends DomainRegister {
  public static tunnelMessageEmitter = new EventEmitter();
  private static isTunnelReady = true;
  private static msgQueue: Adapter.CDP.Req[] = [];
  private static msgIdMethodMap: Map<number, string> = new Map();
  private requestPromiseMap: Adapter.RequestPromiseMap = new Map();

  public createTunnelClient() {
    Tunnel.isTunnelReady = true;
    if (Tunnel.msgQueue.length) {
      Tunnel.msgQueue.forEach(this.sendMessage);
      Tunnel.msgQueue = [];
    }
  }

  public onMessage(msg: string) {
    try {
      const msgObject: Adapter.CDP.Res = JSON.parse(msg);
      if ('id' in msgObject) {
        const method = Tunnel.msgIdMethodMap.get(msgObject.id);
        msgObject.method = method;
        Tunnel.msgIdMethodMap.delete(msgObject.id);

        const requestPromise = this.requestPromiseMap.get(msgObject.id);
        if (requestPromise) requestPromise.resolve(msgObject);
      }
      this.triggerListerner(msgObject);
      Tunnel.tunnelMessageEmitter.emit(ClientEvent.Message, msgObject);
    } catch (e) {
      console.error(`parse tunnel response json failed. ${e} \n${JSON.stringify(msg)}`);
    }
  }

  public sendMessage(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    return new Promise((resolve, reject) => {
      if (!Tunnel.isTunnelReady) {
        Tunnel.msgQueue.push(msg);
        console.info('tunnel is not ready, push msg to queue.');
        return;
      }
      Tunnel.msgIdMethodMap.set(msg.id, msg.method);
      console.info('sendMessage', msg);
      global.addon.sendMsg(JSON.stringify(msg));

      if (msg.id) {
        this.requestPromiseMap.set(msg.id, { resolve, reject });
      }
    });
  }
}

export const tunnel = new Tunnel();
