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
import React from 'react';
import { formatWebStyle } from '../adapters/transfer';
import View from './view';

const styles = {
  initial: {
    borderWidth: 0,
    boxSizing: 'border-box',
    color: 'inherit',
    fontFamily: 'System',
    fontSize: 14,
    fontStyle: 'inherit',
    fontVariant: ['inherit'],
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    margin: 0,
    padding: 0,
    textDecorationLine: 'none',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  isInAParentTextFontStyle: {
    // inherit parent font styles
    fontFamily: 'inherit',
    fontSize: 'inherit',
    whiteSpace: 'inherit',
  },
  singleLineStyle: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
};


/**
 * A React component for displaying text.
 *
 * `Text` doesn't support nesting.
 * @noInheritDoc
 */
export class Text extends React.Component {
  private static childContextTypes = {
    isInAParentText: () => {},
  };

  public constructor(props) {
    super(props);
    this.state = {};
  }

  public getChildContext() {
    return { isInAParentText: true };
  }

  public render() {
    let { style } = this.props;
    const { isInAParentText } = this.context;
    const { numberOfLines, ellipsizeMode } = this.props;
    if (style) {
      style = formatWebStyle(style);
    }

    const textOverflow = ellipsizeMode === 'clip' ? 'clip' : 'ellipsis';
    const baseStyle = {
      textOverflow,
      overflow: 'hidden',
      display: numberOfLines > 1 ? '-webkit-box' : 'inline',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: numberOfLines ? numberOfLines.toString() : '0',
    };
    const newStyle = Object.assign({}, style, baseStyle);
    const newProps = Object.assign({}, this.props, {
      style: formatWebStyle([styles.initial,
        isInAParentText === true && styles.isInAParentText,
        newStyle,
        numberOfLines === 1 && Object.assign({}, styles.singleLineStyle, { textOverflow }),
        isInAParentText === true && { display: 'inline' },
      ]),
    });
    delete newProps.numberOfLines;
    delete newProps.ellipsizeMode;
    delete newProps.enableScale;

    if (isInAParentText) return <View {...newProps} />;
    return (
      <View {...newProps} />
    );
  }
}

export default Text;
