const keyName = '__reactResponderId';
export const TOUCH_START = 'touchstart';
export const TOUCH_END = 'touchend';
export const TOUCH_MOVE = 'touchmove';
export const TOUCH_CANCEL = 'touchcancel';
export const SCROLL_EVENT = 'scroll';

export const isTouchStart = (eventType: string): boolean => eventType === TOUCH_START;
export const isTouchEnd = (eventType: string): boolean => eventType === TOUCH_END;
export const isTouchMove = (eventType: string): boolean => eventType === TOUCH_MOVE;
export const isTouchCacel = (eventType: string): boolean => eventType === TOUCH_CANCEL;
export const isScrollEvent = (eventType: string): boolean => eventType === SCROLL_EVENT;

const composedPathFallback = (target: any): any[] => {
  const path: any[] = [];
  while (target !== null && target !== document.body) {
    path.push(target);
    // eslint-disable-next-line no-param-reassign
    target = target.parentNode;
  }
  return path;
};


const getEventPath = (domEvent: any): any[] => {
  const path = domEvent.composedPath !== null
    ? domEvent.composedPath()
    : composedPathFallback(domEvent.target);
  return path;
};

const getResponderId = (node: any): number | null => {
  if (node !== null) {
    return node[keyName];
  }
  return null;
};

export const setResponderId = (node: any, id: number) => {
  if (node !== null) {
    // eslint-disable-next-line no-param-reassign
    node[keyName] = id;
  }
};

export const getResponderPaths = (domEvent: any): { idPath: number[]; nodePath: any[] } => {
  const idPath: number[] = [];
  const nodePath: any[] = [];
  const eventPath = getEventPath(domEvent);
  for (let i = 0; i < eventPath.length; i++) {
    const node = eventPath[i];
    const id = getResponderId(node);
    if (id) {
      idPath.push(id);
      nodePath.push(node);
    }
  }
  return { idPath, nodePath };
};
