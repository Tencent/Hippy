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

/* eslint-disable no-param-reassign */

import React from 'react';
import { LayoutableProps, ClickableProps } from '../types';
import { unicodeToChar } from '../utils';

export interface TextProps extends LayoutableProps, ClickableProps {
  /**
   * Used to truncate the text with an ellipsis after computing the text layout,
   * including line wrapping, such that the total number of lines does not exceed this number.
   * This prop is commonly used with `ellipsizeMode`.
   */
  numberOfLines?: number;

  /**
   * Determines what the opacity of the wrapped view.
   */
  opacity?: number;

  /**
   * When numberOfLines is set, this prop defines how text will be truncated.
   * numberOfLines must be set in conjunction with this prop.
   * This can be one of the following values:
   *
   * * head - The line is displayed so that the end fits in the container
   *          and the missing text at the beginning of the line is indicated by an ellipsis glyph.
   *          e.g., "...wxyz
   * * middle - The line is displayed so that the beginning and
   *            end fit in the container and the missing text in the middle is indicated
   *            by an ellipsis glyph.
   *            e.g., "ab...yz"
   * * tail - The line is displayed so that the beginning fits in the container
   *          and the missing text at the end of the line is indicated by an ellipsis glyph.
   *          e.g., "abcd..."
   * * clip - Lines are not drawn past the edge of the text container.
   *
   * The default is `tail`.
   */
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  children: number | string | string[] | React.ReactNode;
  text?: string;
  style?: HippyTypes.TextStyleProp;

  /**
   * When forbidUnicodeToChar is set，component will not convert unicode string to normal string
   */
  forbidUnicodeToChar?: boolean;
}

/**
 * A React component for displaying text.
 *
 * `Text` doesn't support nesting.
 * @noInheritDoc
 */
function forwardRef(
  { style, forbidUnicodeToChar, ...nativeProps }: TextProps,
  // eslint-disable-next-line max-len
  ref: string | React.ReactNode | ((instance: HTMLParagraphElement | null) => void) | React.RefObject<HTMLParagraphElement> | null | undefined,
) {
  const nativeStyle = style;

  // Fill default color
  // Workaround for Android meet empty front color not render issue.
  if (style) {
    if (Array.isArray(style)) {
      if (style.filter(x => typeof x === 'object' && x).findIndex(s =>
        // @ts-ignore FIXME: ts not omit False type for s
        s.color || s.colors) === -1) {
        (nativeStyle as HippyTypes.TextStyle[])[0].color = '#000';
      }
    } else if (typeof style === 'object') {
      if (style.color === undefined && style.colors === undefined) {
        (nativeStyle as HippyTypes.TextStyle).color = '#000';
      }
    }
  }

  // return char or origin text
  const getText = (children: string): string => (forbidUnicodeToChar ? children : unicodeToChar(children));

  // Important: Text must receive text props.
  nativeProps.text = '';
  if (typeof nativeProps.children === 'string') {
    nativeProps.text = getText(nativeProps.children);
  } else if (typeof nativeProps.children === 'number') {
    nativeProps.text = getText(nativeProps.children.toString());
  } else if (Array.isArray(nativeProps.children)) {
    const text = nativeProps.children
      .filter(t => typeof t === 'string' || typeof t === 'number')
      .join('');
    // FIXME: if Text is nested, all child components of this component need to be wrapped by Text
    if (text) {
      nativeProps.text = getText(text);
      nativeProps.children = nativeProps.text;
    }
  }

  return (
    // @ts-ignore
    <p ref={ref} nativeName="Text" style={nativeStyle} {...nativeProps} />
  );
}
forwardRef.displayName = 'Text';
export const Text = React.forwardRef(forwardRef);
Text.displayName = 'Text';
export default Text;
