/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

/**
 * insert hippy style for ssr nodes
 */
import { camelize } from '@vue/shared';
import {
  translateColor,
  type NeedToTyped,
  parseBackgroundImage,
  PROPERTIES_MAP,
  PropertiesMapType,
} from '../index';
import {
  getCssMap,
  type StyleNode,
  type CommonMapParams,
  type StyleNodeList,
} from './index';

interface OffsetMapType {
  textShadowOffsetX: string;
  textShadowOffsetY: string;
}

// regular expression of number format
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d{0,17}\\.?\\d{0,5}([Ee][+-]?\\d{1,5})?$');

function tryConvertNumber<T extends string | number>(
  str: T,
): T extends number ? number : string | number;

/**
 * Convert strings to number as much as possible
 */
function tryConvertNumber(str: string | number): string | number {
  if (typeof str === 'number') {
    return str;
  }

  if (numberRegEx.test(str)) {
    try {
      return parseFloat(str);
    } catch (err) {
      // pass
    }
  }

  return str;
}

/**
 * covert rem style to native pt, support custom base width
 *
 * @param styleValue - css style value
 * @param ratioBaseWidth - base width of design draft, default is 750px
 */
function convertRemValue(
  styleValue: NeedToTyped,
  ratioBaseWidth?: number,
): NeedToTyped {
  let value = styleValue;

  // do not convert non rem value
  if (typeof value !== 'string' || !value.endsWith('rem')) {
    return value;
  }
  // get rem number
  value = parseFloat(value);
  // direct return is non number
  if (Number.isNaN(value)) {
    return value;
  }
  // default width of design draft
  const defaultRatioBaseWidth = 750;
  const { width } = global?.Hippy?.device?.screen;
  if (width) {
    const ratio = width / (ratioBaseWidth ?? defaultRatioBaseWidth);
    return value * 100 * ratio;
  }
  // direct return when do not have screen size
  return value;
}

/**
 * get default style for native node
 *
 * @param node - ssr node
 */
function getDefaultNativeStyle(node: StyleNode): CommonMapParams {
  if (node.name === 'Image') {
    return { backgroundColor: 0 };
  }

  if (node.name === 'ListView') {
    // Necessary by iOS
    return { flex: 1 };
  }

  if (node.name === 'Text') {
    // text node, for label,span,p. Black color(#000), necessary for Android
    // text node, for a, Blue color(rgb(0, 0, 238), necessary for Android
    return { color: node.tagName === 'a' ? 4278190318 : 4278190080 };
  }

  if (node.name === 'TextInput') {
    return {
      padding: 0, // Remove the android underline
      color: 4278190080, // Black color(#000), necessary for Android
    };
  }

  if (node.name === 'ViewPagerItem') {
    // swiper-slide item
    return {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }

  if (node.name === 'Modal') {
    // dialog
    return {
      position: 'absolute',
    };
  }

  // nothing for other
  return {};
}

/**
 * Handle special cases of some native node
 *
 * @param node - hippy node
 * @param scrollViewContainerIdList - the id for scrollView's wrapper
 */
function polyfillSpecialNodeStyle(
  node: StyleNode,
  scrollViewContainerIdList: Record<number, number[]>,
): StyleNode {
  const nativeNode = node;
  const currentScrollViewContainerIdList = scrollViewContainerIdList;
  const style = node.props.style || {};
  const inlineStyle = node.props.inlineStyle || {};
  if (node.name === 'View') {
    // View do not scroll, so we should change to ScrollView when props have overflow: scroll
    if (style.overflowY === 'scroll') {
      nativeNode.name = 'ScrollView';
    } else if (style.overflowX === 'scroll') {
      nativeNode.name = 'ScrollView';
      // should set horizontal for horizontal scroll
      nativeNode.props.horizontal = true;
      // ssr default set to row, updated at client side
      style.flexDirection = 'row';
    }

    // compatible nativeBackgroundAndroid style props
    const { nativeBackgroundAndroid } = nativeNode.props;
    if (nativeBackgroundAndroid && typeof nativeBackgroundAndroid.color !== 'undefined') {
      nativeNode.props.nativeBackgroundAndroid.color = translateColor(nativeBackgroundAndroid.color);
    }
  }
  // Change the ScrollView child collapsable attribute
  if (nativeNode.name === 'ScrollView') {
    currentScrollViewContainerIdList[nativeNode.id] = [];
  }
  // if parent node is ScrollView, child node must set collapsable to false
  if (nativeNode?.pId) {
    if (currentScrollViewContainerIdList[nativeNode.pId]) {
      if (currentScrollViewContainerIdList[nativeNode.pId].length > 0) {
        // eslint-disable-next-line no-console
        console.warn('Only one child node is acceptable for View with overflow');
      } else {
        currentScrollViewContainerIdList[nativeNode.pId] = [Number(nativeNode.id)];
        nativeNode.props.style.collapsable = false;
      }
    }
  }
  // compatible v-show
  if (inlineStyle.display) {
    delete nativeNode.props.style.display;
    nativeNode.props.display = inlineStyle.display;
  }

  // compatible Input
  if (nativeNode.name === 'TextInput') {
    ['caretColor', 'underlineColorAndroid', 'placeholderTextColor'].forEach((key) => {
      if (nativeNode.props[key] && typeof nativeNode.props[key] !== 'number') {
        nativeNode.props[key] = translateColor(nativeNode.props[key]);
      }
    });
  }

  return node;
}

/**
 * 获取 item 匹配的 hippy css 样式
 *
 * @param selectors - 匹配的选择器列表
 */
function getItemHippyCssStyle(selectors) {
  const style = {};
  // if selectors exist, doing value put
  if (selectors?.length) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      if (selector.ruleSet?.declarations?.length) {
        const { declarations } = selector.ruleSet;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let j = 0; j < declarations.length; j++) {
          const declaration = declarations[j];
          if (declaration.property) {
            style[declaration.property] = declaration.value;
          }
        }
      }
    }
  }
  return style;
}

