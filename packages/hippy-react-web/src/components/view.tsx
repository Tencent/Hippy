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

import React, { useEffect, useRef } from 'react';
import { formatWebStyle } from '../adapters/transfer';
import useResponderEvents from '../modules/responder-events';
import useElementLayout from '../modules/use-element-layout';
import { Touch } from '../modules/responder-events/responder-event-types';
import { LayoutEvent, StyleSheet } from '../types';

const styles = {
  root: {
    alignItems: 'stretch',
    borderWidth: 0,
    borderStyle: 'solid',
    boxSizing: 'border-box',
    display: 'flex',
    flexBasis: 'auto',
    flexDirection: 'column',
    flexShrink: 0,
    margin: 0,
    padding: 0,
    position: 'relative',
    minHeight: 0,
    minWidth: 0,
  },
};

export interface ViewProps {
  ref?: any;
  accessible?: boolean;
  accessibilityLabel?: string;
  style?: StyleSheet;
  opacity?: number;
  overflow?: 'visible' | 'hidden';
  className?: string;
  onScroll?: (e: any) => void;
  onLayout?: (e: LayoutEvent) => void;
  onAttachedToWindow?: Function;
  onTouchDown?: (e: Touch) => void;
  onTouchMove?: (e: Touch) => void;
  onTouchEnd?: (e: Touch) => void;
  onTouchCancel?: (e: Touch) => void;
}

/**
 * The most fundamental component for building a UI, `View` is a container that supports layout
 * with flexbox, style, some touch handling, and accessibility controls. `View` maps directly to
 * the native view equivalent on whatever platform React Native is running on, whether that is
 * a `UIView`, `<div>`, `android.view`, etc.
 *
 * View is designed to be nested inside other views and can have 0 to many children of any type.
 * @noInheritDoc
 */
const View: React.FC<ViewProps> = React.forwardRef((props, ref) => {
  const { style, opacity, overflow, onAttachedToWindow } = props;
  if (Array.isArray(style)) {
    if (opacity) {
      style.push({ opacity });
    }
    if (overflow) {
      style.push({ overflow });
    }
  } else {
    if (opacity) {
      style.opacity = opacity;
    }
    if (overflow) {
      style.overflow = overflow;
    }
  }
  useEffect(() => {
    if (typeof onAttachedToWindow === 'function') {
      onAttachedToWindow();
    }
  }, []);
  const hostRef = ref ? ref : useRef(null);
  const newStyle = formatWebStyle(style);
  const finalStyle = Object.assign({}, styles.root, newStyle);
  const newProps = Object.assign({}, props, {
    style: finalStyle,
  });
  const { onTouchDown, onTouchEnd, onTouchCancel, onTouchMove, onScroll } = props;
  useResponderEvents(hostRef, { onTouchDown, onTouchEnd, onTouchCancel, onTouchMove, onScroll });
  useElementLayout(hostRef, props.onLayout);
  const accessibilityLabelValue = newProps.accessibilityLabel;
  // delete unsupported props
  delete newProps.onAttachedToWindow;
  delete newProps.onTouchCancel;
  delete newProps.onTouchEnd;
  delete newProps.onTouchMove;
  delete newProps.onTouchDown;
  delete newProps.accessible;
  delete newProps.accessibilityLabel;

  return (
    <div {...newProps} ref={hostRef} aria-label={accessibilityLabelValue} />
  );
});

export {
  View,
};
export default View;
