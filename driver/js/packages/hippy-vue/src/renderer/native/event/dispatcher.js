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

import { trace, getApp, warn } from '../../../util';
import { getNodeById, DOMEventPhase } from '../../../util/node';
import { Event } from './event';

const componentName = ['%c[event]%c', 'color: green', 'color: auto'];

function getVueEventName(eventName, targetNode) {
  const { eventNamesMap } = targetNode.meta.component;
  // event names map for internal view, i.e. div,ul,li,etc.
  if (eventNamesMap && eventNamesMap[eventName]) {
    return eventNamesMap[eventName];
  }
  if (eventName.indexOf('on') !== 0) {
    return eventName;
  }
  // remove "on" string and lowercase the first letter
  const str = eventName.slice(2, eventName.length); // Assume 'on' prefix length = 2.
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function isTouchEvent(eventName) {
  return ['onTouchDown', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'].indexOf(eventName) >= 0;
}

/**
 * convert events
 */
function convertEvent(eventName, targetEvent, params) {
  if (isTouchEvent(eventName)) {
    Object.assign(targetEvent, {
      touches: {
        0: {
          clientX: params.page_x,
          clientY: params.page_y,
        },
        length: 1,
      },
    });
  }
  return targetEvent;
}
const EventDispatcher = {
  /**
   * Redirect native events to Vue directly.
   */
  receiveNativeEvent(nativeEvent) {
    trace(...componentName, 'receiveNativeEvent', nativeEvent);
    if (!nativeEvent || !Array.isArray(nativeEvent) || nativeEvent.length < 2) {
      return;
    }
    const [eventName, eventParams] = nativeEvent;
    const app = getApp();
    if (app) {
      app.$emit(eventName, eventParams);
    }
  },

  /**
   * Receive native interactive events.
   */
  receiveComponentEvent(nativeEvent, domEvent) {
    trace(...componentName, 'receiveComponentEvent', nativeEvent);
    if (!nativeEvent || !domEvent) {
      warn(...componentName, 'receiveComponentEvent', 'nativeEvent or domEvent not exist');
      return;
    }
    const { id, currentId, nativeName, originalName, params, eventPhase } = nativeEvent;
    const currentTargetNode = getNodeById(currentId);
    const targetNode = getNodeById(id);
    if (!currentTargetNode || !targetNode) {
      warn(...componentName, 'receiveComponentEvent', 'currentTargetNode or targetNode not exist');
      return;
    }
    try {
      if ([DOMEventPhase.AT_TARGET, DOMEventPhase.BUBBLING_PHASE].indexOf(eventPhase) > -1) {
        const targetEvent = new Event(originalName);
        Object.assign(targetEvent, { eventPhase });
        if (nativeName === 'onLayout') {
          const { layout } = params;
          targetEvent.top = layout.y;
          targetEvent.left = layout.x;
          targetEvent.bottom = layout.y + layout.height;
          targetEvent.right = layout.x + layout.width;
          targetEvent.width = layout.width;
          targetEvent.height = layout.height;
        } else {
          const { processEventData } = currentTargetNode._meta.component;
          if (processEventData) {
            processEventData(targetEvent, nativeName, params);
          }
        }
        currentTargetNode.dispatchEvent(
          convertEvent(nativeName, targetEvent, params),
          targetNode,
          domEvent,
        );
      }
    } catch (err) {
      console.error('receiveComponentEvent error', err);
    }
  },
};

if (global.__GLOBAL__) {
  global.__GLOBAL__.jsModuleList.EventDispatcher = EventDispatcher;
}

export {
  EventDispatcher,
};
