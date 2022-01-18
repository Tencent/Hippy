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

import { setElementStyle } from '../../common';
import {
  EVENT_CHILD_NODE_WILL_INSERT,
  EVENT_NODE_WILL_INSERT,
  EVENT_NODE_WILL_REMOVE,
  NodeProps,
} from '../../module/node-def';
import {
  ANIMATION_TIME,
  buildModalEntryAnimationStyle,
  buildModalLeaveAnimationStyle,
  HippyModalProps,
  initProps,
  ModalAnimationType,
} from './process';

export function createHippyModal() {
  const modal = document.createElement('div');
  const initStyle = {
    style: {
      display: 'flex',
      flexDirection: 'column',
      overflow: ' hidden',
      width: '100vw',
      height: '100vh',
      top: '0%',
    },
  };
  setElementStyle(modal, initStyle.style);
  initProps(modal);
  initHook(modal);
  return modal;
}
function initHook(element: HTMLElement) {
  element[EVENT_CHILD_NODE_WILL_INSERT] = (child: HTMLElement, sortIndex: number) => {
    if (sortIndex === 0) {
      setElementStyle(child, { flex: '1', position: 'static' });
      // TODO need to refactor
      // eslint-disable-next-line no-param-reassign
      // @ts-ignore
      delete child.style.top;
      // eslint-disable-next-line no-param-reassign
      // @ts-ignore
      delete child.style.left;
    }
  };
  element[EVENT_NODE_WILL_INSERT] = (_parentNode: Element, realIndex: number) => new Promise<void>((resolve) => {
    if (
      element[HippyModalProps][NodeProps.ANIMATED]
        && element[HippyModalProps][NodeProps.ANIMATION_TYPE] !== ModalAnimationType.None
    ) {
      const { animation, newState } = buildModalEntryAnimationStyle(element[HippyModalProps][NodeProps.ANIMATION_TYPE]);
      setElementStyle(element, { zIndex: realIndex, ...newState });
      setTimeout(() => {
        setElementStyle(element, animation);
      }, 64);
      return;
    }
    resolve();
  });
  element[EVENT_NODE_WILL_REMOVE] = () => new Promise<void>((resolve) => {
    if (
      element[HippyModalProps][NodeProps.ANIMATED]
        && element[HippyModalProps][NodeProps.ANIMATION_TYPE] !== ModalAnimationType.None
    ) {
      setElementStyle(
        element,
        buildModalLeaveAnimationStyle(element[HippyModalProps][NodeProps.ANIMATION_TYPE]),
      );
      setTimeout(resolve, ANIMATION_TIME);
      return;
    }
    resolve();
  });
}
