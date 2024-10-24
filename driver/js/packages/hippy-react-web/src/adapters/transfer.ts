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
// @ts-nocheck
import normalizeCSSColor from 'normalize-css-color';
import Animation from '../modules/animation';
import AnimationSet from '../modules/animation-set';
import normalizeValue from './normalize-value';

const borderSpecialPropsArray = ['borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth'];
const borderPropsArray = ['borderWidth'];
const displayValue = typeof window !== 'undefined' && !('flex' in window.document.body.style) ? '-webkit-flex' : 'flex';

function hasOwnProperty(obj: Object, name: string | number | symbol) {
  return Object.prototype.hasOwnProperty.call(obj, name);
}

const processColor = (color?: HippyTypes.Color): string | number | undefined => {
  if (!color) return color;

  let int32Color: any = normalizeCSSColor(color);
  if (int32Color === undefined || int32Color === null) {
    return undefined;
  }

  int32Color = ((int32Color << 24) | (int32Color >>> 8)) >>> 0;

  return int32Color;
};

export const normalizeColor = (color?: HippyTypes.Color, opacity = 1): void | string => {
  if (!color) return;

  if (typeof color === 'string') {
    return color;
  }
  const colorInt: any = processColor(color);

  const r = (colorInt >> 16) & 255;
  const g = (colorInt >> 8) & 255;
  const b = colorInt & 255;
  const a = ((colorInt >> 24) & 255) / 255;
  const alpha = (a * opacity).toFixed(2);
  return `rgba(${r},${g},${b},${alpha})`;
};

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
  [props: string]: any;
  borderStyle?: HippyTypes.Style;
  marginHorizontal?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
  marginVertical?: number | string;
  paddingHorizontal?: number | string;
  paddingVertical?: number | string;
  color?: HippyTypes.Color;
  colors?: HippyTypes.Colors;
  borderColor?: HippyTypes.Color;
  borderColors?: HippyTypes.Colors;
  borderTopColor?: HippyTypes.Color;
  borderTopColors?: HippyTypes.Colors;
  borderBottomColor?: HippyTypes.Color;
  borderBottomColors?: HippyTypes.Colors;
  borderLeftColor?: HippyTypes.Color;
  borderLeftColors?: HippyTypes.Colors;
  borderRightColor?: HippyTypes.Color;
  borderRightColors?: HippyTypes.Colors;
  backgroundColor?: HippyTypes.Color;
  backgroundColors?: HippyTypes.Colors;
  backgroundImage?: string;
  boxShadow?: string;
  boxShadowRadius?: number | string;
  boxShadowOffsetX?: number | string;
  boxShadowOffsetY?: number | string;
  boxShadowSpread?: number | string;
  boxShadowColor?: HippyTypes.Color;
  textShadow?: string;
  textShadowOffset?: { x: number, y: number };
  textShadowRadius?: number | string;
  textShadowColor?: HippyTypes.Color;
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

function handleBoxShadow(webStyle: WebStyle) {
  const {
    boxShadowOffsetX = 0,
    boxShadowOffsetY = 0,
    boxShadowRadius = 0,
    boxShadowSpread = 0,
    boxShadowColor,
  } = webStyle;
  const offsetX = toPx(boxShadowOffsetX);
  const offsetY = toPx(boxShadowOffsetY);
  const radius = toPx(boxShadowRadius);
  const spread = toPx(boxShadowSpread);
  if (boxShadowColor && offsetX && offsetY) {
    webStyle.boxShadow = `${offsetX} ${offsetY} ${radius} ${spread} ${boxShadowColor}`;
  }
}

function handleTextShadow(style: WebStyle) {
  const { textShadowColor, textShadowOffset = { x: 0, y: 0 }, textShadowRadius } = style;
  const { x, y } = textShadowOffset;
  const offsetX = toPx(x);
  const offsetY = toPx(y);
  const radius = toPx(textShadowRadius);
  if (x && y) {
    style.textShadow = `${offsetX} ${offsetY} ${radius} ${textShadowColor}`;
  }
}

const handleLinearBackground = (style: WebStyle) => {
  if (style.backgroundImage) {
    const { backgroundImage } = style;
    // remove linear-gradient tail semicolon.
    if (backgroundImage.startsWith('linear-gradient') && backgroundImage.endsWith(';')) {
      style.backgroundImage = backgroundImage.substring(0, backgroundImage.length - 1);
    }
  }
};

const handlePropertyColor = (style: WebStyle) => {
  const colorProps = {
    backgroundColor: true,
    color: true,
    borderColor: true,
    borderTopColor: true,
    borderRightColor: true,
    borderBottomColor: true,
    borderLeftColor: true,
    shadowColor: true,
    textDecorationColor: true,
    textShadowColor: true,
  };
  const propertyList = Object.keys(colorProps);
  propertyList.forEach((property) => {
    if (property !== null && style[property]) {
      style[property] = normalizeColor(style[property]);
    }
  });
};

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
  handlePropertyColor(webStyle);

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
  // handle shadow
  handleBoxShadow(webStyle);
  handleTextShadow(webStyle);
  handleLinearBackground(webStyle);
}

function normalizeStyle(style: any) {
  const webStyle: Record<string, any> = {};

  if (Array.isArray(style)) {
    style.forEach((itemStyle) => {
      Object.assign(webStyle, itemStyle);
    });
  } else {
    Object.assign(webStyle, style);
  }

  return webStyle;
}

function formatWebStyle(style: any) {
  const webStyle = normalizeStyle(style);
  hackWebStyle(webStyle);
  return webStyle;
}

export default formatWebStyle;
export { normalizeStyle, formatWebStyle };
