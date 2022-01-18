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

import { HIPPY_COMPONENT_METHOD, NodeProps, NodeTag, ORIGIN_TYPE } from '../../module/node-def';
import { buildCallBackProps, ProcessType } from '../../common';
enum KeyboardType {
  default = 'default',
  numeric = 'numeric',
  password = 'password',
  email = 'email',
  phonePad = 'phone-pad',
  search = 'search',
}
enum ReturnKeyType {
  done = 'done',
  go = 'go',
  next = 'next',
  search = 'search',
  send = 'send',
}
export const HippyTextInputProps = 'hippyRefreshWrapperProps';

export const H5TextInputSelectionCallBack = 'h5TextInputSelectionCallBack';
export const H5TextInputCallBack = 'h5TextInputCallBack';
export const H5TextInputBlurCallBack = 'h5TextInputBlurCallBack';

export const TextInputProps: ProcessType = {
  defaultValue: defaultValueProcess,
  editable: editableProcess,
  keyboardType: keyboardTypeProcess,
  maxLength: maxLengthProcess,
  multiline: multilineProcess,
  numberOfLines: numberOfLinesProcess,
  onBlur: onBlurProcess,
  onChangeText: onChangeTextProcess,
  onKeyboardWillShow: onKeyboardWillShowProcess,
  onEndEditing: onEndEditingProcess,
  onLayout: onLayoutProcess,
  onSelectionChange: onSelectionChangeProcess,
  placeholder: placeholderProcess,
  placeholderTextColor: placeholderTextColorProcess,
  returnKeyType: returnKeyTypeProcess,
  value: valueProcess,
  autoFocus: autoFocusProcess,
};
export function initProps(el: HTMLElement) {
  el[HippyTextInputProps] = {};
  el[HIPPY_COMPONENT_METHOD] = {};
  el[ORIGIN_TYPE] = NodeTag.TEXT_INPUT;

  defaultValueProcess(el, '');
  editableProcess(el, true);
  keyboardTypeProcess(el, KeyboardType.default);
  maxLengthProcess(el, 99999999);
  multilineProcess(el, false);
  numberOfLinesProcess(el, 99999999);
  placeholderProcess(el, '');
  placeholderTextColorProcess(el, '#d3d3d3', -1);
  returnKeyTypeProcess(el, ReturnKeyType.done);
  valueProcess(el, '');
  autoFocusProcess(el, false);
  el[HippyTextInputProps][NodeProps.ON_BLUR] = null;
  el[HippyTextInputProps][NodeProps.ON_CHANGE_TEXT] = null;
  el[HippyTextInputProps][NodeProps.ON_KEYBOARD_WILL_SHOW] = null;
  el[HippyTextInputProps][NodeProps.ON_END_EDITING] = null;
  el[HippyTextInputProps][NodeProps.ON_LAYOUT] = null;
  el[HippyTextInputProps][NodeProps.ON_SELECTION_CHANGE] = null;

  el[HIPPY_COMPONENT_METHOD][NodeProps.ON_BLUR] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.CLEAR] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.FOCUS_TEXT_INPUT] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.GET_VALUE] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.HIDE_INPUT_METHOD] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.SET_VALUE] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.SHOW_INPUT_METHOD] = null;
}
function defaultValueProcess(el: HTMLElement, value: string | number | boolean) {
  // TODO implement api
  el[HippyTextInputProps][NodeProps.DEFAULT_VALUE] = value;
}
function editableProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyTextInputProps][NodeProps.EDITABLE] = !!value;
  el.removeAttribute('disable');
}
function keyboardTypeProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyTextInputProps][NodeProps.KEY_BOARD_TYPE] = value;
  let type;
  switch (value) {
    case KeyboardType.numeric:
      type = 'number';
      break;
    case KeyboardType.password:
      type = 'password';
      break;
    case KeyboardType.email:
      type = 'email';
      break;
    case KeyboardType.phonePad:
      type = 'tel';
      break;
    case KeyboardType.search:
      type = 'search';
      break;
    default:
      type = 'text';
  }
  el.setAttribute('type', type);
}
function maxLengthProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyTextInputProps][NodeProps.MAX_LENGTH] = value;
  el.setAttribute('maxlength', el[HippyTextInputProps][NodeProps.MAX_LENGTH]);
}
function multilineProcess(el: HTMLElement, value: string | number | boolean) {
  // TODO implement api
  el[HippyTextInputProps][NodeProps.MULTILINE] = value;
}
function numberOfLinesProcess(el: HTMLElement, value: string | number | boolean) {
  // TODO implement api
  el[HippyTextInputProps][NodeProps.NUMBER_OF_LINES] = value;
}
function placeholderProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyTextInputProps][NodeProps.PLACEHOLDER] = value;
  if (typeof value === 'string') {
    el.setAttribute('placeholder', value);
  }
}
function placeholderTextColorProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  if (!nodeId) {
    return;
  }
  if (!el[HippyTextInputProps][NodeProps.PLACEHOLDER_TEXT_COLOR]) {
    el[HippyTextInputProps][NodeProps.PLACEHOLDER_TEXT_COLOR] = { value, style: buildStyleSheet() };
    el.setAttribute('class', `k${nodeId}`);
  }
  el[HippyTextInputProps][NodeProps.PLACEHOLDER_TEXT_COLOR].value = value;

  const sheet = el[HippyTextInputProps][NodeProps.PLACEHOLDER_TEXT_COLOR].style;
  setStyleCode(`.k${nodeId}::placeholder { color: ${value} }`, sheet);
}
function returnKeyTypeProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyTextInputProps][NodeProps.RETURN_KEY_TYPE] = value;
  if (typeof value === 'string') {
    el.setAttribute('entrykeyhit', value);
  }
}
function valueProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyTextInputProps][NodeProps.VALUE] = value;
  if (typeof value === 'string') {
    el.setAttribute('value', value);
  }
}
function autoFocusProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyTextInputProps][NodeProps.AUTO_FOCUS] = !!value;
  if (!!el[HippyTextInputProps][NodeProps.AUTO_FOCUS]) {
    el.setAttribute('autofocus', 'true');
    el.removeAttribute('autofocus');
  }
}
function onBlurProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyTextInputProps, NodeProps.ON_BLUR, nodeId);
}
function onChangeTextProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyTextInputProps, NodeProps.ON_CHANGE_TEXT, nodeId);
}
function onKeyboardWillShowProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyTextInputProps, NodeProps.ON_KEYBOARD_WILL_SHOW, nodeId);
}
function onEndEditingProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  // TODO implement api
  buildCallBackProps(el, !!value, HippyTextInputProps, NodeProps.ON_END_EDITING, nodeId);
}
function onLayoutProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyTextInputProps, NodeProps.ON_LAYOUT, nodeId);
}
function onSelectionChangeProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyTextInputProps, NodeProps.ON_SELECTION_CHANGE, nodeId);
}
function buildStyleSheet() {
  const style = document.createElement('style');
  document.head.appendChild(style);
  return style;
}
function setStyleCode(code: string, style: HTMLStyleElement) {
  if (style.childNodes.length > 0) {
    style.removeChild(style.childNodes[0]);
  }
  style.appendChild(document.createTextNode(code));
}
