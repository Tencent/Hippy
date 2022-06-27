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

import { Fiber } from '@hippy/react-reconciler';
import {
  getFiberNodeFromId,
  getElementFromFiber,
  isNativeGesture,
  DOMEventPhase,
} from '../utils/node';
import { trace, warn, isGlobalBubble, isCaptureEvent } from '../utils';
import HippyEventHub from './hub';
import Event from './event';

type EventParam = string[] | number[];

interface NativeEvent {
  id: number;
  currentId: number;
  nativeName: string;
  originalName: string;
  eventPhase: HippyTypes.EventPhase,
  params?: any
}

const eventHubs = new Map();
const componentName = ['%c[event]%c', 'color: green', 'color: auto'];

function isNodePropFunction(prop: string, nextNodeItem: Fiber) {
  return !!(nextNodeItem.memoizedProps && typeof nextNodeItem.memoizedProps[prop] === 'function');
}

/**
 * dispatchGestureEvent - dispatch event
 * @param {string} eventName
 * @param {NativeEvent} nativeEvent
 * @param {Fiber} currentItem
 * @param {Fiber} targetItem
 * @param {any} params
 * @param {HippyTypes.DOMEvent} domEvent
 */
function dispatchGestureEvent(
  eventName: string,
  nativeEvent: NativeEvent,
  currentItem: Fiber,
  targetItem: Fiber,
  params: any,
  domEvent: HippyTypes.DOMEvent,
) {
  try {
    let isStopBubble: any = false;
    const targetNode = getElementFromFiber(targetItem);
    const currentTargetNode = getElementFromFiber(currentItem);
    const { eventPhase } = domEvent;
    // handle target & capture phase event
    if (isNodePropFunction(eventName, currentItem)
      && isCaptureEvent(eventName)
      && [DOMEventPhase.AT_TARGET, DOMEventPhase.CAPTURING_PHASE].indexOf(eventPhase) > -1) {
      const syntheticEvent = new Event(eventName, currentTargetNode, targetNode);
      Object.assign(syntheticEvent, { eventPhase }, params);
      currentItem.memoizedProps[eventName](syntheticEvent);
      if (!syntheticEvent.bubbles && domEvent) {
        domEvent.stopPropagation();
      }
    }
    if (isNodePropFunction(eventName, currentItem)
      && !isCaptureEvent(eventName)
      && [DOMEventPhase.AT_TARGET, DOMEventPhase.BUBBLING_PHASE].indexOf(eventPhase) > -1) {
      // handle target & bubbling phase event
      const syntheticEvent = new Event(eventName, currentTargetNode, targetNode);
      Object.assign(syntheticEvent, { eventPhase }, params);
      isStopBubble = currentItem.memoizedProps[eventName](syntheticEvent);
      // If callback have no return, use global bubble config to set isStopBubble.
      if (typeof isStopBubble !== 'boolean') {
        isStopBubble = !isGlobalBubble();
      }
      // event bubbles flag has higher priority
      if (!syntheticEvent.bubbles) {
        isStopBubble = true;
      }
      if (isStopBubble && domEvent) {
        domEvent.stopPropagation();
      }
    }
  } catch (err) {
    (console as any).reportUncaughtException(err);
  }
}

/**
 * dispatchUIEvent - dispatch ui event
 * @param {string} eventName
 * @param {NativeEvent} nativeEvent
 * @param {Fiber} currentItem
 * @param {Fiber} targetItem
 * @param {any} params
 * @param {HippyTypes.DOMEvent} domEvent
 */
