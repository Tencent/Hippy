import EventEmitterRevoker from './emitter-revoker';
import HippyEventListener from './listener';
import EventDispatcher from './dispatcher';

interface EventListeners {
  [eventName: string]: HippyEventListener;
}

function getNameForEvent(event: string | undefined) {
  if (typeof event !== 'string') {
    throw new TypeError('Invalid arguments');
  }
  return `eventEmitter_${event}`;
}

class HippyEventEmitter {
  hippyEventListeners: EventListeners;

  constructor(sharedListeners?: EventListeners) {
    if (sharedListeners && typeof sharedListeners === 'object') {
      this.hippyEventListeners = sharedListeners;
    } else {
      this.hippyEventListeners = {};
    }
  }

  public sharedListeners() {
    return this.hippyEventListeners;
  }

  public addListener(event: string, callback: (data?: any) => void, context?: any) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      throw new TypeError('Invalid arguments');
    }

    let registedListener = this.hippyEventListeners[getNameForEvent(event)];
    if (!registedListener) {
      registedListener = new HippyEventListener(event);
      this.hippyEventListeners[getNameForEvent(event)] = registedListener;
    }

    const listenerId = registedListener.addCallback(callback, context);
    if (typeof listenerId !== 'number') {
      throw new Error('Fail to addCallback');
    }

    return new EventEmitterRevoker(listenerId, registedListener);
  }

  removeAllListeners(event: string) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments');
    }

    const registedListener = this.hippyEventListeners[getNameForEvent(event)];
    if (registedListener) {
      registedListener.unregister();
      delete this.hippyEventListeners[getNameForEvent(event)];
    }
  }

  /* eslint-disable-next-line class-methods-use-this */
  emit(event: string, param: any) {
    if (typeof event !== 'string') {
      return false;
    }
    const eventHub = EventDispatcher.getHippyEventHub(event);
    if (!eventHub) {
      return false;
    }
    eventHub.notifyEvent(param);
    return true;
  }

  listenerSize(event: string) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments');
    }

    const registedListener = this.hippyEventListeners[getNameForEvent(event)];
    if (registedListener) {
      return registedListener.getSize();
    }
    return 0;
  }
}

(HippyEventEmitter as any).emit = HippyEventEmitter.prototype.emit;

export default HippyEventEmitter;
