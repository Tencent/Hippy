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

/* eslint-disable no-bitwise */

import Animation from '../modules/animation';
import AnimationSet from '../modules/animation-set';
import normalizeValue from './normalize-value';

const borderSpecialPropsArray = ['borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth'];
const borderPropsArray = ['borderWidth'];
const displayValue = typeof window !== 'undefined' && !('flex' in window.document.body.style) ? '-webkit-flex' : 'flex';

function hasOwnProperty(obj: Object, name: string | number | symbol) {
  return Object.prototype.hasOwnProperty.call(obj, name);
}

// { scale: 2 } => 'scale(2)'
// { translateX: 20 } => 'translateX(20px)'
function mapTransform(transform: any) {
  const type = Object.keys(transform)[0];
  const value = normalizeValue(type, transform[type]);
  return `${type}(${value})`;
}

function resolveTransform(transformArray: any[]): any {
  let transform = '';
  if (Array.isArray(transformArray)) {
    if (transformArray.length > 1) {
      transform = transformArray.map(mapTransform)
        .join(' ');
    } else {
      const transformItem = transformArray[0];
      const type = Object.keys(transformItem)[0];
      const value = normalizeValue(type, transformItem[type]);
      // Animation和AnimationSet只支持一个transform属性
      if (value) {
        if ((value as any) instanceof Animation) {
          transform = {
            type,
            animation: value,
          };
        } else if ((value as any) instanceof AnimationSet
          && (value as Element).children
          && (value as Element).children.length > 0
        ) {
          transform = {
            type,
            animation: (value as Element).children[0].animation,
            animationSet: value,
          };
        } else {
          transform = `${type}(${value})`;
        }
      }
    }
  } else {
    transform = transformArray;
  }
  return transform;
}

function is8DigitHexColor(color: string) {
  return color && color.length === 9 && color[0] === '#';
}

function transformHexToRgba(color: number) {
  const red = (color & 0xff000000) >>> 24;
  const green = (color & 0x00ff0000) >> 16;
  const blue = (color & 0x0000ff00) >> 8;
  const alpha = (color & 0x000000ff);
  return `rbga(${red},${green},${blue},${alpha})`;
}

function isNumeric(num: unknown) {
  if (typeof num === 'number' && Number.isFinite(num)) {
    return true;
  }
  if (typeof num === 'string') {
    return !Number.isNaN(Number(num)) && !Number.isNaN(parseFloat(num));
  }
  return false;
}

function toPx(num: unknown) {
  return isNumeric(num) ? `${num}px` : num;
}

interface WebStyle {
  borderStyle?: any,
  marginHorizontal?: any
  marginLeft?: any,
  marginRight?: any,
  marginTop?: any,
  marginBottom?: any,
  paddingLeft?: any,
  paddingRight?: any,
  paddingTop?: any,
  paddingBottom?: any,
  marginVertical?: any,
  paddingHorizontal?: any,
  paddingVertical?: any,
  color?: any
  colors?: any,
  borderColor?: any,
  borderColors?: any,
  borderTopColor?: any,
  borderTopColors?: any,
  borderBottomColor?: any,
  borderBottomColors?: any,
  borderLeftColor?: any,
  borderLeftColors?: any,
  borderRightColor?: any,
  borderRightColors?: any,
  backgroundColor?: any,
  backgroundColors?: any,
  [props: string]: any
}

function handleBoxStyle(webStyle: WebStyle) {
  // handle border
  borderPropsArray.every((borderProp) => {
    if (hasOwnProperty(webStyle, borderProp)) {
      // eslint-disable-next-line no-param-reassign
      webStyle.borderStyle = 'solid';
      return false;
    }
    return true;
  });

  // handle marginHorizontal
  if (hasOwnProperty(webStyle, 'marginHorizontal')) {
    const val = toPx(webStyle.marginHorizontal);
    /* eslint-disable no-param-reassign */
    webStyle.marginLeft = val;
    webStyle.marginRight = val;
  }

  // handle marginVertical
  if (hasOwnProperty(webStyle, 'marginVertical')) {
    const val = toPx(webStyle.marginVertical);
    webStyle.marginTop = val;
    webStyle.marginBottom = val;
  }
  // handle paddingHorizontal
  if (hasOwnProperty(webStyle, 'paddingHorizontal')) {
    const val = toPx(webStyle.paddingHorizontal);
    webStyle.paddingLeft = val;
    webStyle.paddingRight = val;
  }
  // handle paddingVertical
  if (hasOwnProperty(webStyle, 'paddingVertical')) {
    const val = toPx(webStyle.paddingVertical);
    webStyle.paddingTop = val;
    webStyle.paddingBottom = val;
  }
}