/**
 * parse text shadow offset
 *
 * @param property - property name
 * @param value - property value
 * @param rawStyle - original style
 *
 */
function parseTextShadowOffset(
  property: keyof OffsetMapType,
  value = 0,
  rawStyle: CommonMapParams,
): [string, { [key: string]: number }] {
  const style = rawStyle;
  const offsetMap: OffsetMapType = {
    textShadowOffsetX: 'width',
    textShadowOffsetY: 'height',
  };

  style.textShadowOffset = style.textShadowOffset ?? {};

  Object.assign(style.textShadowOffset, {
    [offsetMap[property]]: value,
  });

  return ['textShadowOffset', style.textShadowOffset];
}

function parseItemStyle(styleObject) {
  const itemStyle = {};
  for (let [styleProperty, styleValue] of Object.entries(styleObject)) {
    // Process the specific style value
    switch (styleProperty) {
      case 'fontWeight':
        if (typeof styleValue !== 'string') {
          styleValue = (styleValue as Object).toString();
        }
        break;
      case 'backgroundImage': {
        [styleProperty, styleValue] = parseBackgroundImage(
          styleProperty,
          styleValue,
        );
        break;
      }
      case 'textShadowOffsetX':
      case 'textShadowOffsetY': {
        [styleProperty, styleValue] = parseTextShadowOffset(
          styleProperty,
          styleValue as number,
          styleObject,
        );
        break;
      }
      case 'textShadowOffset': {
        const { x = 0, width = 0, y = 0, height = 0 } = (styleValue as any) ?? {};
        styleValue = { width: x || width, height: y || height };
        break;
      }
      default: {
        // Convert the property to W3C standard.
        if (
          Object.prototype.hasOwnProperty.call(PROPERTIES_MAP, styleProperty)
        ) {
          styleProperty = PROPERTIES_MAP[styleProperty as keyof PropertiesMapType];
        }
        // Convert the value
        if (typeof styleValue === 'string') {
          let value: string | number = styleValue.trim();
          // Convert inline color style to int
          if (styleProperty.toLowerCase().indexOf('color') >= 0) {
            value = translateColor(styleValue);
            // Convert inline length style, drop the px unit
          } else if (styleValue.endsWith('px')) {
            value = parseFloat(styleValue.slice(0, styleValue.length - 2));
          } else if (styleValue.endsWith('rem')) {
            value = convertRemValue(styleValue);
          } else {
            value = tryConvertNumber(styleValue);
          }
          styleValue = value;
        }
      }
    }
    // assign parsed style value
    itemStyle[styleProperty] = styleValue;
  }
  return itemStyle;
}

/**
 * insert style for ssr nodes
 *
 * @param nodeList - ssr node list
 * @param styleContent - style content
 *
 * @public
 */
export function insertStyleForSsrNodes(
  nodeList: StyleNode[],
  styleContent: NeedToTyped[],
): StyleNode[] {
  // transform hippy node list to object.
  // for example: [ { id: 1, name: 'a' }, { id: 2, name: 'b' } ]
  //   => { 1: { id: 1, name: 'a' }, 2: { id: 2, name: 'b' } }
  const ssrNodes: StyleNodeList = Object.fromEntries(nodeList.map(item => [item.id, item]));
  // get css match map
  const cssMap = getCssMap(styleContent);
  // get scrollView's wrapper id, should handle later
  const scrollViewContainerIdList: Record<number, number[]> = {};
  // insert style for every node
  return nodeList.map((item) => {
    // find matched selectors
    const matchedSelectors = cssMap.query(item, ssrNodes);
    // parse css style sheet
    const style = parseItemStyle(getItemHippyCssStyle(matchedSelectors.selectors));
    // get component default style
    const defaultNativeStyle = getDefaultNativeStyle(item);
    // handle item style
    const originalInnerStyle = {};
    let hasInnerStyle = false;

    if (item.props.style) {
      const keys = Object.keys(item.props.style);
      // parse inner style when exist
      if (keys.length) {
        hasInnerStyle = true;
        keys.forEach((key) => {
          const camelKey = camelize(key);
          // save original inner style
          originalInnerStyle[camelKey] = item.props.style[key];
        });
      }
    }
    // inner style is the top priority, save to use later
    item.props.inlineStyle = hasInnerStyle
      ? parseItemStyle(originalInnerStyle)
      : {};
    // current used style, include default style, style sheet and inline style
    item.props.style = Object.assign(defaultNativeStyle, style, item.props.inlineStyle);

    // polyfill special node
    return polyfillSpecialNodeStyle(item, scrollViewContainerIdList);
  });
}
