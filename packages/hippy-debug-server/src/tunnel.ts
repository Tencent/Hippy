/**
 * 注意：请勿引用此文件接口🚫，需调用 dev-server/adapter 下的 messageChannel 做消息收发！！！
 */
import createDebug from 'debug';
import { EventEmitter } from 'events';
import { ClientEvent } from './@types/enum';
import { DomainRegister } from './utils/cdp';

const debug = createDebug('tunnel');

export class Tunnel extends DomainRegister {
  public static tunnelMessageEmitter = new EventEmitter();
  private static isTunnelReady = true;
  private static msgQueue: Adapter.CDP.Req[] = [];
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
        const requestPromise = this.requestPromiseMap.get(msgObject.id);
        if (requestPromise) requestPromise.resolve(msgObject);
      }
      this.triggerListerner(msgObject);
      Tunnel.tunnelMessageEmitter.emit(ClientEvent.Message, msgObject);
    } catch (e) {
      debug(`parse tunnel response json failed. error: %j, \n msg: %j`, e, msg);
    }
  }

  public sendMessage(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    return new Promise((resolve, reject) => {
      if (!Tunnel.isTunnelReady) {
        Tunnel.msgQueue.push(msg);
        debug('tunnel is not ready, push msg to queue.');
        return;
      }
      debug('sendMessage: %j', msg);
      global.addon.sendMsg(JSON.stringify(msg));

      if (msg.id) {
        this.requestPromiseMap.set(msg.id, { resolve, reject });
      }
    });
  }
}

export const tunnel = new Tunnel();
