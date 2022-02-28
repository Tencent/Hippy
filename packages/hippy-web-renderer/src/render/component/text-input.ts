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
import { KeyboardType, NodeProps, NodeTag, ReturnKeyType } from '../../types';
import { callBackUIFunctionToHippy, dispatchEventToHippy } from '../common';
import { View } from './view';

export  class TextInput extends View<HTMLInputElement> {
  public constructor(id: number, pId: number) {
    super(id, pId);
    this.tagName = NodeTag.TEXT_INPUT;
    this.dom = document.createElement('input');
    this.init();
  }

  public set defaultValue(value: string) {
    this.props[NodeProps.DEFAULT_VALUE] = value;
    // TODO to implement js logic
  }

  public get defaultValue() {
    return this.props[NodeProps.DEFAULT_VALUE];
  }

  public set editable(value: boolean) {
    this.props[NodeProps.EDITABLE] = value;
    if (value) {
      this.dom?.removeAttribute('disabled');
    } else {
      this.dom?.setAttribute('disabled', 'disabled');
    }
  }

  public get editable() {
    return this.props[NodeProps.EDITABLE];
  }

  public set keyboardType(value: KeyboardType) {
    this.props[NodeProps.KEY_BOARD_TYPE] = value;
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
    this.dom?.setAttribute('type', type);
  }

  public get keyboardType() {
    return this.props[NodeProps.KEY_BOARD_TYPE];
  }

  public set maxLength(value: number) {
    this.props[NodeProps.MAX_LENGTH] = value;
    this.dom?.setAttribute('maxlength', String(value));
  }

  public get maxLength() {
    return this.props[NodeProps.MAX_LENGTH];
  }

  public set multiline(value: boolean) {
    this.props[NodeProps.MULTILINE] = value;
    // TODO to implement
  }

  public get multiline() {
    return this.props[NodeProps.MULTILINE];
  }

  public set numberOfLines(value: number) {
    this.props[NodeProps.NUMBER_OF_LINES] = value;
    // TODO to implement
  }

  public get numberOfLines() {
    return this.props[NodeProps.NUMBER_OF_LINES] ;
  }

  public set placeholder(value: string) {
    this.props[NodeProps.PLACEHOLDER] = value;
    this.dom?.setAttribute('placeholder', value);
  }

  public get placeholder() {
    return this.props[NodeProps.PLACEHOLDER];
  }

  public set placeholderTextColor(value: string) {
    this.props[NodeProps.PLACEHOLDER_TEXT_COLOR] = value;
    if (!this.props[NodeProps.PLACEHOLDER_TEXT_COLOR]) {
      this.props[NodeProps.PLACEHOLDER_TEXT_COLOR] = { value, style: buildStyleSheet() };
      this.dom?.setAttribute('class', `k${this.id}`);
    }
    this.props[NodeProps.PLACEHOLDER_TEXT_COLOR].value = value;

    const sheet = this.props[NodeProps.PLACEHOLDER_TEXT_COLOR].style;
    setStyleCode(`.k${this.id}::placeholder { color: ${value} }`, sheet);
  }

  public get placeholderTextColor() {
    return this.props[NodeProps.PLACEHOLDER_TEXT_COLOR];
  }

  public set returnKeyType(value: ReturnKeyType) {
    this.props[NodeProps.RETURN_KEY_TYPE] = value;
    this.dom?.setAttribute('entrykeyhit', value);
  }

  public get returnKeyType() {
    return this.props[NodeProps.RETURN_KEY_TYPE];
  }

  public set value(value: string) {
    this.props[NodeProps.VALUE] = value;
    this.dom?.setAttribute('value', value);
  }

  public get value() {
    return this.props[NodeProps.VALUE];
  }

  public set autoFocus(value: boolean) {
    this.props[NodeProps.AUTO_FOCUS] = value;
    if (this.props[NodeProps.AUTO_FOCUS])  this.dom?.setAttribute('autofocus', 'true');
    if (!!this.props[NodeProps.AUTO_FOCUS])  this.dom?.removeAttribute('autofocus');
  }

  public get autoFocus() {
    return this.props[NodeProps.AUTO_FOCUS];
  }

  public onBlur(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_BLUR, event);
  }

  public onChangeText(value) {
    dispatchEventToHippy(this.id, NodeProps.ON_CHANGE_TEXT, value);
  }

  public onEndEditing(value) {
    dispatchEventToHippy(this.id, NodeProps.ON_END_EDITING, value);
  }

  public onSelectionChange(value) {
    dispatchEventToHippy(this.id, NodeProps.ON_SELECTION_CHANGE, value);
  }

  public blur() {
    this.dom?.blur();
  }

  public focus() {
    this.dom?.focus();
  }

  public clear() {
    if (!this.dom) {
      return;
    }
    this.dom.value = '';
  }

  public getValue(callBackId) {
    callBackUIFunctionToHippy(callBackId, { text: this.dom?.value ?? '' }, true);
  }

  public hideInputMethod() {
    this.dom?.blur();
    // TODO to implement, page will scroll when keyboard show
  }

  public setValue(value: string) {
    if (!this.dom) {
      return;
    }
    this.dom.value = value;
  }

  public showInputMethod() {
    this.dom?.focus();
  }

  public async beforeRemove() {
    await super.beforeRemove();
    document.removeEventListener('selectionchange', this.handleSelection);
    this.dom?.removeEventListener('input', this.handleInput);
    this.dom?.removeEventListener('blur', this.handleBlur);
  }

  private init() {
    document.addEventListener('selectionchange', this.handleSelection);
    this.dom!.addEventListener('input', this.handleInput);
    this.dom!.addEventListener('blur', this.handleBlur);
  }
  private handleSelection() {
    const cacheLastSelection = [0, 0];
    const selectionObj = window.getSelection();
    if (document.activeElement === this.dom && this.dom && selectionObj) {
      // TODO can't process text repeat
      const index = this.dom!.value.indexOf(selectionObj.toString());
      if (
        index === cacheLastSelection[0]
        && cacheLastSelection[1] === index + selectionObj.toString().length
      ) return;
      cacheLastSelection[0] = index;
      cacheLastSelection[1] = index + selectionObj.toString().length;
      this.onSelectionChange(buildSelectEvent(index, index + selectionObj.toString().length));
    }
  }
  private handleInput() {
    this.onChangeText({
      text: this.dom?.value,
    });
  }
  private handleBlur() {
    this.onBlur(null);
  }
}
function buildStyleSheet() {
  const style = document.createElement('style');
  document.head.appendChild(style);
  return style;
}
function setStyleCode(code: string, style: HTMLStyleElement) {
  if (style.childNodes.length > 0) style.removeChild(style.childNodes[0]);
  style.appendChild(document.createTextNode(code));
}
function buildSelectEvent(start: number, end: number) {
  return { nativeEvent: { selection: { start, end } } };
}
