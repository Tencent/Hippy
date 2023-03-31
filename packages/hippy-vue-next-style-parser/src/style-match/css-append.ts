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
import { translateColor, type NeedToTyped } from '../index';
import {
  getCssMap,
  type StyleNode,
  type CommonMapParams,
  type StyleNodeList,
} from './index';

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
 * parse rem value of style object
 *
 * @param styleObject - style object
 * @param ratioBaseWidth - base width of design draft
 */
function parseRemStyle(
  styleObject: CommonMapParams,
  ratioBaseWidth?: number,
): CommonMapParams {
  let style: CommonMapParams = {};
  const keys = Object.keys(styleObject);

  if (keys.length) {
    // covert every single style
    keys.forEach((key) => {
      style[key] = convertRemValue(styleObject[key], ratioBaseWidth);
    });
  } else {
    style = styleObject;
  }

  return style;
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
          if (declaration) {
            style[declaration.property] = declaration.value;
          }
        }
      }
    }
  }
  return style;
}

/**
 * parse color string to native known color number
 *
 * @param style - style object
 */
function parseStyleColor<T>(style): T {
  if (style) {
    const keys = Object.keys(style);
    if (keys.length) {
      keys.forEach((key) => {
        // if color value is number, do not translate again
        if (
          key.toLowerCase().indexOf('color') >= 0
          && typeof style[key] !== 'number'
        ) {
          style[key] = translateColor(style[key]);
        }
      });
    }
  }

  return style;
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
    // parse color
    const style = parseStyleColor(getItemHippyCssStyle(matchedSelectors.selectors));
    // get default style
    const defaultNativeStyle = getDefaultNativeStyle(item);
    // inner style
    const originalInnerStyle = {};
    let hasInnerStyle = false;

    if (item.props.style) {
      const keys = Object.keys(item.props.style);
      // parse inner style when exist
      if (keys.length) {
        hasInnerStyle = true;
        item.props.style = parseStyleColor(item.props.style);
        keys.forEach((key) => {
          // save original inner style
          originalInnerStyle[key] = item.props.style[key];
        });
      }
    }
    // inner style is the top priority, save to use later
    item.props.inlineStyle = hasInnerStyle
      ? parseRemStyle(originalInnerStyle)
      : {};
    // current used style, include dynamic class's style value
    item.props.style = parseRemStyle(Object.assign(defaultNativeStyle, style, originalInnerStyle));
    // polyfill special node
    return polyfillSpecialNodeStyle(item, scrollViewContainerIdList);
  });
}