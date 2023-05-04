/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import { Native } from '../native';

import { HippyElement } from './hippy-element';

/**
 * Hippy list element, such as ul
 *
 * @public
 */
export class HippyListElement extends HippyElement {
  /**
   * scroll to specified index
   */
  public scrollToIndex(
    indexLeft = 0,
    indexTop = 0,
    needAnimation = true,
  ): void {
    Native.callUIFunction(this, 'scrollToIndex', [
      indexLeft,
      indexTop,
      needAnimation,
    ]);
  }

  /**
   * scroll to specified offset
   */
  public scrollToPosition(
    posX: number | undefined = 0,
    posY: number | undefined = 0,
    needAnimation = true,
  ): void {
    if (typeof posX !== 'number' || typeof posY !== 'number') {
      return;
    }
    Native.callUIFunction(this, 'scrollToContentOffset', [
      posX,
      posY,
      needAnimation,
    ]);
  }
}
