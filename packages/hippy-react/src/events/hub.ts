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
    Object.values(this.handlerContainer).forEach((wrapperInstance) => {
      if (wrapperInstance && wrapperInstance.eventHandler) {
        if (wrapperInstance.context) {
          wrapperInstance.eventHandler.call(wrapperInstance.context, eventParams);
        } else {
          wrapperInstance.eventHandler(eventParams);
        }
      }
    });
  }


  public getEventListeners() {
    return Object
      .values(this.handlerContainer)
      .filter(x => x)
      .map(wrapperInstance => wrapperInstance);
  }

  public getHandlerSize() {
    return Object.keys(this.handlerContainer).length;
  }
}

export default HippyEventHub;
