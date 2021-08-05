import { EventEmitter } from 'events';
/**
 * 注意：请勿引用此文件接口🚫，需调用 dev-server/adapter 下的 messageChannel 做消息收发！！！
 */
import { Tunnel } from '../@types/tunnel';

export const listeners = new Map();
let isTunnelReady = true;
let msgQueue: Tunnel.Req[] = [];
const msgModuleIdMap: Map<string, string> = new Map();

export function createTunnelClient() {
  isTunnelReady = true;
  if (msgQueue.length) {
    msgQueue.forEach(sendMessage);
    msgQueue = [];
  }
}

export const tunnelMessageEmitter = new EventEmitter();
export function onMessage(msg) {
  try {
    const moduleObject: any = JSON.parse(msg).modules[0];
    const message: string = moduleObject.content;
    const id = msgModuleIdMap.get(moduleObject.module);
    (moduleObject as any).id = id;
    msgModuleIdMap.delete(moduleObject.module);

    console.warn('on tunnel message', moduleObject.module, listeners.has(moduleObject.module));
    if (listeners.has(moduleObject.module)) {
      listeners.get(moduleObject.module).forEach((cb) => {
        cb(message);
      });
    } else {
      tunnelMessageEmitter.emit('message', moduleObject);
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
  msgModuleIdMap.set(msg.module, (msg as any).id);
  console.info('sendMessage', msg);
  global.addon.sendMsg(
    JSON.stringify({
      version: '1.0',
      modules: [msg],
    }),
  );
}

export function registerModuleCallback(module: string, callback: any): void {
  console.info(`registerModuleCallback for module ${module}`);
  if (!listeners.has(module)) listeners.set(module, []);
  listeners.get(module).push(callback);
}
