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

  const { style, keyboardType } = props;
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
  return (
    <input {...newProps} />
  );
}

export default applyLayout(TextInput);
