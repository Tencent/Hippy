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
import { getFiberNodeFromId, getElementFromFiber, eventNamesMap, NATIVE_EVENT_INDEX } from '../utils/node';
import { trace, isGlobalBubble } from '../utils';
import HippyEventHub from './hub';
import Event from './event';

type EventParam = string[] | number[];

interface NativeEvent {
  id: number;
  currentId: number;
  name: string;
}

const eventHubs = new Map();
const componentName = ['%c[event]%c', 'color: green', 'color: auto'];

/**
 * convertEventName - convert all special event name
 * @param eventName
 * @param nodeItem
 */
function convertEventName(eventName: string, nodeItem: Fiber) {
  let processedEvenName = eventName;
  if (nodeItem.memoizedProps && !nodeItem.memoizedProps[eventName]) {
    const eventNameList = Object.keys(eventNamesMap);
    for (let i = 0; i < eventNameList.length; i += 1) {
      const uiEvent = eventNameList[i];
      const eventList = eventNamesMap[uiEvent];
      if (nodeItem.memoizedProps[uiEvent] && eventName === eventList[NATIVE_EVENT_INDEX]) {
        processedEvenName = uiEvent;
        break;
      }
    }
  }
  return processedEvenName;
}

function isNodePropFunction(prop: string, nextNodeItem: Fiber) {
  return !!(nextNodeItem.memoizedProps && typeof nextNodeItem.memoizedProps[prop] === 'function');
}

/**
 * triggerEvent - process event
 * @param {string} eventName
 * @param {NativeEvent} nativeEvent
 * @param {Fiber} currentItem
 * @param {Fiber} targetItem
 * @param {HippyTypes.DOMEvent} domEvent
 */
function triggerEvent(
  eventName: string,
  nativeEvent: NativeEvent,
  currentItem: Fiber,
  targetItem: Fiber,
  domEvent: HippyTypes.DOMEvent,
) {
  let isStopBubble: any = false;
  const captureEventName = `${eventName}Capture`;
  const targetNode = getElementFromFiber(targetItem);
  const currentTargetNode = getElementFromFiber(currentItem);
  try {
    // handle capture phase event
    if (isNodePropFunction(captureEventName, currentItem)) {
      const syntheticEvent = new Event(captureEventName, currentTargetNode, targetNode);
      Object.assign(syntheticEvent, nativeEvent);
      currentItem.memoizedProps[captureEventName](syntheticEvent);
      if (!syntheticEvent.bubbles && domEvent) {
        domEvent.stopPropagation();
      }
    }
    // handle target phase event
    if (isNodePropFunction(eventName, currentItem)) {
      const syntheticEvent = new Event(eventName, currentTargetNode, targetNode);
      Object.assign(syntheticEvent, nativeEvent);
      isStopBubble = currentItem.memoizedProps[eventName](syntheticEvent);
      // If callback have no return, use global bubble config to set isStopBubble.
      if (typeof isStopBubble !== 'boolean') {
        isStopBubble = !isGlobalBubble();
      }
      // event bubbles flag has higher priority
      if (!syntheticEvent.bubbles) {
        isStopBubble = true;
      }
      if (isStopBubble !== false && domEvent) {
        domEvent.stopPropagation();
      }
    }
  } catch (err) {
    (console as any).reportUncaughtException(err);
  }
}

function receiveNativeGesture(nativeEvent: NativeEvent, domEvent: HippyTypes.DOMEvent) {
  trace(...componentName, 'receiveNativeGesture', nativeEvent);
  if (!nativeEvent) {
    return;
  }
  const { id, currentId, name } = nativeEvent;
  const currentTargetNode = getFiberNodeFromId(currentId);
  const targetNode = getFiberNodeFromId(id);
  if (!currentTargetNode || !targetNode) {
    return;
  }
  const eventName = convertEventName(name, currentTargetNode);
  const currentItem: Fiber = currentTargetNode;
  const targetItem: Fiber = targetNode;
  triggerEvent(eventName, nativeEvent, currentItem, targetItem, domEvent);
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

function receiveUIComponentEvent(nativeEvent: any[]) {
  trace(...componentName, 'receiveUIComponentEvent', nativeEvent);
  if (!nativeEvent || !Array.isArray(nativeEvent) || nativeEvent.length < 2) {
    return;
  }
  const [targetNodeId, eventName, eventParam] = nativeEvent;
  if (typeof targetNodeId !== 'number' || typeof eventName !== 'string') {
    return;
  }
  const targetNode = getFiberNodeFromId(targetNodeId);
  if (!targetNode) {
    return;
  }
  if (isNodePropFunction(eventName, targetNode)) {
    targetNode.memoizedProps[eventName](eventParam);
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
  receiveNativeGesture,
  receiveUIComponentEvent,
};

if (global.__GLOBAL__) {
  global.__GLOBAL__.jsModuleList.EventDispatcher = EventDispatcher;
}

export default EventDispatcher;
