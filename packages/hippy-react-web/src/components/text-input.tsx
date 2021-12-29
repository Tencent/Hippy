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

/* eslint-disable no-unneeded-ternary */

import React, { useImperativeHandle, useEffect, useRef } from 'react';

import { formatWebStyle } from '../adapters/transfer';
import useElementLayout from '../modules/use-element-layout';
import { StyleSheet } from '../types';
import { isFunc } from '../utils/validation';

/**
 * A foundational component for inputting text into the app via a keyboard. Props provide
 * configurability for several features, such as auto-correction, auto-capitalization,
 * placeholder text, and different keyboard types, such as a numeric keypad.
 * @noInheritDoc
 */
export interface TextInputProps {
  style?: StyleSheet;
  caretColor?: string;
  defaultValue?: string;
  editable?: boolean;
  keyboardType?: 'default' | 'numeric' | 'password' | 'email' | 'phone-pad';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
  placeholderTextColor?: string;
  placeholderTextColors?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  underlineColorAndroid?: string;
  value?: string;
  autoFocus?: boolean;
  onBlur?: any;
  onChangeText?: any;
  onKeyboardWillShow?: any;
  onEndEditing?: any;
  onLayout?: any;
  onSelectionChange?: any;
};
const TextInput: React.FC<TextInputProps> = React.forwardRef<any, TextInputProps>((props, ref) => {
  const {
    style = {}, underlineColorAndroid, placeholderTextColor, placeholderTextColors, caretColor,
    editable = true, keyboardType, multiline, onLayout, onChangeText, defaultValue, onEndEditing, onBlur,
    numberOfLines = 2, autoFocus,
  } = props;
  const hostRef: React.MutableRefObject<null | any> = useRef(null);
  useElementLayout(hostRef, onLayout);
  const copyProps = { ...props };
  const setStyle = (property: string, value: any) => {
    if (Array.isArray(style)) {
      style.push({ property: value });
    } else {
      style[property] = value;
    }
  };
  // set style prop
  if (underlineColorAndroid) {
    setStyle('underlineColorAndroid', underlineColorAndroid);
    delete copyProps.underlineColorAndroid;
  }
  if (placeholderTextColor || placeholderTextColors) {
    setStyle('placeholderTextColor', placeholderTextColor ? placeholderTextColor : placeholderTextColors);
    delete copyProps.placeholderTextColor;
    delete copyProps.placeholderTextColors;
  }
  if (caretColor) {
    setStyle('caret-color', caretColor);
    delete copyProps.caretColor;
  }

  // set keyboard type
  let inputType = 'text';
  if (keyboardType) {
    if (keyboardType) {
      if (keyboardType === 'numeric' || keyboardType === 'phone-pad') {
        inputType = 'tel';
      } else if (keyboardType === 'password') {
        inputType = 'password';
      } else if (keyboardType === 'email') {
        inputType = 'email';
      }
    }
  }

  // set component method
  const focus = () => {
    if (hostRef.current) {
      hostRef.current.focus();
    }
  };
  const blur = () => {
    if (hostRef.current) {
      hostRef.current.blur();
    }
  };
  const clear = () => {
    if (hostRef.current) {
      hostRef.current.value = '';
      if (isFunc(onChangeText)) {
        onChangeText('');
      }
    }
  };
  const setValue = (value: string) => {
    if (hostRef.current) {
      hostRef.current.value = String(value);
    }
  };
  const getValue = () => {
    if (hostRef.current) {
      return hostRef.current.value;
    }
    return '';
  };
  const hideInputMethod = () => {
    blur();
  };
  const showInputMethod = () => {
    focus();
  };

  useImperativeHandle(ref, () => ({
    focus,
    blur,
    clear,
    setValue,
    getValue,
    hideInputMethod,
    showInputMethod,
  }));

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
    if (autoFocus) {
      focus();
    }
  }, []);


  const onInputBlur = () => {
    if (typeof onEndEditing === 'function') {
      if (hostRef.current) {
        onEndEditing(hostRef.current.value);
      }
    }
    if (typeof onBlur === 'function') {
      onBlur();
    }
  };

  const onInputChante = (e: any) => {
    if (isFunc(onChangeText)) {
      onChangeText(e.target.value);
    }
  };

  const inputProps = {
    ...copyProps, ...{
      style: formatWebStyle(copyProps.style),
      type: inputType,
      readOnly: !editable,
      onChange: onInputChante,
      onBlur: onInputBlur,
      value: props.value,
    },
  };
  // delete input unspported prop
  delete inputProps.editable;
  delete inputProps.keyboardType;
  delete inputProps.onChangeText;
  delete inputProps.onEndEditing;
  delete inputProps.onSelectionChange;
  delete inputProps.onKeyboardWillShow;
  delete inputProps.returnKeyType;

  return (
    multiline
      ? <textarea ref={hostRef} cols={20} rows={numberOfLines} {...inputProps} />
      : <input ref={hostRef} {...inputProps} />
  );
});

TextInput.displayName = 'TextInput';
export default TextInput;
