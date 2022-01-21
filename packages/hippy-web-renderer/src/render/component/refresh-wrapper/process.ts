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

import { buildCallBackProps, ProcessType } from '../../common';
import { HIPPY_COMPONENT_METHOD, NodeProps, NodeTag, ORIGIN_TYPE } from '../../module/node-def';

export const HippyRefreshWrapperProps = 'hippyRefreshWrapperProps';

export const RefreshWrapperProps: ProcessType = {
  onRefresh: onRefreshProcess,
  getRefresh: getRefreshProcess,
  bounceTime: bounceTimeProcess,
};
export function initProps(el: HTMLElement) {
  el[HippyRefreshWrapperProps] = {};
  el[HIPPY_COMPONENT_METHOD] = {};
  el[ORIGIN_TYPE] = NodeTag.REFRESH;

  el[HippyRefreshWrapperProps][NodeProps.ON_REFRESH] = null;
  el[HippyRefreshWrapperProps][NodeProps.GET_REFRESH] = null;
  el[HippyRefreshWrapperProps][NodeProps.BOUNCE_TIME] = 120;

  el[HIPPY_COMPONENT_METHOD][NodeProps.REFRESH_COMPLETED] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.START_REFRESH] = null;
}
function onRefreshProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyRefreshWrapperProps, NodeProps.ON_REFRESH, nodeId);
}
function getRefreshProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyRefreshWrapperProps][NodeProps.GET_REFRESH] = !!value;
}
function bounceTimeProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyRefreshWrapperProps][NodeProps.BOUNCE_TIME] = !!value;
}
