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

const keyName = '__reactResponderId';
export const TOUCH_START = 'touchstart';
export const TOUCH_END = 'touchend';
export const TOUCH_MOVE = 'touchmove';
export const TOUCH_CANCEL = 'touchcancel';
export const SCROLL_EVENT = 'scroll';

export const isTouchStart = (eventType: string): boolean => eventType === TOUCH_START;
export const isTouchEnd = (eventType: string): boolean => eventType === TOUCH_END;
export const isTouchMove = (eventType: string): boolean => eventType === TOUCH_MOVE;
export const isTouchCancel = (eventType: string): boolean => eventType === TOUCH_CANCEL;
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
