/* eslint-disable import/prefer-default-export */
/* eslint-disable no-underscore-dangle */

import { trace, getApp } from '../../../util';
import { Event } from './event';

const componentName = ['%c[event]%c', 'color: green', 'color: auto'];

function getVueEventName(eventName, targetNode) {
  const { eventNamesMap } = targetNode.meta.component;
  if (eventNamesMap && eventNamesMap[eventName]) {
    return eventNamesMap[eventName];
  }
  if (eventName.indexOf('on') !== 0) {
    return eventName;
  }
  const str = eventName.slice(2, eventName.length); // Assume 'on' prefix length = 2.
  return str.charAt(0).toLowerCase() + str.slice(1);
}

const EventDispatcher = {
  /**
   * Redirect native events to Vue directly.
   */
  receiveNativeEvent(nativeEvent) {
    trace(...componentName, 'receiveNativeEvent', nativeEvent);
    if (!nativeEvent || !Array.isArray((nativeEvent)) || nativeEvent.length < 2) {
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
  receiveNativeGesture(nativeEvent) {
    trace(...componentName, 'receiveNativeGesture', nativeEvent);
    if (!nativeEvent) {
      return;
    }
    const { id: targetNodeId, name: eventName } = nativeEvent;
    const { $el: rootNode } = getApp();
    const targetNode = rootNode.findChild(node => node.nodeId === targetNodeId);
    if (!targetNode) {
      return;
    }

    const targetEventName = getVueEventName(eventName, targetNode);
    const targetEvent = new Event(targetEventName);
    const { processEventData } = targetNode._meta.component;
    if (processEventData) {
      processEventData(targetEvent, eventName, nativeEvent);
    }
    targetNode.dispatchEvent(targetEvent);
    // Back compatible for previous touch events
    // TODO: Will remove soon.
    if (['onTouchDown', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'].indexOf(eventName) !== -1) {
      let touchEvent;
      if (eventName === 'onTouchDown') {
        touchEvent = new Event('touchStart');
      } else {
        touchEvent = new Event(`t${eventName.slice(3, eventName.length)}`);
      }
      touchEvent.touches = [
        {
          clientX: nativeEvent.page_x,
          clientY: nativeEvent.page_y,
        },
      ];
      targetNode.dispatchEvent(touchEvent);
    }
  },
  /**
   * Receive the events like keyboard typing
   */
  receiveUIComponentEvent(nativeEvent) {
    trace(...componentName, 'receiveUIComponentEvent', nativeEvent);
    if (!nativeEvent || !(nativeEvent instanceof Array) || nativeEvent.length < 2) {
      return;
    }
    const [targetNodeId, eventName, params] = nativeEvent;
    if (typeof targetNodeId !== 'number' || typeof eventName !== 'string') {
      return;
    }
    const { $el: rootNode } = getApp();
    const targetNode = rootNode.findChild(node => node.nodeId === targetNodeId);
    if (!targetNode) {
      return;
    }
    const targetEventName = getVueEventName(eventName, targetNode);
    const targetEvent = new Event(targetEventName);
    // Post event parameters process.
    if (eventName === 'onLayout') {
      const { layout } = params;
      targetEvent.top = layout.y;
      targetEvent.left = layout.x;
      targetEvent.bottom = layout.y + layout.height;
      targetEvent.right = layout.x + layout.width;
      targetEvent.width = layout.width;
      targetEvent.height = layout.height;
    } else {
      const { processEventData } = targetNode._meta.component;
      if (processEventData) {
        processEventData(targetEvent, eventName, params);
      }
    }
    targetNode.dispatchEvent(targetEvent);
  },
};

if (global.__GLOBAL__) {
  global.__GLOBAL__.jsModuleList.EventDispatcher = EventDispatcher;
}

export {
  EventDispatcher,
};
