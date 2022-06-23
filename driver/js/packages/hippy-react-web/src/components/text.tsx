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
import { formatWebStyle } from '../adapters/transfer';
import { LayoutEvent } from '../types';
import useResponderEvents from '../modules/use-responder-events';
import useElementLayout from '../modules/use-element-layout';
import { TouchEvent } from '../modules/use-responder-events/types';
import { DEFAULT_CONTAINER_STYLE } from '../constants';

const baseTextStyle = {
  ...DEFAULT_CONTAINER_STYLE,
  backgroundColor: 'transparent',
  border: '0 solid black',
  boxSizing: 'border-box',
  color: 'black',
  font: '14px System',
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

interface TextProps {
  style?: HippyTypes.Style | HippyTypes.Style[];
  numberOfLines?: number;
  opacity?: number;
  ellipsizeMode?: 'clip' | 'ellipsis';
  onLayout: (e: LayoutEvent) => void;
  onTouchDown?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onTouchCancel?: (e: TouchEvent) => void;
}

/**
 * A React component for displaying text.
 *
 * `Text` doesn't support nesting.
 * @noInheritDoc
 */
const Text: React.FC<TextProps> = React.forwardRef((props: TextProps, ref) => {
  const hasTextAncestor = React.useContext(TextAncestorContext);
  const { style = {}, numberOfLines = 1, ellipsizeMode = 'ellipsis'  } = props;

  const hostRef: any = useRef(null);
  React.useImperativeHandle(ref, () => hostRef.current, [hostRef.current]);

  const { onTouchDown, onTouchEnd, onTouchCancel, onTouchMove } = props;
  useResponderEvents(hostRef, { onTouchDown, onTouchEnd, onTouchCancel, onTouchMove });
  useElementLayout(hostRef, props.onLayout);

  const newProps = { ...props };
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

  if (props.opacity) {
    newStyle.opacity = props.opacity;
  }
  const composedStyle = Array.isArray(style) ? [newStyle, ...style] : { ...newStyle, ...style };
  const formatedStyle = formatWebStyle(composedStyle);
  newProps.style = formatWebStyle({ ...formatedStyle, textOverflow: ellipsizeMode });

  // delete span unsupported props
  delete newProps.ellipsizeMode;
  delete newProps.numberOfLines;
  delete newProps.onLayout;
  delete newProps.onTouchDown;
  delete newProps.onTouchMove;
  delete newProps.onTouchEnd;
  delete newProps.onTouchCancel;
  delete newProps.enableScale;

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
