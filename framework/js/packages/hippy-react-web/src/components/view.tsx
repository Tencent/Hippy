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
import { formatWebStyle } from '../adapters/transfer';
import applyLayout from '../adapters/apply-layout';

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

/**
 * The most fundamental component for building a UI, `View` is a container that supports layout
 * with flexbox, style, some touch handling, and accessibility controls. `View` maps directly to
 * the native view equivalent on whatever platform React Native is running on, whether that is
 * a `UIView`, `<div>`, `android.view`, etc.
 *
 * View is designed to be nested inside other views and can have 0 to many children of any type.
 * @noInheritDoc
 */
class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { style, withRef } = this.props;
    const newStyle = formatWebStyle(style);
    const finalStyle = Object.assign({}, styles.root, newStyle);
    const newProps = Object.assign({}, this.props, {
      style: finalStyle,
    });
    const accessibilityLabelValue = newProps.accessibilityLabel;
    delete newProps.onPressIn;
    delete newProps.onPressOut;
    delete newProps.onLayout;
    delete newProps.accessibilityLabel;

    return (
      <div {...newProps} ref={withRef} aria-label={accessibilityLabelValue} />
    );
  }
}

export default applyLayout(View);
export {
  View,
};
