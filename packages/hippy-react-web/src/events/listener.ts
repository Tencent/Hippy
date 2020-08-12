import ee, { Emitter } from 'event-emitter';
import allOff from 'event-emitter/all-off';
import HippyEventEmitter from './emitter';

interface HippyEventListener {
  eventName: string;
  evenInstance: Emitter;
  nextIdForHandler: number;
  handlerContainer: Map<string, {
    id:number;
    eventHandler: ee.EventListener;
    context: any;
  }>
}

function getKeyforHandler(id: number) {
  if (typeof id !== 'number') {
    throw new TypeError('Invalid arguments');
  }
  return `handler_${id}`;
}

class HippyEventListener  implements HippyEventListener {
  constructor(event: string) {
    this.eventName = event;
    this.evenInstance = ee({});
    this.nextIdForHandler = 0;
    this.handlerContainer = new Map();
    // eslint-disable-next-line max-len
    // Bind the listener instance to the class attribute of the emitter to facilitate the synchronization of the listener instance created by two ways
    // the frist way is to use new HippyEventListener
    // the second way is to directly call of the emitter's addListener method.
    HippyEventEmitter.AllHippyEventListeners.set(`eventEmitter_${event}`, this);
  }

  // add callback function to Listener
  public addCallback(handleFunc: Function, callContext?: any) {
    if (typeof handleFunc !== 'function') {
      throw new TypeError('Invalid arguments');
    }
    const currId = this.nextIdForHandler;
    this.nextIdForHandler += 1;
    const callback = handleFunc.bind(callContext);
    this.handlerContainer.set(getKeyforHandler(currId), {
      id: currId,
      eventHandler: callback,
      context: callContext,
    });
    this.evenInstance.on(this.eventName, callback);
    return currId;
  }

  // delete callback function from listener
  public removeCallback(callbackId: number) {
    if (typeof callbackId !== 'number') {
      throw new TypeError('Invalid arguments');
    }
    const handlerKey = getKeyforHandler(callbackId);
    const handler = this.handlerContainer.get(handlerKey);
    if (handler) {
      const { eventHandler } = handler;
      this.evenInstance.off(this.eventName, eventHandler);
      this.handlerContainer.delete(handlerKey);
    }
  }

  // clear all callback function from listener
  public unregister() {
    allOff(this.evenInstance);
    this.nextIdForHandler = 0;
    this.handlerContainer.clear();
  }

  // get the number of the callback function
  public getSize() {
    return this.handlerContainer.size;
  }
}

export default HippyEventListener;
