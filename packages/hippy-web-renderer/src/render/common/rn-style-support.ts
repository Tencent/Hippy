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

import {
  STYLE_MARGIN_H,
  STYLE_MARGIN_V,
  STYLE_PADDING_H,
  STYLE_PADDING_V,
} from '../module/node-def';
import { setElementStyle } from './index';
const styleMap = {};
styleMap[STYLE_MARGIN_H] = rnMarginSupport;
styleMap[STYLE_MARGIN_V] = rnMarginSupport;
styleMap[STYLE_PADDING_H] = rnPaddingSupport;
styleMap[STYLE_PADDING_V] = rnPaddingSupport;
export function rnStyleSupport(el: HTMLElement, key: any) {
  styleMap[key]?.(el, key);
}
function rnMarginSupport(el: HTMLElement, key: string) {
  const size =  el.style[key];
  switch (key) {
    case STYLE_MARGIN_V:
      setElementStyle(el, { marginTop: size, marginBottom: size });
      break;
    case STYLE_MARGIN_H:
      setElementStyle(el, { marginLeft: size, marginRight: size });
      break;
  }
}
function rnPaddingSupport(el: HTMLElement, key: string) {
  const size =  el.style[key];
  switch (key) {
    case STYLE_PADDING_V:
      setElementStyle(el, { paddingTop: size, paddingBottom: size });
      break;
    case STYLE_PADDING_H:
      setElementStyle(el, { paddingLeft: size, paddingRight: size });
      break;
  }
}