function dispatchUIEvent(
  eventName: string,
  nativeEvent: NativeEvent,
  currentItem: Fiber,
  targetItem: Fiber,
  params: any,
  domEvent: HippyTypes.DOMEvent,
) {
  let isStopBubble: any = false;
  const targetNode = getElementFromFiber(targetItem);
  const currentTargetNode = getElementFromFiber(currentItem);
  try {
    const { eventPhase } = domEvent;
    // handle target & bubbling phase event
    if (isNodePropFunction(eventName, currentItem)
      && !isCaptureEvent(eventName)
      && [DOMEventPhase.AT_TARGET, DOMEventPhase.BUBBLING_PHASE].indexOf(eventPhase) > -1) {
      const syntheticEvent = new Event(eventName, currentTargetNode, targetNode);
      Object.assign(syntheticEvent, { eventPhase }, params);
      currentItem.memoizedProps[eventName](syntheticEvent);
      isStopBubble = !isGlobalBubble();
      // event bubbles flag has higher priority
      if (!syntheticEvent.bubbles) {
        isStopBubble = true;
      }
      if (isStopBubble && domEvent) {
        domEvent.stopPropagation();
      }
    }
  } catch (err) {
    (console as any).reportUncaughtException(err);
  }
}

function receiveComponentEvent(nativeEvent: NativeEvent, domEvent: HippyTypes.DOMEvent) {
  trace(...componentName, 'receiveComponentEvent', nativeEvent);
  if (!nativeEvent || !domEvent) {
    warn(...componentName, 'receiveComponentEvent', 'nativeEvent or domEvent not exist');
    return;
  }
  const { id, currentId, nativeName, originalName, params } = nativeEvent;
  const currentTargetNode = getFiberNodeFromId(currentId);
  const targetNode = getFiberNodeFromId(id);
  if (!currentTargetNode || !targetNode) {
    warn(...componentName, 'receiveComponentEvent', 'currentTargetNode or targetNode not exist');
    return;
  }
  if (isNativeGesture(nativeName)) {
    dispatchGestureEvent(originalName, nativeEvent, currentTargetNode, targetNode, params, domEvent);
  } else {
    dispatchUIEvent(originalName, nativeEvent, currentTargetNode, targetNode, params, domEvent);
  }
}

function getHippyEventHub(eventName: any) {
  if (typeof eventName !== 'string') {
    throw new TypeError(`Invalid eventName for getHippyEventHub: ${eventName}`);
  }
  return eventHubs.get(eventName) || null;
}

function registerNativeEventHub(eventName: any) {
  trace(...componentName, 'registerNativeEventHub', eventName);
  if (typeof eventName !== 'string') {
    throw new TypeError(`Invalid eventName for registerNativeEventHub: ${eventName}`);
  }
  let targetEventHub = eventHubs.get(eventName);
  if (!targetEventHub) {
    targetEventHub = new HippyEventHub(eventName);
    eventHubs.set(eventName, targetEventHub);
  }
  return targetEventHub;
}

function unregisterNativeEventHub(eventName: any) {
  if (typeof eventName !== 'string') {
    throw new TypeError(`Invalid eventName for unregisterNativeEventHub: ${eventName}`);
  }
  if (eventHubs.has(eventName)) {
    eventHubs.delete(eventName);
  }
}

function receiveNativeEvent(nativeEvent: EventParam) {
  trace(...componentName, 'receiveNativeEvent', nativeEvent);
  if (!nativeEvent || !Array.isArray(nativeEvent) || nativeEvent.length < 2) {
    throw new TypeError(`Invalid params for receiveNativeEvent: ${JSON.stringify(nativeEvent)}`);
  }
  const [eventName, eventParams] = nativeEvent;
  if (typeof eventName !== 'string') {
    throw new TypeError('Invalid arguments for nativeEvent eventName');
  }
  const currEventHub = getHippyEventHub(eventName);
  if (!currEventHub) {
    return;
  }
  currEventHub.notifyEvent(eventParams);
}

const EventDispatcher = {
  registerNativeEventHub,
  getHippyEventHub,
  unregisterNativeEventHub,
  receiveNativeEvent,
  receiveComponentEvent,
};

if (global.__GLOBAL__) {
  global.__GLOBAL__.jsModuleList.EventDispatcher = EventDispatcher;
}

export default EventDispatcher;
