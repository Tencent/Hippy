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

/* eslint-disable no-underscore-dangle */

import React from 'react';
import { LayoutableProps, ClickableProps, Platform } from '../types';
import { callUIFunction } from '../modules/ui-manager-module';
import { Device } from '../native';
import Element from '../dom/element-node';
import { isRTL } from '../utils/i18n';

interface KeyboardWillShowEvent {
  keyboardHeight: number;
}

export interface TextInputProps extends LayoutableProps, ClickableProps {
  /**
   * The value to show for the text input. TextInput is a controlled component,
   * which means the native value will be forced to match this value prop if provided.
   * For most uses, this works great, but in some cases this may cause flickering
   * - one common cause is preventing edits by keeping value the same.
   * In addition to setting the same value, either set editable={false},
   * or set/update maxLength to prevent unwanted edits without flicker.
   */
  value?: string;

  /**
   * Provides an initial value that will change when the user starts typing.
   * Useful for use-cases where you do not want to deal with listening to events
   * and updating the value prop to keep the controlled state in sync.
   */
  defaultValue?: string;

  /**
   * If `false`, text is not editable.
   *
   * Default: true
   */
  editable?: boolean;

  /**
   * Determines which keyboard to open, e.g.`numeric`.
   *
   * The following values work across platforms:
   * * `default`
   * * `number-pad`
   * * `decimal-pad`
   * * `numeric`
   * * `email-address`
   * * `phone-pad`
   * * `search`
   */
  keyboardType?: 'default' | 'numeric' | 'password' | 'email' | 'phone-pad' | 'search';

  /**
   * Determines how the return key should look.
   *
   * The following values work across platforms:
   * * `done`
   * * `go`
   * * `next`
   * * `search`
   * * `send`
   */
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';

  /**
   * Limits the maximum number of characters that can be entered.
   * Use this instead of implementing the logic in JS to avoid flicker.
   */
  maxLength?: number;

  /**
   * If `true`, the text input can be multiple lines. The default value is `false`.
   * It is important to note that this aligns the text to the top on iOS,
   * and centers it on Android. Use with textAlignVertical set to top for the same behavior
   * in both platforms.
   */
  multiline?: boolean;

  /**
   * Sets the number of lines for a TextInput.
   * Use it with multiline set to true to be able to fill the lines.
   */
  numberOfLines?: number;

  /**
   * If `true`, focuses the input on `componentDidMount`.
   *
   * Default: false
   */
  autoFocus?: boolean;

  /**
   * The color of the `TextInput` underline.
   */
  underlineColorAndroid?: string;

  /**
   * The string that will be rendered before text input has been entered.
   */
  placeholder?: string;

  /**
   * The text color of the placeholder string.
   */
  placeholderTextColor?: string;

  /**
   * The text colors array of the placeholder string.
   */
  placeholderTextColors?: string[];

  style?: HippyTypes.TextStyleProp;

  /**
   * Callback that is called when the text input is blurred.
   */
  onBlur?: () => void;

  /**
   * Callback that is called when text input ends.
   */
  onEndEditing?: () => void;

  /**
   * Callback that is called when the text input's text changes.
   * Changed text is passed as a single string argument to the callback handler.
   *
   * @param {string} text - Text content.
   */
  onChangeText?: (text: string) => void;

  /**
   * Callback that is called when the text input's content size changes.
   *
   * @param {Object} evt - Content size change event data.
   * @param {number} evt.nativeEvent.contentSize.width - Width of content.
   * @param {number} evt.nativeEvent.contentSize.height - Height of content.
   */
  onContentSizeChange?: (evt: { nativeEvent: {
    contentSize: { width: number, height: number }
  } }) => void;

  /**
   * Callback that is called when keyboard popup
   *
   * @param {Object} evt - Keyboard will show event data.
   * @param {number} evt.keyboardHeight - Keyboard height.
   */
  onKeyboardWillShow?: (evt: KeyboardWillShowEvent) => void;

  /**
   * Callback that is called when the text input selection is changed.
   *
   * @param {Object} evt -  Selection change event data.
   * @param {number} evt.nativeEvent.selection.start - Start index of selection
   * @param {number} evt.nativeEvent.selection.end - End index of selection.
   */
  onSelectionChange?: (evt: { nativeEvent: { selection: { start: number, end: number }} }) => void;

}

const propsMap = {
  caretColor: 'caret-color',
};

