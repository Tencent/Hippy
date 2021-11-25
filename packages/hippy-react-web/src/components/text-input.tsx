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

import React from 'react';
import { formatWebStyle } from '../adapters/transfer';
import applyLayout from '../adapters/apply-layout';

/**
 * A foundational component for inputting text into the app via a keyboard. Props provide
 * configurability for several features, such as auto-correction, auto-capitalization,
 * placeholder text, and different keyboard types, such as a numeric keypad.
 * @noInheritDoc
 */
export function TextInput(props_) {
  const {
    underlineColorAndroid,
    placeholderTextColor,
    placeholderTextColors,
  } = props_;
  let props = props_;
  if (underlineColorAndroid || placeholderTextColor || placeholderTextColors) {
    props = Object.assign({}, props);
    if (underlineColorAndroid) {
      if (props.style) {
        props.style.underlineColorAndroid = underlineColorAndroid;
      } else {
        props.style = {
          underlineColorAndroid,
        };
      }
      delete props.underlineColorAndroid;
    }
    if (placeholderTextColor) {
      if (props.style) {
        props.style.placeholderTextColor = placeholderTextColor;
      } else {
        props.style = {
          placeholderTextColor,
        };
      }
      delete props.placeholderTextColor;
    }
    if (placeholderTextColors) {
      if (props.style) {
        props.style.placeholderTextColors = placeholderTextColors;
      } else {
        props.style = {
          placeholderTextColors,
        };
      }
      delete props.placeholderTextColors;
    }
  }

  const { style, keyboardType, editable = true } = props;
  let inputType = 'text';
  if (keyboardType) {
    if (keyboardType === 'numeric' || keyboardType === 'phone-pad') {
      inputType = 'tel';
    } else if (keyboardType === 'password') {
      inputType = 'password';
    } else if (keyboardType === 'email') {
      inputType = 'email';
    }
  }
  const newProps = Object.assign({}, props, {
    style: formatWebStyle(style),
    type: inputType,
    readOnly: editable ? false : true,
  });

  if (typeof newProps.onChangeText === 'function') {
    const tempFunc = newProps.onChangeText;
    newProps.onChange = (e) => {
      tempFunc(e.currentTarget.value);
    };

    delete newProps.onChangeText;
  }
  delete newProps.keyboardType;
  delete newProps.onLayout;
  delete newProps.editable;

  const { multiline, ..._newProps } = newProps;
  return (
    multiline ? <textarea cols={20} rows={2} {..._newProps} /> : <input {..._newProps} />
  );
}

export default applyLayout(TextInput);
