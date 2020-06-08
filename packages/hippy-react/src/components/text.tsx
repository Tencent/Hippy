/* eslint-disable no-param-reassign */

import React from 'react';
import Style from '@localTypes/style';
import { LayoutableProps, ClickableProps } from '../types';
import { unicodeToChar } from '../utils';

interface TextProps extends LayoutableProps, ClickableProps {
  /**
   * Used to truncate the text with an ellipsis after computing the text layout,
   * including line wrapping, such that the total number of lines does not exceed this number.
   * This prop is commonly used with `ellipsizeMode`.
   */
  numberOfLines?: number;

  /**
   * Determines what the opacity of the wrapped view.
   */
  opacity: number;

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
  ellipsizeMode: 'head' | 'middle' | 'tail' | 'clip';
  children: number | string | string[];
  text?: string;
  style?: Style | Style[];
}

/**
 * A React component for displaying text.
 *
 * `Text` doesn't support nesting.
 * @noInheritDoc
 */
function Text({ style, ...nativeProps }: TextProps) {
  const nativeStyle: undefined | Style | Style[] = style;

  // Fill default color
  // Workaround for Android meet empty front color not render issue.
  if (style) {
    if (Array.isArray(style)) {
      if (style.filter(x => typeof x === 'object' && x).findIndex(s => s.color || s.colors) === -1) {
        (nativeStyle as Style[])[0].color = '#000';
      }
    } else if (typeof style === 'object') {
      if (style.color === undefined && style.colors === undefined) {
        (nativeStyle as Style).color = '#000';
      }
    }
  }

  nativeProps.text = ''; // Important: Text must recevie text props.
  if (typeof nativeProps.children === 'string') {
    nativeProps.text = unicodeToChar(nativeProps.children);
  } else if (typeof nativeProps.children === 'number') {
    nativeProps.text = unicodeToChar(nativeProps.children.toString());
  } else if (Array.isArray(nativeProps.children)) {
    const text = nativeProps.children
      .filter(t => typeof t === 'string' || typeof t === 'number')
      .join('');
    // FIXME: if Text is nested, all child components of this component need to be wrapped by Text
    if (text) {
      nativeProps.text = unicodeToChar(text);
      nativeProps.children = nativeProps.text;
    }
  }

  return (
    <p nativeName="Text" style={nativeStyle} {...nativeProps} />
  );
}
export default Text;
