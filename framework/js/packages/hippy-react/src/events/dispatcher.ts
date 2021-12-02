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

import { Fiber } from 'react-reconciler';
import { getFiberNodeFromId } from '../utils/node';
import { trace, isGlobalBubble, isHostComponent } from '../utils';
import HippyEventHub from './hub';
import '@localTypes/global';

type EventParam = string[] | number[];

interface NativeEvent {
  id: number;
  name: string;
}

const eventHubs = new Map();
const componentName = ['%c[event]%c', 'color: green', 'color: auto'];

function registerNativeEventHub(eventName: string) {
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

function getHippyEventHub(eventName: string) {
  if (typeof eventName !== 'string') {
    throw new TypeError(`Invalid eventName for getHippyEventHub: ${eventName}`);
  }
  return eventHubs.get(eventName) || null;
}

function unregisterNativeEventHub(eventName: string) {
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
    throw new TypeError('Invalid arguments');
  }
  const currEventHub = getHippyEventHub(eventName);
  if (!currEventHub) {
    return;
  }
  currEventHub.notifyEvent(eventParams);
}

interface ListenerObj { listener: Function, isCapture: boolean }

/**
 * convertEventName - convert all special event name
 * @param eventName
 * @param nodeItem
 */
function convertEventName(eventName: string, nodeItem: Fiber) {
  let processedEvenName = eventName;
  if (nodeItem.memoizedProps
      && !nodeItem.memoizedProps[eventName]
      && eventName === 'onClick'
      && nodeItem.memoizedProps.onPress) {
    // Compatible with React Native
    processedEvenName = 'onPress';
  }
  return processedEvenName;
}

function isNodePropFunction(prop: string, nextNodeItem: Fiber) {
  return !!(nextNodeItem.memoizedProps && typeof nextNodeItem.memoizedProps[prop] === 'function');
}

/**
 * doCaptureAndBubbleLoop - process capture phase and bubble phase
 * @param {string} originalEventName
 * @param {NativeEvent} nativeEvent
 * @param {Fiber} nodeItem
 */
function doCaptureAndBubbleLoop(originalEventName: string, nativeEvent: NativeEvent, nodeItem: Fiber) {
  const eventQueue: ListenerObj[] = [];
  let nextNodeItem: Fiber | null = nodeItem;
  let eventName = originalEventName;
  // capture and bubble loop
  while (nextNodeItem) {
    eventName = convertEventName(eventName, nextNodeItem);
    const captureName = `${eventName}Capture`;
    if (isNodePropFunction(captureName, nextNodeItem)) {
      // capture phase to add listener at queue head
      eventQueue.unshift({ listener: nextNodeItem.memoizedProps[captureName], isCapture: true });
    }
    if (isNodePropFunction(eventName, nextNodeItem)) {
      // bubble phase to add listener at queue tail
      eventQueue.push({ listener: nextNodeItem.memoizedProps[eventName], isCapture: false });
    }
    nextNodeItem = nextNodeItem.return;
    while (nextNodeItem && !isHostComponent(nextNodeItem.tag)) {
      // only handle HostComponent
      nextNodeItem = nextNodeItem.return;
    }
  }
  if (eventQueue.length > 0) {
    let listenerObj: ListenerObj | undefined;
    let isStopBubble: any = false;
    while (!isStopBubble && (listenerObj = eventQueue.shift()) !== undefined) {
      try {
        if (listenerObj.isCapture) {
          listenerObj.listener(nativeEvent);
        } else {
          isStopBubble = listenerObj.listener(nativeEvent);
          // If callback have no return, use global bubble config to set isStopBubble.
          if (typeof isStopBubble !== 'boolean') {
            isStopBubble = !isGlobalBubble();
          }
        }
      } catch (err) {
        (console as any).reportUncaughtException(err);
      }
    }
  }
}

/**
 * doBubbleLoop - process only bubble phase
 * @param {string} originalEventName
 * @param {NativeEvent} nativeEvent
 * @param {Fiber} nodeItem
 */
function doBubbleLoop(originalEventName: string, nativeEvent: NativeEvent, nodeItem: Fiber) {
  let isStopBubble: any = false;
  let nextNodeItem: Fiber | null = nodeItem;
  let eventName = originalEventName;
  // only bubble loop
  do {
    eventName = convertEventName(eventName, nextNodeItem);
    if (isNodePropFunction(eventName, nextNodeItem)) {
      try {
        isStopBubble = nextNodeItem.memoizedProps[eventName](nativeEvent);
        // If callback have no return, use global bubble config to set isStopBubble.
        if (typeof isStopBubble !== 'boolean') {
          isStopBubble = !isGlobalBubble();
        }
      } catch (err) {
        (console as any).reportUncaughtException(err);
      }
    }
    if (isStopBubble === false) {
      nextNodeItem = nextNodeItem.return;
      while (nextNodeItem && !isHostComponent(nextNodeItem.tag)) {
        // only handle HostComponent
        nextNodeItem = nextNodeItem.return;
      }
    }
  } while (!isStopBubble && nextNodeItem);
}

function receiveNativeGesture(nativeEvent: NativeEvent) {
  trace(...componentName, 'receiveNativeGesture', nativeEvent);
  if (!nativeEvent) {
    return;
  }
  const { id: targetNodeId } = nativeEvent;
  const targetNode = getFiberNodeFromId(targetNodeId);
  if (!targetNode) {
    return;
  }
  let hasCapturePhase: boolean = true;
  let { name: eventName } = nativeEvent;
  eventName = convertEventName(eventName, targetNode);
  const captureName = `${eventName}Capture`;
  const nextNodeItem: Fiber = targetNode;
  // if current target has no capture listener, only do bubble phase loop to improve performance
  if (targetNode.memoizedProps && typeof targetNode.memoizedProps[captureName] !== 'function') {
    hasCapturePhase = false;
  }
  if (hasCapturePhase) {
    doCaptureAndBubbleLoop(eventName, nativeEvent, nextNodeItem);
  } else {
    doBubbleLoop(eventName, nativeEvent, nextNodeItem);
  }
}

function receiveUIComponentEvent(nativeEvent: string[]) {
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
  if (targetNode.memoizedProps
    && targetNode.memoizedProps[eventName]
    && typeof targetNode.memoizedProps[eventName] === 'function') {
    targetNode.memoizedProps[eventName](eventParam);
  }
}

const EventDispatcher = {
  registerNativeEventHub,
  getHippyEventHub,
  unregisterNativeEventHub,
  receiveNativeEvent,
  receiveNativeGesture,
  receiveUIComponentEvent,
};

// @ts-ignore
if (global.__GLOBAL__) {
  // @ts-ignore
  global.__GLOBAL__.jsModuleList.EventDispatcher = EventDispatcher;
}

export default EventDispatcher;
