/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-underscore-dangle */

interface HippyEventHub {
  eventName: string;
  nextIdForHandler: number;
  handlerContainer: {
    [key: string]: {
      id: number;
      eventHandler: Function;
      context: any;
    } | undefined
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

  public removeEventHandler(handlerId: number | undefined) {
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
