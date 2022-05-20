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

import { canUseDOM } from '../utils';

export const HIDE_SCROLLBAR_CLASS = '__hippy-react-hide-scrollbar';
const hideScrollbarKey = '__hippyReactHideScrollbarActive';

export const shouldHideScrollBar = (isHideScrollBar: boolean) => {
  if (canUseDOM) {
    if (isHideScrollBar && !window[hideScrollbarKey]) {
      window[hideScrollbarKey] = true;
      document.styleSheets[0].addRule(`.${HIDE_SCROLLBAR_CLASS}::-webkit-scrollbar`, 'display: none');
      document.styleSheets[0].addRule(`.${HIDE_SCROLLBAR_CLASS}`, '-ms-overflow-style: none; scrollbar-width: none;');
    }
  }
};
