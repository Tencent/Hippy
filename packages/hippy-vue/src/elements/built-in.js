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

import { arrayCount, warn, convertImageLocalPath } from '../util';
import { HIPPY_DEBUG_ADDRESS } from '../runtime/constants';
import NATIVE_COMPONENT_NAME_MAP, * as components from '../renderer/native/components';
import Native from '../runtime/native';

function mapEvent(...args) {
  const map = {};
  if (Array.isArray(args[0])) {
    args[0].forEach(([vueEventName, nativeEventName]) => {
      map[map[vueEventName] = nativeEventName] = vueEventName;
    });
  } else {
    const [vueEventName, nativeEventName] = args;
    map[map[vueEventName] = nativeEventName] = vueEventName;
  }
  return map;
}

const INPUT_VALUE_MAP = {
  number: 'numeric',
  text: 'default',
  search: 'web-search',
};

const accessibilityAttrMaps = {
  role: 'accessibilityRole',
  'aria-label': 'accessibilityLabel',
  'aria-disabled': {
    jointKey: 'accessibilityState',
    name: 'disabled',
  },
  'aria-selected': {
    jointKey: 'accessibilityState',
    name: 'selected',
  },
  'aria-checked': {
    jointKey: 'accessibilityState',
    name: 'checked',
  },
  'aria-busy': {
    jointKey: 'accessibilityState',
    name: 'busy',
  },
  'aria-expanded': {
    jointKey: 'accessibilityState',
    name: 'expanded',
  },
  'aria-valuemin': {
    jointKey: 'accessibilityValue',
    name: 'min',
  },
  'aria-valuemax': {
    jointKey: 'accessibilityValue',
    name: 'max',
  },
  'aria-valuenow': {
    jointKey: 'accessibilityValue',
    name: 'now',
  },
  'aria-valuetext': {
    jointKey: 'accessibilityValue',
    name: 'text',
  },
};

// View area
const div = {
  symbol: components.View,
  component: {
    name: NATIVE_COMPONENT_NAME_MAP[components.View],
    eventNamesMap: mapEvent([
      ['touchStart', 'onTouchDown'], // TODO: Back compatible, will remove soon
      ['touchstart', 'onTouchDown'],
      ['touchmove', 'onTouchMove'],
      ['touchend', 'onTouchEnd'],
      ['touchcancel', 'onTouchCancel'],
    ]),
    attributeMaps: {
      ...accessibilityAttrMaps,
    },
    processEventData(event, nativeEventName, nativeEventParams) {
      switch (nativeEventName) {
        case 'onScroll':
        case 'onScrollBeginDrag':
        case 'onScrollEndDrag':
          event.offsetX = nativeEventParams.contentOffset && nativeEventParams.contentOffset.x;
          event.offsetY = nativeEventParams.contentOffset && nativeEventParams.contentOffset.y;
          break;
        case 'onTouchDown':
        case 'onTouchMove':
        case 'onTouchEnd':
        case 'onTouchCancel':
          event.touches = {
            0: {
              clientX: nativeEventParams.page_x,
              clientY: nativeEventParams.page_y,
            },
            length: 1,
          };
          break;
        case 'onFocus':
          event.isFocused = nativeEventName.focus;
          break;
        default:
      }
      return event;
    },
  },
};

const button = {
  symbol: components.View,
  component: {
    ...div.component,
    name: NATIVE_COMPONENT_NAME_MAP[components.View],
    defaultNativeStyle: {},
  },
};

const form = {
  symbol: components.View,
  component: {
    name: NATIVE_COMPONENT_NAME_MAP[components.View],
  },
};

// Image area
const img = {
  symbol: components.Image,
  component: {
    ...div.component,
    name: NATIVE_COMPONENT_NAME_MAP[components.Image],
    defaultNativeStyle: {
      backgroundColor: 0,
    },
    attributeMaps: {
      // TODO: check placeholder or defaultSource value in compile-time wll be better.
      placeholder: {
        name: 'defaultSource',
        propsValue(value) {
          const url = convertImageLocalPath(value);
          if (url
              && url.indexOf(HIPPY_DEBUG_ADDRESS) < 0
              && ['https://', 'http://'].some(schema => url.indexOf(schema) === 0)) {
            warn(`img placeholder ${url} recommend to use base64 image or local path image`);
          }
          return url;
        },
      },
      /**
       * For Android, will use src property
       * For iOS, will convert to use source property
       */
      src(value) {
        return convertImageLocalPath(value);
      },
      ...accessibilityAttrMaps,
    },
  },
};

// ListView area
const ul = {
  symbol: components.ListView,
  component: {
    name: NATIVE_COMPONENT_NAME_MAP[components.ListView],
    defaultNativeStyle: {
      flex: 1, // Necessary by iOS
    },
    defaultNativeProps: {
      numberOfRows(node) {
        return arrayCount(node.childNodes, childNode => !childNode.meta.skipAddToDom);
      },
    },
    attributeMaps: {
      ...accessibilityAttrMaps,
    },
    eventNamesMap: mapEvent('listReady', 'initialListReady'),
    processEventData(event, nativeEventName, nativeEventParams) {
      switch (nativeEventName) {
        case 'onScroll':
          event.offsetX = nativeEventParams.contentOffset.x;
          event.offsetY = nativeEventParams.contentOffset.y;
          break;
        case 'onDelete':
          event.index = nativeEventParams.index;
          break;
        default:
      }
      return event;
    },
  },
};

