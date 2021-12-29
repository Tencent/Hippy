import { canUseDOM } from '../../utils/execution-environment';
import {
  getResponderPaths, setResponderId, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE, TOUCH_START, SCROLL_EVENT,
  isTouchStart, isTouchMove, isTouchCacel, isTouchEnd, isScrollEvent,
} from './utils';
import { Touch } from './responder-event-types';
import { ResponderConfig } from './index';

interface ResponderEvent {
  addNode: (id: number, node: HTMLElement, config: ResponderConfig) => void;
  removeNode: (id: number) => void;
  attachListerers: () => void;
}

const reponderEventKey = '__reactResponderSystemActive';
const responderListerersMap = new Map<number, ResponderConfig>();

const documentEventCapturePhase = [SCROLL_EVENT];
const documentEventsBubblePhase = [
  // touch
  TOUCH_START,
  TOUCH_MOVE,
  TOUCH_END,
  TOUCH_CANCEL,
];
const touchEvent = [TOUCH_START, TOUCH_MOVE, TOUCH_END, TOUCH_CANCEL];
let touchEventStore: Touch = {
  pageX: 0,
  pageY: 0,
  target: null,
  force: 0,
  identifier: 0,
};

const handleTouchEvent = (touchEvent: Touch, config: ResponderConfig, eventType: string) => {
  const { onTouchDown, onTouchMove, onTouchEnd, onTouchCancel } = config;
  if (isTouchStart(eventType) && onTouchDown) {
    touchEventStore = { ...touchEvent };
    onTouchDown(touchEvent);
  }
  if (isTouchMove(eventType) && onTouchMove) {
    touchEventStore = { ...touchEvent };
    onTouchMove(touchEvent);
  }
  if (isTouchEnd(eventType) && onTouchEnd) {
    onTouchEnd(touchEvent);
  }
  if (isTouchCacel(eventType) && onTouchCancel) {
    onTouchCancel(touchEventStore);
  }
};

const eventListerner = (domEvent: any) => {
  const eventType = domEvent?.type;
  const eventPath = getResponderPaths(domEvent);
  const responderId = eventPath.idPath[0];
  if (touchEvent.includes(eventType)) {
    const touches = domEvent.changedTouches[0];
    if (responderListerersMap.has(responderId)) {
      const touchEvent: Touch = {
        pageX: touches.pageX,
        pageY: touches.pageY,
        target: touches.target,
        force: touches.force,
        identifier: touches.identifier,
      };
      const config = responderListerersMap.get(responderId);
      if (config) {
        handleTouchEvent(touchEvent, config, eventType);
      }
    }
  }
  if (isScrollEvent(eventType)) {
    const config = responderListerersMap.get(responderId);
    if (config && config.onScroll) {
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
      documentEventCapturePhase.forEach((eventType) => {
        document.addEventListener(eventType, eventListerner);
      });
    }
  },
};

export default responderEvent;

