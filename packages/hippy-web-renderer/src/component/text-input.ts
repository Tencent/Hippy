/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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
  KeyboardType,
  NodeProps,
  ReturnKeyType,
  HippyCallBack,
  InnerNodeTag,
  UIProps,
  DefaultPropsProcess,
} from '../types';
import { convertHexToRgba } from '../common';
import { UIManagerModule } from '../module/ui-manager-module';
import { HippyWebView } from './hippy-web-view';

export class TextInput extends HippyWebView<HTMLInputElement | HTMLTextAreaElement> {
  private placeholderTextColorStyle;
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.TEXT_INPUT;
    this.dom = document.createElement('input');
    this.init();
  }

  public defaultStyle() {
    return { ...super.defaultStyle(), outline: 'none', fontFamily: '' };
  }

  public updateProps(data: UIProps, defaultProcess: DefaultPropsProcess) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
    }
    const newData = { ...data };
    if (data?.style?.placeholderTextColor) {
      newData.placeholderTextColor = convertHexToRgba(newData.style.placeholderTextColor);
      delete newData.style.placeholderTextColor;
    }
    if (data.style) {
      Object.assign(newData.style, this.borderStyleSupport(data.style));
    }
    defaultProcess(this, newData);
  }

  public borderStyleSupport(style: any) {
    let newBorderStyle = {};
    if (!style.borderTopWidth && !style.borderBottomWidth && !style.borderLeftWidth && !style.borderRightWidth) {
      newBorderStyle = {
        backgroundColor: '#ffffff00',
        border: '0px solid #000000',
        padding: '0px',
      };
    }
    return newBorderStyle;
  }

  public set defaultValue(value: string) {
    this.props[NodeProps.DEFAULT_VALUE] = value;
    // TODO to implement js logic
    if (!this.value || this.value.length === 0) {
      this.dom?.setAttribute('value', value);
    }
  }

  public get defaultValue() {
    return this.props[NodeProps.DEFAULT_VALUE] ?? '';
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
    if ((value && this.dom?.tagName === 'TEXTAREA') || (!value && this.dom?.tagName === 'INPUT')) {
      return;
    }
    this.props[NodeProps.MULTILINE] = value;
    this.changeToDomMode(value);
  }

  public get multiline() {
    return this.props[NodeProps.MULTILINE];
  }

  public set numberOfLines(value: number) {
    this.props[NodeProps.NUMBER_OF_LINES] = value;
    this.dom?.setAttribute('rows', String(value));
  }

  public get numberOfLines() {
    return this.props[NodeProps.NUMBER_OF_LINES];
  }

  public set placeholder(value: string) {
    this.props[NodeProps.PLACEHOLDER] = value;
    this.dom?.setAttribute('placeholder', value);
  }

  public get placeholder() {
    return this.props[NodeProps.PLACEHOLDER];
  }

  public set placeholderTextColor(value: string) {
    if (!this.placeholderTextColorStyle) {
      this.placeholderTextColorStyle = buildStyleSheet();
      this.dom?.setAttribute('class', `k${this.id}`);
    }
    this.props[NodeProps.PLACEHOLDER_TEXT_COLOR] = value;

    const sheet = this.placeholderTextColorStyle;
    setStyleCode(`.k${this.id}::placeholder { color: ${value} }`, sheet);
  }

  public get placeholderTextColor() {
    return this.props[NodeProps.PLACEHOLDER_TEXT_COLOR];
  }

  public set returnKeyType(value: ReturnKeyType) {
    this.props[NodeProps.RETURN_KEY_TYPE] = value;
    this.dom?.setAttribute('enterkeyhint', value);
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
    if (this.props[NodeProps.AUTO_FOCUS]) this.dom?.setAttribute('autofocus', 'true');
    if (!!this.props[NodeProps.AUTO_FOCUS]) this.dom?.removeAttribute('autofocus');
  }

  public get autoFocus() {
    return this.props[NodeProps.AUTO_FOCUS];
  }

  public onBlur(event) {
    this.props[NodeProps.ON_BLUR]
      && this.context.sendUiEvent(this.id, NodeProps.ON_BLUR, event);
  }

  public onChangeText(value) {
    this.props[NodeProps.ON_CHANGE_TEXT]
      && this.context.sendUiEvent(this.id, NodeProps.ON_CHANGE_TEXT, value);
  }

  public onEndEditing(value) {
    this.props[NodeProps.ON_END_EDITING]
      && this.context.sendUiEvent(this.id, NodeProps.ON_END_EDITING, value);
  }

  public onSelectionChange(value) {
    this.props[NodeProps.ON_SELECTION_CHANGE]
      && this.context.sendUiEvent(this.id, NodeProps.ON_SELECTION_CHANGE, value);
  }

  public blurTextInput() {
    this.dom?.blur();
  }

  public focusTextInput() {
    this.dom?.focus();
  }

  public clear() {
    if (!this.dom) {
      return;
    }
    this.dom.value = '';
  }

  public getValue(callBack: HippyCallBack) {
    callBack.resolve({ text: this.dom?.value ?? '' });
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

  private init() {
    document.addEventListener('selectionchange', this.handleSelection.bind(this));
    this.dom!.addEventListener('input', this.handleInput.bind(this));
    this.dom!.addEventListener('blur', this.handleBlur.bind(this));
    this.dom!.addEventListener('keypress', this.handleKeyPress.bind(this));
  }

  private async changeToDomMode(isMultiline: boolean) {
    const uiManagerModule = this.context.getModuleByName('UIManagerModule') as UIManagerModule;
    let isMounted = false;
    if (this.dom?.parentNode) {
      isMounted = true;
    }
    if (isMounted) {
      uiManagerModule.viewDelete(this);
    }
    if (isMultiline) {
      this.dom = document.createElement('textarea');
    } else {
      this.dom = document.createElement('input');
    }
    this.init();
    if (isMounted) {
      uiManagerModule.viewInit(this, this.props, this.index);
    } else {
      uiManagerModule.updateViewProps(this, this.props);
    }
  }

  private handleKeyPress(event) {
    if (event.code === 'Enter' && !this.multiline) {
      this.onEndEditing(null);
    }
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
    if (this.value.length === 0 && this.defaultValue) {
      this.onChangeText({
        text: this.dom?.value,
      });
      this.setValue(this.defaultValue);
    }
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
