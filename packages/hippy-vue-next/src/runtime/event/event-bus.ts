/**
 * Hippy事件总线，因Vue3中原先的on off emit等移除，故使用此方法来实现事件总线
 */
import { TinyEmitter } from 'tiny-emitter';

const emitter = new TinyEmitter();

/**
 * 使用emitter作为事件总线
 *
 * @public
 */
export const EventBus: {
  $on: (...arg: any) => void;
  $off: (...arg: any) => void;
  $once: (...arg: any) => void;
  $emit: (...arg: any) => void;
} = {
  $on: (...args: any[]) => emitter.on(args[0], args[1], args[2]),
  $off: (...args: any[]) => emitter.off(args[0], args[1]),
  $once: (...args: any[]) => emitter.once(args[0], args[1], args[2]),
  $emit: (...args: any[]) => emitter.emit(args[0], ...args.slice(1)),
};
