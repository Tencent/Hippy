/**
 * 注意：请勿引用此文件接口🚫，需调用 dev-server/adapter 下的 messageChannel 做消息收发！！！
 */

import { Tunnel } from '../@types/tunnel';
import { EventEmitter } from 'events';

export const listeners = new Map();
let isTunnelReady = true;
let msgQueue: Tunnel.Req[] = [];

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
    console.warn('on tunnel message', msgObject.method, listeners.has(msgObject.method));
    if (listeners.has(msgObject.method)) {
      listeners.get(msgObject.method).forEach((cb) => {
        cb(msg);
      });
    } else {
      emitter.emit('message', msg);
    }
  } catch (e) {
    console.error(`parse tunnel response json failed. ${e} \n${JSON.stringify(msg)}`);
  }
}

export function sendMessage(msg: Tunnel.Req): void {
  if (!isTunnelReady) {
    msgQueue.push(msg);
    console.info('tunnel is not ready, push msg to queue.');
    return;
  }
  console.info('sendMessage', msg);
  global.addon.sendMsg(JSON.stringify(msg));
}

export function registerModuleCallback(module: string, callback: any): void {
  console.info(`registerModuleCallback for module ${module}`);
  if (!listeners.has(module)) listeners.set(module, []);
  listeners.get(module).push(callback);
}