/**
 * A foundational component for inputting text into the app via a keyboard. Props provide
 * configurability for several features, such as auto-correction, auto-capitalization,
 * placeholder text, and different keyboard types, such as a numeric keypad.
 * @noInheritDoc
 */
export class TextInput extends React.Component<TextInputProps, {}> {
  private instance: HTMLDivElement | Element | null = null;
  private _lastNativeText?: string = '';

  public constructor(props: TextInputProps) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onKeyboardWillShow = this.onKeyboardWillShow.bind(this);
  }

  public componentDidMount() {
    const { value: _lastNativeText, autoFocus } = this.props;
    this._lastNativeText = _lastNativeText;
    if (autoFocus) {
      this.focus();
    }
  }

  /**
   * @ignore
   */
  public componentWillUnmount() {
    this.blur();
  }

  /**
   * Get the content of `TextInput`.
   *
   * @returns {Promise<string>}
   */
  public getValue(): Promise<string> {
    return new Promise((resolve) => {
      callUIFunction(this.instance as Element, 'getValue', (res: HippyTypes.TextInputEvent) => resolve(res.text));
    });
  }

  /**
   * Set the content of `TextInput`.
   *
   * @param {string} value - New content of TextInput
   * @returns {string}
   */
  public setValue(value: string): string {
    callUIFunction(this.instance as Element, 'setValue', [value]);
    return value;
  }

  /**
   * Make the `TextInput` focused.
   */
  public focus() {
    callUIFunction(this.instance as Element, 'focusTextInput', []);
  }

  /**
   * Make the `TextInput` blurred.
   */
  public blur() {
    callUIFunction(this.instance as Element, 'blurTextInput', []);
  }

  /**
   * Get the focus status of `TextInput`
   *
   * @returns {Promise<boolean>}
   */
  public isFocused(): Promise<boolean> {
    return new Promise((resolve) => {
      callUIFunction(this.instance as Element, 'isFocused', (res: any) => resolve(res.value));
    });
  }

  /**
   * Show input method selection dialog.
   * @deprecated
   */
  public showInputMethod() {
    // noop
  }

  /**
   * Hide the input method selection dialog.
   * @deprecated
   */
  public hideInputMethod() {
    // noop
  }

  /**
   * Clear the content of `TextInput`
   */
  public clear() {
    callUIFunction(this.instance as Element, 'clear', []);
  }

  /**
   * @ignore
   */
  public render() {
    const nativeProps = { ...this.props };
    ['underlineColorAndroid', 'placeholderTextColor', 'placeholderTextColors', 'caretColor', 'caret-color']
      .forEach((originalProp) => {
        let prop = originalProp;
        const value = this.props[originalProp];
        if (typeof this.props[originalProp] === 'string') {
          if (propsMap[originalProp]) {
            prop = propsMap[originalProp];
          }
          if (Array.isArray(nativeProps.style)) {
            nativeProps.style.push({
              [prop]: value,
            });
          } else if (nativeProps.style && typeof nativeProps.style === 'object') {
            nativeProps.style[prop] = value;
          } else {
            nativeProps.style = {
              [prop]: value,
            };
          }
          delete nativeProps[originalProp];
        }
      });

    if (isRTL()) {
      if (!nativeProps.style) {
        nativeProps.style = {
          textAlign: 'right',
        };
      } else if (typeof nativeProps.style === 'object' && !Array.isArray(nativeProps.style)) {
        if (!nativeProps.style.textAlign) {
          nativeProps.style.textAlign = 'right';
        }
      }
    }

    return (
      // @ts-ignore
      <div
        nativeName="TextInput"
        {...nativeProps}
        ref={(ref) => {
          this.instance = ref;
        }}
        onChangeText={this.onChangeText}
        onKeyboardWillShow={this.onKeyboardWillShow}
      />
    );
  }

  private onChangeText(e: HippyTypes.TextInputEvent) {
    const { onChangeText } = this.props;
    if (typeof onChangeText === 'function') {
      onChangeText(e.text);
    }

    /**
     *  calling `this.props.onChange` or `this.props.onChangeText`
     *  may clean up the input itself. Exits here.
     */
    if (!this.instance) return;
    this._lastNativeText = e.text;
  }

  private onKeyboardWillShow(originEvt: KeyboardWillShowEvent) {
    const { onKeyboardWillShow } = this.props;
    const evt = originEvt;
    if (Device.platform.OS === Platform.android) {
      evt.keyboardHeight /= Device.screen.scale;
    }
    if (typeof onKeyboardWillShow === 'function') {
      onKeyboardWillShow(evt);
    }
  }
}

export default TextInput;
