/**
 * 注意：请勿引用此文件接口🚫，需调用 dev-server/adapter 下的 messageChannel 做消息收发！！！
 */

import { Tunnel } from '../@types/tunnel';
import { EventEmitter } from 'events';

export const listeners = new Map();
let isTunnelReady = true;
let msgQueue: Tunnel.Req[] = [];
const msgIdMethodMap: Map<number, string> = new Map();

export function createTunnelClient() {
  isTunnelReady = true;
  if (msgQueue.length) {
    msgQueue.forEach(sendMessage);
    msgQueue = [];
  }
}

export const emitter = new EventEmitter();
export function onMessage(msg) {
  try {
    const msgObject = JSON.parse(msg);
    const method = msgIdMethodMap.get(msgObject.id);
    msgObject.method = method;
    msgIdMethodMap.delete(msgObject.id);

    console.warn('on tunnel message', msgObject.method, listeners.has(msgObject.method));
    if (listeners.has(msgObject.method)) {
      listeners.get(msgObject.method).forEach((cb) => {
        cb(msgObject);
      });
    } else {
      emitter.emit('message', msgObject);
    }
  } catch (e) {
    console.error(`parse tunnel response json failed. ${e} \n${JSON.stringify(msg)}`);
  }
}

export function sendMessage(msg: any): void {
  if (!isTunnelReady) {
    msgQueue.push(msg);
    console.info('tunnel is not ready, push msg to queue.');
    return;
  }
  msgIdMethodMap.set(msg.id, msg.method);
  console.info('sendMessage', msg);
  global.addon.sendMsg(JSON.stringify(msg));
}

export function registerModuleCallback(module: string, callback: any): void {
  console.info(`registerModuleCallback for module ${module}`);
  if (!listeners.has(module)) listeners.set(module, []);
  listeners.get(module).push(callback);
}
