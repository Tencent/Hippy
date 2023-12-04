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

import { trace, getApp, warn } from '../util';
import { getNodeById } from '../util/node';
import { DOMEventPhase } from '../util/event';
import { NeedToTyped } from '../types/native';
import { LayoutEvent } from './layout-event';

const LOG_TYPE = ['%c[event]%c', 'color: green', 'color: auto'];

function isTouchEvent(eventName: string) {
  return ['onTouchDown', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'].indexOf(eventName) >= 0;
}

/**
 * convert events
 */
function convertEvent(eventName: string, targetEvent: NeedToTyped, params: NeedToTyped) {
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
  receiveNativeEvent(nativeEvent: NeedToTyped) {
    trace(...LOG_TYPE, 'receiveNativeEvent', nativeEvent);
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
  receiveComponentEvent(nativeEvent: NeedToTyped, domEvent: NeedToTyped) {
    trace(...LOG_TYPE, 'receiveComponentEvent', nativeEvent);
    if (!nativeEvent || !domEvent) {
      warn(...LOG_TYPE, 'receiveComponentEvent', 'nativeEvent or domEvent not exist');
      return;
    }
    const { id, currentId, nativeName, originalName, params = {}, eventPhase } = nativeEvent;
    const currentTargetNode = getNodeById(currentId);
    const targetNode = getNodeById(id);
    if (!currentTargetNode || !targetNode) {
      warn(...LOG_TYPE, 'receiveComponentEvent', 'currentTargetNode or targetNode not exist');
      return;
    }
    try {
      if ([DOMEventPhase.AT_TARGET, DOMEventPhase.BUBBLING_PHASE].indexOf(eventPhase) > -1) {
        const targetEvent = new LayoutEvent(originalName);
        Object.assign(targetEvent, { eventPhase, nativeParams: params || {} });
        if (nativeName === 'onLayout') {
          const { layout: { x, y, height, width } } = params;
          targetEvent.top = y;
          targetEvent.left = x;
          targetEvent.bottom = y + height;
          targetEvent.right = x + width;
          targetEvent.width = width;
          targetEvent.height = height;
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
