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

import React from 'react';
import Style from '@localTypes/style';
import { FocusEvent } from '@localTypes/event';
import { Fiber } from '@hippy/react-reconciler';
import { LayoutableProps, ClickableProps, TouchableProps } from '../types';

interface ViewProps extends LayoutableProps, ClickableProps, TouchableProps {
  /**
   * Overrides the text that's read by the screen reader when the user interacts with the element.
   * By default, the label is constructed by traversing all the children and accumulating
   * all the Text nodes separated by space.
   */
  accessibilityLabel?: string;

  /**
   * When `true`, indicates that the view is an accessibility element.
   * By default, all the touchable elements are accessible.
   */
  accessible?: boolean;

  /**
   * Views that are only used to layout their children or otherwise don't draw anything may be
   * automatically removed from the native hierarchy as an optimization.
   * Set this property to `false` to disable this optimization
   * and ensure that this `View` exists in the native view hierarchy.
   */
  collapsable?: false;

  /**
   * Specifies what should happen if content overflows an container's box.
   *
   * Default: iOS is 'visible', android is 'hidden'.
   */
  overflow?: 'visible' | 'hidden';
  focusable?: boolean;
  requestFocus?: boolean;
  nextFocusDownId?: string | Fiber;
  nextFocusUpId?: string | Fiber;
  nextFocusLeftId?: string | Fiber;
  nextFocusRightId?: string | Fiber;
  style?: Style;

  /**
   * The focus event occurs when the component is focused.
   *
   * @param {Object} evt - Focus event data
   * @param {boolean} evt.focus - Focus status
   */
  onFocus?(evt: FocusEvent): void;
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
class View extends React.Component<ViewProps, {}> {
  render() {
    const { collapsable, style = {}, ...nativeProps } = this.props;
    const nativeStyle: Style = style;
    if (typeof collapsable === 'boolean') {
      nativeStyle.collapsable = collapsable;
    }
    return (
    // @ts-ignore
      <div nativeName="View" style={nativeStyle} {...nativeProps} />
    );
  }
}

export default View;
