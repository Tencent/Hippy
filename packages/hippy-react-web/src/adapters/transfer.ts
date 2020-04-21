/* eslint-disable no-bitwise */

import normalizeValue from './normalize-value';
import Animation from '../modules/animation';
import AnimationSet from '../modules/animation-set';

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

function resolveTransform(transformArray: any[]) {
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

  if (webStyle.lineHeight && webStyle.lineHeight.toString()
    .indexOf('px') === -1) {
    webStyle.lineHeight += 'px';
  }

  if (!webStyle.position) {
    webStyle.position = 'relative';
  }

  webStyle.boxSizing = 'border-box';

  // 处理特殊 border
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

  // 处理普通border
  borderPropsArray.every((borderProp) => {
    if (hasOwnProperty(webStyle, borderProp)) {
      webStyle.borderStyle = 'solid';
      return false;
    }
    return true;
  });

  // 处理marginHorizontal
  if (hasOwnProperty(webStyle, 'marginHorizontal')) {
    webStyle.marginLeft = `${webStyle.marginHorizontal}px`;
    webStyle.marginRight = `${webStyle.marginHorizontal}px`;
  }

  // 处理marginVertical
  if (hasOwnProperty(webStyle, 'marginVertical')) {
    webStyle.marginTop = `${webStyle.marginVertical}px`;
    webStyle.marginBottom = `${webStyle.marginVertical}px`;
  }
  // 处理paddingHorizontal
  if (hasOwnProperty(webStyle, 'paddingHorizontal')) {
    webStyle.paddingLeft = `${webStyle.paddingHorizontal}px`;
    webStyle.paddingRight = `${webStyle.paddingHorizontal}px`;
  }
  // 处理paddingVertical
  if (hasOwnProperty(webStyle, 'paddingVertical')) {
    webStyle.paddingTop = `${webStyle.paddingVertical}px`;
    webStyle.paddingBottom = `${webStyle.paddingVertical}px`;
  }

  if (webStyle.height && webStyle.height === 0.5) {
    webStyle.height = '1px';
  }

  // 处理颜色数组（QQ浏览器专有）
  // TODO 剥离出来，不写在公用库
  if (!webStyle.color && webStyle.colors && webStyle.colors.length > 0) {
    [webStyle.color] = webStyle.colors;
  }

  if (!webStyle.borderColor && webStyle.borderColors && webStyle.borderColors.length > 0) {
    [webStyle.borderColor] = webStyle.borderColors;
  }

  if (!webStyle.borderTopColor && webStyle.borderTopColors && webStyle.borderTopColors.length > 0) {
    [webStyle.borderTopColor] = webStyle.borderTopColors;
  }

  if (!webStyle.borderBottomColor && webStyle.borderBottomColors
    && webStyle.borderBottomColors.length > 0) {
    [webStyle.borderBottomColor] = webStyle.borderBottomColors;
  }

  if (!webStyle.borderLeftColor && webStyle.borderLeftColors
    && webStyle.borderLeftColors.length > 0) {
    [webStyle.borderLeftColor] = webStyle.borderLeftColors;
  }

  if (!webStyle.borderRightColor && webStyle.borderRightColors
    && webStyle.borderRightColors.length > 0) {
    [webStyle.borderRightColor] = webStyle.borderRightColors;
  }

  if (!webStyle.backgroundColor && webStyle.backgroundColors
    && webStyle.backgroundColors.length > 0) {
    [webStyle.backgroundColor] = webStyle.backgroundColors;
  }


  // 处理八位16进制的颜色值为rgba颜色值
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

  Object.keys(webStyle)
    .forEach((key) => {
      const value = webStyle[key];
      if (value) {
        if (value instanceof Animation) {
          // 动画给初始值
          webStyle[key] = value.startValue;
          value.setStyleAttribute(key);
        } else if (value instanceof AnimationSet && value.children && value.children.length > 0) {
          // 确认AnimationSet是确实有children
          const firstAnimation = value.children[0];
          webStyle[key] = firstAnimation.startValue;
          value.setStyleAttribute(key);
        }
      }
    });

  // 处理transform
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

function assignWebStyle(style: any, webStyle: any) {
  if (Array.isArray(style)) {
    style.forEach((itemStyle) => {
      assignWebStyle(itemStyle, webStyle);
    });
  } else {
    Object.assign(webStyle, style);
  }
}

function formatWebStyle(style: any) {
  const webStyle = {};
  assignWebStyle(style, webStyle);
  hackWebStyle(webStyle);
  return webStyle;
}

export default formatWebStyle;
export { formatWebStyle };
