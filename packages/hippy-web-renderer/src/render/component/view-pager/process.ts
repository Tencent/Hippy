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

import { dispatchEventToHippy, ProcessType, setElementStyle } from '../../common';
import { HIPPY_COMPONENT_METHOD, NodeProps } from '../../module/node-def';

export const HippyViewPagerProps = 'hippyViewPagerProps';

export const ViewPagerProps: ProcessType = {
  initialPage: initialPageProcess,
  scrollEnabled: scrollEnabledProcess,
  onPageSelected: onPageSelectedProcess,
  onPageScroll: onPageScrollProcess,
  onPageScrollStateChanged: onPageScrollStateChangedProcess,
  direction: directionProcess,
};
export function initProps(el: HTMLElement) {
  el[HippyViewPagerProps][NodeProps.INITIAL_PAGE] = 0;
  el[HippyViewPagerProps][NodeProps.SCROLL_ENABLED] = true;
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SELECTED] = null;
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL] = null;
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL_STATE_CHANGED] = null;
  el[HippyViewPagerProps][NodeProps.DIRECTION] = 0;
  // TODO implement api
  el[HIPPY_COMPONENT_METHOD][NodeProps.SET_PAGE] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.SET_PAGE_WITHOUT_ANIMATION] = null;
}
function initialPageProcess(el: HTMLElement, value: string | number | boolean) {
  if (!isNaN(value as number) && value > 0) {
    el[HippyViewPagerProps][NodeProps.INITIAL_PAGE] = value;
    return;
  }
  el[HippyViewPagerProps][NodeProps.INITIAL_PAGE] = 0;
}
function scrollEnabledProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyViewPagerProps][NodeProps.SCROLL_ENABLED] = !!value;
}
function onPageSelectedProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  if (value) {
    el[HippyViewPagerProps][NodeProps.ON_PAGE_SELECTED] = (event) => {
      dispatchEventToHippy(nodeId, NodeProps.ON_PAGE_SELECTED, event);
    };
    return;
  }
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SELECTED] = null;
}
function onPageScrollProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  if (value) {
    el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL] = (event) => {
      dispatchEventToHippy(nodeId, NodeProps.ON_PAGE_SCROLL, event);
    };
    return;
  }
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL] = null;
}
function onPageScrollStateChangedProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  if (value) {
    el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL_STATE_CHANGED] = (event) => {
      dispatchEventToHippy(nodeId, NodeProps.ON_PAGE_SCROLL_STATE_CHANGED, event);
    };
    return;
  }
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL_STATE_CHANGED] = null;
}
function directionProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyViewPagerProps][NodeProps.DIRECTION] = !!value;
  const scrollStyle = { flexDirection: 'row' };
  if (!el[HippyViewPagerProps][NodeProps.DIRECTION]) {
    scrollStyle.flexDirection = 'column';
  }
  setElementStyle(el, scrollStyle);
}
