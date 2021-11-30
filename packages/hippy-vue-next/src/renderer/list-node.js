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

import Native from '../runtime/native';
import ElementNode from './element-node';

/**
 * List element
 */
class ListNode extends ElementNode {
  /**
   * Scroll to child node with index
   */
  scrollToIndex(indexLeft = 0, indexTop = 0, needAnimation = true) {
    if (typeof indexLeft !== 'number' || typeof indexTop !== 'number') {
      return;
    }
    Native.callUIFunction(this, 'scrollToIndex', [indexLeft, indexTop, needAnimation]);
  }

  /**
   * Scroll children to specific position.
   */
  scrollToPosition(posX = 0, posY = 0, needAnimation = true) {
    if (typeof posX !== 'number' || typeof posY !== 'number') {
      return;
    }
    Native.callUIFunction(this, 'scrollToContentOffset', [posX, posY, needAnimation]);
  }

  /**
   * Polyfill native event
   */
  polyFillNativeEvents(method, eventNames, callback, options) {
    const eventHandlerMap = {
      addEvent: 'addEventListener',
      removeEvent: 'removeEventListener',
    };
    let name = eventNames;
    if (eventNames === 'endReached' || eventNames === 'loadMore') {
      name = eventNames === 'endReached' ? 'loadMore' : 'endReached';
      if (this.emitter && eventHandlerMap[method]) {
        const handler = eventHandlerMap[method];
        this.emitter[handler](name, callback, options);
      }
    }
  }
}

export default ListNode;
