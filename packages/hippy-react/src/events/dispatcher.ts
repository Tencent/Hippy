import { findNodeById } from '../utils/node';
import { trace, warn } from '../utils';
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
  if (!nativeEvent || !(nativeEvent instanceof Array) || nativeEvent.length < 2) {
    throw new TypeError(`Invalid params for receiveNativeEvent: ${JSON.stringify(nativeEvent)}`);
  }
  const [eventName, eventParams] = nativeEvent;
  if (typeof eventName !== 'string') {
    throw new TypeError('Invalid arguments');
  }
  const currEventHub = getHippyEventHub(eventName);
  if (!currEventHub) {
    warn('[event] currEventHub: target eventHub is not found', eventName, nativeEvent);
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

  let eventHandled = false;
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
