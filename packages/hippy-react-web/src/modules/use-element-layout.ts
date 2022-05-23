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

import { useLayoutEffect } from 'react';
import { LayoutEvent, ResizeObserver } from '../types';
import { canUseDOM } from '../utils';
import UIManager from './ui-manager-module';

const DOM_LAYOUT_HANDLER_NAME = '__reactLayoutHandler';

let didWarn = !canUseDOM;
let resizeObserver: null | ResizeObserver = null;

function getResizeObserver(): ResizeObserver | null {
  if (canUseDOM && typeof window.ResizeObserver !== 'undefined') {
    if (resizeObserver === null) {
      resizeObserver = new window.ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const node = entry.target as HTMLElement;
          const onLayout = node[DOM_LAYOUT_HANDLER_NAME];
          if (typeof onLayout === 'function') {
            // We still need to measure the view because browsers don't yet provide
            // border-box dimensions in the entry
            UIManager.measure(node, (x, y, width, height, left, top) => {
              const event: LayoutEvent = {
                target: node,
                layout: { x, y, width, height, left, top },
                NativeEvent: {
                  layout: { x, y, width, height, left, top },
                },
                timeStamp: Date.now(),
              };
              Object.defineProperty(event, 'target', {
                enumerable: true,
                get: () => entry.target,
              });
              onLayout(event);
            });
          }
        });
      });
    }
  } else if (!didWarn) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.warn('onLayout relies on ResizeObserver which is not supported by your browser. '
        + 'Please include a polyfill, e.g., https://github.com/que-etc/resize-observer-polyfill.');
      didWarn = true;
    }
  }
  return resizeObserver;
}

export default function useElementLayout(ref: any, onLayout?: (e: LayoutEvent) => void) {
  const observer = getResizeObserver();
  useLayoutEffect(() => {
    const node = ref.current;
    if (node) {
      node[DOM_LAYOUT_HANDLER_NAME] = onLayout;
    }
  }, [ref, onLayout]);

  // Observing is done in a separate effect to avoid this effect running
  // when 'onLayout' changes.
  useLayoutEffect(() => {
    const node = ref.current;
    if (node && observer !== null) {
      if (typeof node[DOM_LAYOUT_HANDLER_NAME] === 'function') {
        observer.observe(node);
      } else {
        observer.unobserve(node);
      }
    }
    return () => {
      if (node && observer !== null) {
        observer.unobserve(node);
      }
    };
  }, [ref, observer]);
}
