/* eslint-disable no-underscore-dangle */

interface HippyEventHub {
  eventName: string;
  nextIdForHandler: number;
  handlerContainer: {
    [key: string]: {
      id: number;
      eventHandler: Function;
      context: any;
    }
  }
}

class HippyEventHub implements HippyEventHub {
  constructor(eventName: string) {
    this.handlerContainer = {};
    this.nextIdForHandler = 0;
    this.eventName = eventName;
  }

  public addEventHandler(handler: Function, callContext: any) {
    if (!handler) {
      throw new TypeError('Invalid arguments');
    }

    const currId = this.nextIdForHandler;
    this.nextIdForHandler += 1;
    const eventHandlerWrapper = {
      id: currId,
      eventHandler: handler,
      context: callContext,
    };

    const idAttrName = `eventHandler_${currId}`;
    this.handlerContainer[idAttrName] = eventHandlerWrapper;
    return currId;
  }

  public removeEventHandler(handlerId: number) {
    if (typeof handlerId !== 'number') {
      throw new TypeError('Invalid arguments');
    }

    const idAttrName = `eventHandler_${handlerId}`;
    if (this.handlerContainer[idAttrName]) {
      delete this.handlerContainer[idAttrName];
    }
  }

  public notifyEvent(eventParams: any) {
    Object.keys(this.handlerContainer).forEach((key) => {
      const instance = this.handlerContainer[key];
      if (!instance || !instance.eventHandler) {
        return;
      }
      if (instance.context) {
        instance.eventHandler.call(instance.context, eventParams);
      } else {
        instance.eventHandler(eventParams);
      }
    });
  }


  public getEventListeners() {
    return Object.keys(this.handlerContainer)
      .filter(key => this.handlerContainer[key])
      .map(key => this.handlerContainer[key]);
  }

  public getHandlerSize() {
    return Object.keys(this.handlerContainer).length;
  }
}

export default HippyEventHub;
