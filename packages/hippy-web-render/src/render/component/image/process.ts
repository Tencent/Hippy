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

import { buildCallBackProps, ProcessType, setElementStyle } from '../../common';
import {
  HIPPY_COMPONENT_METHOD,
  ImageResizeModeToObjectFit,
  NodeProps,
  NodeTag,
  ORIGIN_TYPE,
} from '../../module/node-def';

export const ImgProps: ProcessType = {
  onLoad: onLoadProcess,
  onLoadStart: onLoadStartProcess,
  onLoadEnd: onLoadEndProcess,
  resizeMode: resizeModeProcess,
  src: sourceProcess,
  defaultSource: defaultSourceProcess,
  onError: onErrorProcess,
  capInsets: capInsetsProcess,
  onProgress: onProgressProcess,
};
export const HippyImageProps = 'imageProps';

const HippyLoadStart = 'onLoadStart';
const HippyLoadEnd = 'onLoadEnd';
const HippyLoad = 'onLoad';
export function initProps(el: HTMLElement) {
  el[HippyImageProps] = {};
  el[HIPPY_COMPONENT_METHOD] = {};
  el[ORIGIN_TYPE] = NodeTag.IMAGE;
  el[HippyImageProps][NodeProps.ON_LOAD] = null;
  el[HippyImageProps][NodeProps.ON_LOAD_START] = null;
  el[HippyImageProps][NodeProps.ON_LOAD_END] = null;
  el[HippyImageProps][NodeProps.RESIZE_MODE] = 'hidden';
  el[HippyImageProps][NodeProps.SOURCE] = null;
  el[HippyImageProps][NodeProps.DEFAULT_SOURCE] = null;
  el[HippyImageProps][NodeProps.ON_ERROR] = null;
  el[HippyImageProps][NodeProps.CAP_INSETS] = null;
  el[HippyImageProps][NodeProps.ON_PROGRESS] = null;
}
function onLoadProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  prepareLoad(el);
  buildCallBackProps(el, !!value, HippyImageProps, HippyLoad, nodeId);
}
function onLoadStartProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  prepareLoad(el);
  buildCallBackProps(el, !!value, HippyImageProps, HippyLoadStart, nodeId);
}
function onLoadEndProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  prepareLoad(el);
  buildCallBackProps(el, !!value, HippyImageProps, HippyLoadEnd, nodeId);
}
function buildLoadHook(el: HTMLElement) {
  (el as HTMLImageElement).onload = () => {
    if (el[HippyImageProps][HippyLoadStart]) {
      el[HippyImageProps][HippyLoadStart]();
    }
    if (el[HippyImageProps][HippyLoad]) {
      el[HippyImageProps][HippyLoad]();
    }
    if (el[HippyImageProps][HippyLoadEnd]) {
      el[HippyImageProps][HippyLoadEnd]();
    }
  };
}
function prepareLoad(el: HTMLElement) {
  if (!el[HippyImageProps]) {
    el[HippyImageProps] = {};
  }
  buildLoadHook(el);
}
function resizeModeProcess(el: HTMLElement, value: string | number | boolean, _nodeId: number) {
  if (ImageResizeModeToObjectFit[value as string]) {
    setElementStyle(el, { objectFit: ImageResizeModeToObjectFit[value as string] });
  }
}
function sourceProcess(el: HTMLElement, value: string | number | boolean, _nodeId: number) {
  if (typeof value === 'string' && /^(hpfile):\/\//.test(value) && value.indexOf('assets') > -1) {
    (el as HTMLImageElement).src = value.replace('hpfile://./', '');
    return;
  }
  if (typeof value === 'string') {
    (el as HTMLImageElement).src = value;
  }
}
function defaultSourceProcess() {
  // TODO implement api
}
function onErrorProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
}
function capInsetsProcess() {
  // TODO implement api
}
function onProgressProcess() {
  // TODO implement api
}
