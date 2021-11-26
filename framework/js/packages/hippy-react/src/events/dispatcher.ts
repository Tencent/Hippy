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

// import { getFiberNodeFromId } from '../utils/node';
import { findNodeById } from '../utils/node';
import { trace, isBubbles } from '../utils';
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


function receiveNativeGesture(nativeEvent: NativeEvent) {
  trace(...componentName, 'receiveNativeGesture', nativeEvent);
  if (!nativeEvent) {
    return;
  }
  const { id: targetNodeId } = nativeEvent;
  const targetNode = findNodeById(targetNodeId);
  if (!targetNode) {
    return;
  }

  let eventHandled: any = false;
  let nextNodeItem = targetNode;
  let { name: eventName } = nativeEvent;
  do {
    if (nextNodeItem.memoizedProps
      && !nextNodeItem.memoizedProps[eventName]
      && eventName === 'onClick'
      && nextNodeItem.memoizedProps.onPress) {
      // Compatible with React Native
      eventName = 'onPress';
    }

    if (nextNodeItem.memoizedProps
      && nextNodeItem.memoizedProps[eventName]
      && typeof nextNodeItem.memoizedProps[eventName] === 'function') {
      try {
        eventHandled = nextNodeItem.memoizedProps[eventName](nativeEvent);
        // If callback have no return, set global bubbles config to eventHandled.
        if (typeof eventHandled !== 'boolean') {
          eventHandled = !isBubbles();
        }
      } catch (err) {
        (console as any).reportUncaughtException(err); // eslint-disable-line
      }
    }

    // If callback have no return is meaning no need the event bubbling
    if (typeof eventHandled !== 'boolean') {
      eventHandled = true;
    }

    if (eventHandled === false) {
      // @ts-ignore
      nextNodeItem = nextNodeItem.return;
      while (nextNodeItem && nextNodeItem.tag !== 5) {
        // @ts-ignore
        nextNodeItem = nextNodeItem.return;
      }
    }
  } while (!eventHandled && nextNodeItem);
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
  const targetNode = findNodeById(targetNodeId);
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
