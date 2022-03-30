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

import { canUseDOM } from '../../utils/execution-environment';
import {
  getResponderPaths, setResponderId, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE, TOUCH_START, SCROLL_EVENT,
  isScrollEvent,
} from './utils';
import { TouchEvent } from './types';
import { ResponderConfig } from './index';

interface ResponderEvent {
  addNode: (id: number, node: HTMLElement, config: ResponderConfig) => void;
  removeNode: (id: number) => void;
  attachListerers: () => void;
}

const reponderEventKey = '__reactResponderSystemActive';
const responderListerersMap = new Map<number, ResponderConfig>();

const touchEvent = [TOUCH_START, TOUCH_MOVE, TOUCH_END, TOUCH_CANCEL];
const documentEventsBubblePhase = [...touchEvent];
const documentEventsCapturePhase = [SCROLL_EVENT];

let touchEventStore: TouchEvent = {
  pageX: 0,
  pageY: 0,
  target: null,
  currentTarget: null,
  force: 0,
  identifier: 0,
  stopPropagation: () => {},
};

const handleTouchEvent = (touchEvent: TouchEvent, config: ResponderConfig, eventType: string) => {
  const { onTouchDown, onTouchMove, onTouchEnd, onTouchCancel } = config;
  const touchEventHandlerMap = {
    [TOUCH_START]: () => {
      if (onTouchDown) {
        touchEventStore = { ...touchEvent };
        onTouchDown(touchEvent);
      }
    },
    [TOUCH_MOVE]: () => {
      if (onTouchMove) {
        touchEventStore = { ...touchEvent };
        onTouchMove(touchEvent);
      }
    },
    [TOUCH_END]: () => {
      if (onTouchEnd) {
        onTouchEnd(touchEvent);
      }
    },
    [TOUCH_CANCEL]: () => {
      if (onTouchCancel) {
        onTouchCancel(touchEventStore);
      }
    },
  };
  if (touchEventHandlerMap[eventType]) {
    touchEventHandlerMap[eventType]();
  }
};

const eventListerner = (domEvent: any) => {
  const eventType = domEvent?.type;
  const eventPath = getResponderPaths(domEvent);
  const [responderId] = eventPath.idPath;
  if (touchEvent.includes(eventType)) {
    const [touches] = domEvent.changedTouches;
    if (responderListerersMap.has(responderId)) {
      const touchEvent: TouchEvent = {
        pageX: touches.pageX,
        pageY: touches.pageY,
        target: touches.target,
        currentTarget: touches.target,
        force: touches.force,
        identifier: touches.identifier,
        stopPropagation: () => {},
      };
      const config = responderListerersMap.get(responderId);
      if (config) {
        handleTouchEvent(touchEvent, config, eventType);
      }
    }
  }
  if (isScrollEvent(eventType)) {
    const config = responderListerersMap.get(responderId);
    if (config?.onScroll) {
      config.onScroll(domEvent);
    }
  }
};


const responderEvent: ResponderEvent = {
  addNode(id: number, node: HTMLElement, config: ResponderConfig) {
    setResponderId(node, id);
    responderListerersMap.set(id, config);
  },
  removeNode(id: number) {
    if (responderListerersMap.has(id)) {
      responderListerersMap.delete(id);
    }
  },
  attachListerers() {
    if (canUseDOM && !window[reponderEventKey]) {
      window[reponderEventKey] = true;
      documentEventsBubblePhase.forEach((eventType) => {
        document.addEventListener(eventType, eventListerner);
      });
      documentEventsCapturePhase.forEach((eventType) => {
        document.addEventListener(eventType, eventListerner, true);
      });
    }
  },
};

export default responderEvent;

