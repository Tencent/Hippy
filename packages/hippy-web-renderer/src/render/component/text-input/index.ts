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

import { EVENT_NODE_WILL_REMOVE, HIPPY_COMPONENT_METHOD, NodeProps } from '../../module/node-def';
import { callBackUIFunctionToHippy } from '../../common';
import {
  H5TextInputBlurCallBack,
  H5TextInputCallBack,
  H5TextInputSelectionCallBack,
  HippyTextInputProps,
  initProps,
} from './process';

export function createHippyTextInput() {
  const textInput = document.createElement('input');
  initProps(textInput);
  initHook(textInput);
  initSelectionListener(textInput);
  initInputListener(textInput);
  initBlurListener(textInput);
  return textInput;
}
function initHook(element: HTMLElement) {
  const cacheLastSelection = [0, 0];
  element[H5TextInputSelectionCallBack] = () => {
    const selectionObj = window.getSelection();
    if (document.activeElement === element && selectionObj) {
      // TODO browser need api to process same text
      const index = (element as HTMLInputElement).value.indexOf(selectionObj?.toString() ?? '');
      if (
        index === cacheLastSelection[0]
        && cacheLastSelection[1] === index + selectionObj.toString().length
      ) return;
      cacheLastSelection[0] = index;
      cacheLastSelection[1] = index + selectionObj.toString().length;
      // eslint-disable-next-line max-len
      element[HippyTextInputProps][NodeProps.ON_SELECTION_CHANGE]?.(buildSelectEvent(index, index + selectionObj.toString().length));
    }
  };
  element[H5TextInputCallBack] = () => {
    element[HippyTextInputProps][NodeProps.ON_CHANGE_TEXT]?.({
      text: (element as HTMLInputElement).value,
    });
  };
  element[H5TextInputBlurCallBack] = () => {
    element[HippyTextInputProps][NodeProps.ON_BLUR]?.();
  };
  element[EVENT_NODE_WILL_REMOVE] = () => {
    document.removeEventListener('selectionchange', element[H5TextInputSelectionCallBack]);
    document.removeEventListener('input', element[H5TextInputCallBack]);
    document.removeEventListener('blur', element[H5TextInputBlurCallBack]);
  };
  element[HIPPY_COMPONENT_METHOD][NodeProps.BLUR_TEXT_INPUT] = () => {
    element?.blur();
  };
  element[HIPPY_COMPONENT_METHOD][NodeProps.CLEAR] = () => {
    (element as HTMLInputElement).value = '';
  };
  element[HIPPY_COMPONENT_METHOD][NodeProps.FOCUS_TEXT_INPUT] = () => {
    element?.focus();
  };
  element[HIPPY_COMPONENT_METHOD][NodeProps.GET_VALUE] = (_callBackId) => {
    callBackUIFunctionToHippy(_callBackId, { text: (element as HTMLInputElement).value }, true);
  };
  element[HIPPY_COMPONENT_METHOD][NodeProps.HIDE_INPUT_METHOD] = () => {
    // TODO need to process view scroll
    element?.blur();
  };
  element[HIPPY_COMPONENT_METHOD][NodeProps.SET_VALUE] = (_callBackId, value: string) => {
    (element as HTMLInputElement).value = value;
  };
  element[HIPPY_COMPONENT_METHOD][NodeProps.SHOW_INPUT_METHOD] = () => {
    element?.focus();
  };
}
function initSelectionListener(element: HTMLElement) {
  document.addEventListener('selectionchange', element[H5TextInputSelectionCallBack]);
}
function initInputListener(element: HTMLElement) {
  element.addEventListener('input', element[H5TextInputCallBack]);
}
function initBlurListener(element: HTMLElement) {
  element.addEventListener('blur', element[H5TextInputBlurCallBack]);
}
function buildSelectEvent(start: number, end: number) {
  return { nativeEvent: { selection: { start, end } } };
}