// handle special color array
function handleSpecialColor(webStyle: WebStyle) {
  const colorStyleArr = [
    ['color', 'colors'],
    ['borderColor', 'borderColors'],
    ['borderTopColor', 'borderTopColors'],
    ['borderBottomColor', 'borderBottomColors'],
    ['borderLeftColor', 'borderLeftColors'],
    ['borderRightColor', 'borderRightColors'],
    ['backgroundColor', 'backgroundColors'],
  ];
  colorStyleArr.forEach((colorList) => {
    const [color, colors] = colorList;
    if (!webStyle[color] && webStyle[colors] && webStyle[colors].length > 0) {
      [webStyle[color]] = webStyle[colors];
    }
  });
}

function handle8BitHexColor(webStyle: WebStyle) {
  // covert color from hex to rgba
  if (is8DigitHexColor(webStyle.backgroundColor)) {
    webStyle.backgroundColor = transformHexToRgba(webStyle.backgroundColor);
  }

  if (is8DigitHexColor(webStyle.color)) {
    webStyle.color = transformHexToRgba(webStyle.color);
  }

  if (is8DigitHexColor(webStyle.borderColor)) {
    webStyle.borderColor = transformHexToRgba(webStyle.borderColor);
  }

  if (is8DigitHexColor(webStyle.borderTopColor)) {
    webStyle.borderTopColor = transformHexToRgba(webStyle.borderTopColor);
  }

  if (is8DigitHexColor(webStyle.borderBottomColor)) {
    webStyle.borderBottomColor = transformHexToRgba(webStyle.borderBottomColor);
  }

  if (is8DigitHexColor(webStyle.borderLeftColor)) {
    webStyle.borderLeftColor = transformHexToRgba(webStyle.borderLeftColor);
  }

  if (is8DigitHexColor(webStyle.borderRightColor)) {
    webStyle.borderRightColor = transformHexToRgba(webStyle.borderRightColor);
  }
}

function hackWebStyle(webStyle_: any) {
  const webStyle = webStyle_;
  /*
     if (webStyle.flexDirection || webStyle.justifyContent || webStyle.alignItems) {
     }
  */
  if (!webStyle.display) {
    Object.assign(webStyle, {
      display: displayValue,
      flexDirection: webStyle.flexDirection ? webStyle.flexDirection : 'column',
    });
  }

  // hack lineHeight
  if (hasOwnProperty(webStyle, 'lineHeight')) {
    webStyle.lineHeight = toPx(webStyle.lineHeight);
  }

  if (!webStyle.position) {
    webStyle.position = 'relative';
  }

  webStyle.boxSizing = 'border-box';

  // handle special border
  borderSpecialPropsArray.forEach((borderProp) => {
    if (hasOwnProperty(webStyle, borderProp)) {
      webStyle.borderStyle = null;
      if (borderProp === 'borderTopWidth') {
        webStyle.borderTopStyle = 'solid';
      } else if (borderProp === 'borderBottomWidth') {
        webStyle.borderBottomStyle = 'solid';
      } else if (borderProp === 'borderLeftWidth') {
        webStyle.borderLeftStyle = 'solid';
      } else if (borderProp === 'borderRightWidth') {
        webStyle.borderRightStyle = 'solid';
      }
    }
  });

  handleBoxStyle(webStyle);
  if (webStyle.height && webStyle.height === 0.5) {
    webStyle.height = '1px';
  }
  handleSpecialColor(webStyle);
  // convert 8bit color from hex rgba
  handle8BitHexColor(webStyle);

  Object.keys(webStyle)
    .forEach((key) => {
      const value = webStyle[key];
      if (value) {
        if (value instanceof Animation) {
          // start value for animation
          webStyle[key] = value.startValue;
          value.setStyleAttribute(key);
        } else if (value instanceof AnimationSet && value.children && value.children.length > 0) {
          // ensure animation set children existing
          const firstAnimation = value.children[0];
          webStyle[key] = firstAnimation.startValue;
          value.setStyleAttribute(key);
        }
      }
    });

  // handle transform
  if (webStyle.transform) {
    const finalTransformStyleResult = resolveTransform(webStyle.transform);
    if (typeof finalTransformStyleResult !== 'string') {
      const { type, animation, animationSet } = finalTransformStyleResult;
      const { startValue } = animation;
      const finalStartValue = normalizeValue(type, startValue);
      if (animationSet) {
        animationSet.setTransformStyleAttribute(type);
      } else {
        animation.setTransformStyleAttribute(type);
      }

      webStyle.transform = `${type}(${finalStartValue})`;
    } else {
      webStyle.transform = finalTransformStyleResult;
    }
  }
}

function formatWebStyle(style: any) {
  const webStyle = {};

  if (Array.isArray(style)) {
    style.forEach((itemStyle) => {
      Object.assign(webStyle, itemStyle);

      hackWebStyle(webStyle);
    });
  } else {
    Object.assign(webStyle, style);

    hackWebStyle(webStyle);
  }

  return webStyle;
}

export default formatWebStyle;
export { formatWebStyle };