const li = {
  symbol: components.ListViewItem,
  component: {
    name: NATIVE_COMPONENT_NAME_MAP[components.ListViewItem],
    attributeMaps: {
      ...accessibilityAttrMaps,
    },
  },
  eventNamesMap: mapEvent([
    ['disappear', (__PLATFORM__ === 'android' || Native.Platform === 'android') ? 'onDisAppear' : 'onDisappear'],
  ]),
};

// Text area
const span = {
  symbol: components.View, // IMPORTANT: Can't be Text.
  component: {
    ...div.component,
    name: NATIVE_COMPONENT_NAME_MAP[components.Text],
    defaultNativeProps: {
      text: '',
    },
    defaultNativeStyle: {
      color: 4278190080, // Black color(#000), necessary for Android
    },
  },
};

const label = span;

const p = span;

const a = {
  component: {
    ...span.component,
    defaultNativeStyle: {
      color: 4278190318, // Blue color(rgb(0, 0, 238), necessary for android
    },
    attributeMaps: {
      href: {
        name: 'href',
        propsValue(value) {
          if (['//', 'http://', 'https://'].filter(url => value.indexOf(url) === 0).length) {
            warn(`href attribute can't apply effect in native with url: ${value}`);
            return '';
          }
          return value;
        },
      },
    },
  },
};

// TextInput area
const input = {
  symbol: components.TextInput,
  component: {
    name: NATIVE_COMPONENT_NAME_MAP[components.TextInput],
    attributeMaps: {
      type: {
        name: 'keyboardType',
        propsValue(value) {
          const newValue = INPUT_VALUE_MAP[value];
          if (!newValue) {
            return value;
          }
          return newValue;
        },
      },
      disabled: {
        name: 'editable',
        propsValue(value) {
          return !value;
        },
      },
      value: 'defaultValue',
      maxlength: 'maxLength',
      ...accessibilityAttrMaps,
    },
    nativeProps: {
      numberOfLines: 1,
      multiline: false,
    },
    defaultNativeProps: {
      underlineColorAndroid: 0, // Remove the android underline
    },
    defaultNativeStyle: {
      padding: 0, // Remove the android underline
      color: 4278190080, // Black color(#000), necessary for Android
    },
    eventNamesMap: mapEvent([
      ['change', 'onChangeText'],
      ['select', 'onSelectionChange'],
    ]),
    processEventData(event, nativeEventName, nativeEventParams) {
      switch (nativeEventName) {
        case 'onChangeText':
        case 'onEndEditing':
          event.value = nativeEventParams.text;
          break;
        case 'onSelectionChange':
          // The event in web not response meaningful things.
          // But in hippy we can response the selection start & end position.
          event.start = nativeEventParams.selection.start;
          event.end = nativeEventParams.selection.end;
          break;
        case 'onKeyboardWillShow':
          event.keyboardHeight = nativeEventParams.keyboardHeight;
          if (__PLATFORM__ === 'android' || Native.Platform === 'android') {
            event.keyboardHeight /= Native.PixelRatio;
          }
          break;
        case 'onContentSizeChange':
          event.width = nativeEventParams.contentSize.width;
          event.height = nativeEventParams.contentSize.height;
          break;
        default:
      }
      return event;
    },
  },
};

const textarea = {
  symbol: components.TextInput,
  component: {
    name: NATIVE_COMPONENT_NAME_MAP[components.TextInput],
    defaultNativeProps: {
      ...input.component.defaultNativeProps,
      numberOfLines: 5,
    },
    attributeMaps: {
      ...input.component.attributeMaps,
      rows: 'numberOfLines',
    },
    nativeProps: {
      multiline: true,
    },
    defaultNativeStyle: input.component.defaultNativeStyle,
    eventNamesMap: input.component.eventNamesMap,
    processEventData: input.component.processEventData,
  },
};

// Iframe area
const iframe = {
  symbol: components.WebView,
  component: {
    name: NATIVE_COMPONENT_NAME_MAP[components.WebView],
    defaultNativeProps: {
      method: 'get',
      userAgent: '',
    },
    attributeMaps: {
      src: {
        name: 'source',
        propsValue(value) {
          return {
            uri: value,
          };
        },
      },
    },
    processEventData(event, nativeEventName, nativeEventParams) {
      switch (nativeEventName) {
        case 'onLoad':
        case 'onLoadStart':
        case 'onLoadEnd':
          event.url = nativeEventParams.url;
          break;

        default:
      }
      return event;
    },
  },
};

export {
  button,
  div,
  form,
  img,
  input,
  label,
  li,
  p,
  span,
  a,
  textarea,
  ul,
  iframe,
};
