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

// @ts-nocheck
import React, { createContext, useRef } from 'react';
import { normalizeStyle, formatWebStyle } from '../adapters/transfer';
import { LayoutableProps, TouchableProps, ClickableProps } from '../types';
import useResponderEvents from '../modules/use-responder-events';
import useElementLayout from '../modules/use-element-layout';
import { DEFAULT_CONTAINER_STYLE } from '../constants';

const baseTextStyle = {
  ...DEFAULT_CONTAINER_STYLE,
  backgroundColor: 'transparent',
  border: '0 solid black',
  boxSizing: 'border-box',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  textAlign: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
};

const styles = {
  text: {
    ...baseTextStyle,
  },
  textHasParent: {
    ...baseTextStyle,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    whiteSpace: 'inherit',
  },
  singleText: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
  },
  multiText: {
    display: '-webkit-box',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitBoxOrient: 'vertical',
  },
};

const TextAncestorContext = createContext(false);

interface TextProps extends LayoutableProps, TouchableProps, ClickableProps {
  style?: HippyTypes.TextStyleProp;
  numberOfLines?: number;
  opacity?: number;
  ellipsizeMode?: 'clip' | 'ellipsis';
}

/**
 * A React component for displaying text.
 *
 * `Text` doesn't support nesting.
 * @noInheritDoc
 */
const Text: React.FC<TextProps> = React.forwardRef((props: TextProps, ref) => {
  const hasTextAncestor = React.useContext(TextAncestorContext);
  const {
    style = {},
    ellipsizeMode = 'ellipsis',
    onTouchDown,
    onTouchEnd,
    onTouchCancel,
    onTouchMove,
    onLayout,
    numberOfLines,
    enableScale,
    opacity,
    ...restProps
  } = props;

  const hostRef: any = useRef(null);
  React.useImperativeHandle(ref, () => hostRef.current, [hostRef.current]);

  useResponderEvents(hostRef, { onTouchDown, onTouchEnd, onTouchCancel, onTouchMove });
  useElementLayout(hostRef, onLayout);

  const newProps = { ...restProps };
  const nStyle = normalizeStyle(style);

  // Align with the implementation of hippy
  if (typeof nStyle.color === 'undefined' && !nStyle.colors?.length) {
    baseTextStyle.color = 'black';
  }
  let newStyle: HippyTypes.Style = {};
  if (hasTextAncestor) {
    newStyle = { ...newStyle, ...styles.textHasParent };
  } else {
    newStyle = { ...newStyle, ...styles.text };
  }
  if (numberOfLines === 1) {
    newStyle = { ...newStyle, ...styles.singleText };
  } else {
    newStyle = {
      ...newStyle,
      ...styles.multiText,
      WebkitLineClamp: numberOfLines > 1 ? numberOfLines : 1,
    };
  }
  // Ellipsis should be set to 'display' not equal to 'flex'
  if (typeof newStyle.display === 'undefined' && typeof nStyle.display === 'undefined' && numberOfLines > 0) {
    newStyle.display = 'inline-block';
  }

  if (opacity) {
    newStyle.opacity = opacity;
  }
  newProps.style = formatWebStyle({ ...newStyle, ...nStyle, textOverflow: ellipsizeMode });

  return hasTextAncestor ? (
    <span data-1={String(hasTextAncestor)} ref={hostRef} {...newProps} />
  ) : (
    <TextAncestorContext.Provider value={true}>
      <span ref={hostRef} data-1={String(hasTextAncestor)} {...newProps} />
    </TextAncestorContext.Provider>
  );
});
Text.displayName = 'Text';
export {
  Text,
  TextProps,
};

export default Text;
