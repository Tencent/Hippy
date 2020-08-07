import EventEmitterRevoker from './emitter-revoker';
import HippyEventListener from './listener';


function getNameForEvent(event: string) {
  if (typeof event !== 'string') {
    throw new TypeError('Invalid arguments');
  }
  return `eventEmitter_${event}`;
}

class HippyEventEmitter {
  // static property which manage all listeners Instance
  static AllHippyEventListeners = new Map()

  // Instance property manage the listeners which belongs to this Instance
  hippyEventListeners: Map<string, HippyEventListener>

  constructor(sharedListeners?: Map<string, HippyEventListener>) {
    if (sharedListeners && typeof sharedListeners === 'object') {
      this.hippyEventListeners = sharedListeners;
    } else {
      this.hippyEventListeners = new Map();
    }
  }

  // share all the Listeners which belongs to this instance
  public sharedListeners() {
    return this.hippyEventListeners;
  }

  // add callback function to a Listener
  public addListener(event: string, callback: (data?: any) => void, context?: any) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      throw new TypeError('Invalid arguments');
    }
    const eventName = getNameForEvent(event);
    let registedListener = this.hippyEventListeners.get(eventName);
    // Determine whether the instance is registered
    if (!registedListener) {
      // Determine whether AllHippyEventListeners had registered the event
      registedListener = HippyEventEmitter.AllHippyEventListeners.get(eventName);
      if (!registedListener) {
      // Create one if none
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

  // clear all callback function for one Listener
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

  // see the callback function number
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
