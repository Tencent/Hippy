import EventEmitterRevoker from './emitter-revoker';
import HippyEventListener from './listener';


function getNameForEvent(event: string) {
  if (typeof event !== 'string') {
    throw new TypeError('Invalid arguments');
  }
  return `eventEmitter_${event}`;
}

class HippyEventEmitter {
  // 静态属性（类属性），维护全部的Listener
  static AllHippyEventListeners = new Map()

  // 这个是维护实例自己的hippyEventListeners
  hippyEventListeners: Map<string, HippyEventListener> // string为eventName

  constructor(sharedListeners?: Map<string, HippyEventListener>) {
    if (sharedListeners && typeof sharedListeners === 'object') {
      this.hippyEventListeners = sharedListeners;
    } else {
      this.hippyEventListeners = new Map();
    }
  }

  // 共享已注册的事件
  public sharedListeners() {
    // TODO: Map结构是否需要转换为object？
    return this.hippyEventListeners;
  }

  // 为某个事件添加回调函数。
  public addListener(event: string, callback: (data?: any) => void, context?: any) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      throw new TypeError('Invalid arguments');
    }
    const eventName = getNameForEvent(event);
    let registedListener = this.hippyEventListeners.get(eventName);
    // 判断实例是否注册了该事件
    if (!registedListener) {
      // 判断AllHippyEventListeners中是否注册了该事件
      registedListener = HippyEventEmitter.AllHippyEventListeners.get(eventName);
      if (!registedListener) {
      // 全局和实例维护的listener都没有的话就创建一个。
        registedListener = new HippyEventListener(event);
        this.hippyEventListeners.set(eventName, registedListener);
      }
    }

    const listenerId = registedListener.addCallback(callback, context);
    if (typeof listenerId !== 'number') {
      throw new Error('Fail to addCallback');
    }
    return new EventEmitterRevoker(listenerId, registedListener);
  }

  // 清除某个事件所有的回调函数
  removeAllListeners(event: string) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments');
    }

    const eventName = getNameForEvent(event);
    const registedListener = this.hippyEventListeners.get(eventName);
    if (registedListener) {
      registedListener.unregister();
      this.hippyEventListeners.delete(eventName);
      HippyEventEmitter.AllHippyEventListeners.delete(eventName);
    }
  }

  // 触发事件（全局触发，不单单可以触发某个实例emitter的listener）
  // eslint-disable-next-line class-methods-use-this
  emit(event: string, param: any) {
    if (typeof event !== 'string') {
      return false;
    }
    const registedListener = HippyEventEmitter.AllHippyEventListeners.get(getNameForEvent(event));
    if (!registedListener) {
      return false;
    }
    registedListener.evenInstance.emit(event, param);
    return true;
  }

  // 查看某个事件有多少个回调函数
  listenerSize(event: string) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments');
    }
    const registedListener = this.hippyEventListeners.get(getNameForEvent(event));
    if (registedListener) {
      return registedListener.getSize();
    }
    return 0;
  }
}

(HippyEventEmitter as any).emit = HippyEventEmitter.prototype.emit;

export default HippyEventEmitter;
