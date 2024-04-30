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

/**
 * Tags supported by Hippy built-in
 */

import type { NeedToTyped } from './types';
import { NATIVE_COMPONENT_MAP, HIPPY_DEBUG_ADDRESS } from './config';
import { registerElement, type ElementComponent } from './runtime/component';
import type { EventsUnionType } from './runtime/event/hippy-event';
import { Native } from './runtime/native';
import type { HippyNode } from './runtime/node/hippy-node';
import { mapHippyEvent, convertImageLocalPath, warn, arrayCount } from './util';

// list of built-in tag components
const builtInTagComponentList: Map<string, ElementComponent> = new Map();

interface InputValueMapType {
  [key: string]: string;
}

export const INPUT_VALUE_MAP: InputValueMapType = {
  number: 'numeric',
  text: 'default',
  search: 'web-search',
};

// accessibility properties
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

// div component
const div: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.View,
    eventNamesMap: mapHippyEvent([
      ['touchStart', 'onTouchDown'],
      ['touchstart', 'onTouchDown'],
      ['touchmove', 'onTouchMove'],
      ['touchend', 'onTouchEnd'],
      ['touchcancel', 'onTouchCancel'],
    ]),
    attributeMaps: {
      ...accessibilityAttrMaps,
    },
    processEventData(evtData: EventsUnionType, nativeEventParams: NeedToTyped) {
      const { handler: event, __evt: nativeEventName } = evtData;

      switch (nativeEventName) {
        case 'onScroll':
        case 'onScrollBeginDrag':
        case 'onScrollEndDrag':
        case 'onMomentumScrollBegin':
        case 'onMomentumScrollEnd':
          event.offsetX = nativeEventParams.contentOffset?.x;
          event.offsetY = nativeEventParams.contentOffset?.y;
          /**
           * If it is a scroll event and the size of the scroll content area is included in the event response,
           * the actual size of the scroll content area will be assigned
           */
          if (nativeEventParams?.contentSize) {
            event.scrollHeight = nativeEventParams.contentSize.height;
            event.scrollWidth = nativeEventParams.contentSize.width;
          }
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
          event.isFocused = nativeEventParams.focus;
          break;
        default:
      }
      return event;
    },
  },
};

// button component
const button: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.View,
    attributeMaps: div.component.attributeMaps,
    eventNamesMap: div.component.eventNamesMap,
    processEventData: div.component.processEventData,
  },
};

// form component
const form: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.View,
  },
};

// img component
const img: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.Image,
    eventNamesMap: div.component.eventNamesMap,
    processEventData(evtData: EventsUnionType, nativeEventParams: NeedToTyped) {
      const { handler: event, __evt: nativeEventName } = evtData;

      switch (nativeEventName) {
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
          event.isFocused = nativeEventParams.focus;
          break;
        case 'onLoad': {
          const { width, height, url } = nativeEventParams;
          event.width = width;
          event.height = height;
          event.url = url;
          break;
        }
        default:
      }
      return event;
    },
    defaultNativeStyle: {
      backgroundColor: 0,
    },
    attributeMaps: {
      placeholder: {
        name: 'defaultSource',
        propsValue(value: string) {
          const url = convertImageLocalPath(value);
          if (
            url?.indexOf(HIPPY_DEBUG_ADDRESS) < 0
            && ['https://', 'http://'].some(schema => url.indexOf(schema) === 0)
          ) {
            warn(`img placeholder ${url} recommend to use base64 image or local path image`);
          }
          return url;
        },
      },
      /**
       * For Android, will use src property
       * For iOS, will convert to use source property
       * At line: hippy-vue/renderer/native/index.js line 196.
       */
      src(value: string) {
        return convertImageLocalPath(value);
      },
      ...accessibilityAttrMaps,
    },
  },
};

// list component
const ul: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.ListView,
    defaultNativeStyle: {
      flex: 1, // Necessary by iOS
    },
    defaultNativeProps: {
      numberOfRows(node: HippyNode) {
        return arrayCount(
          node.childNodes,
          (childNode: HippyNode) => childNode.isNeedInsertToNative,
        );
      },
    },
    attributeMaps: {
      ...accessibilityAttrMaps,
    },
    eventNamesMap: mapHippyEvent('listReady', 'initialListReady'),
    processEventData(
      evtData: EventsUnionType,
      nativeEventParams: {
        contentOffset: {
          x: number;
          y: number;
        };
        index: number;
      },
    ) {
      const { handler: event, __evt: nativeEventName } = evtData;
      switch (nativeEventName) {
        case 'onScroll':
        case 'onScrollBeginDrag':
        case 'onScrollEndDrag':
        case 'onMomentumScrollBegin':
        case 'onMomentumScrollEnd':
          event.offsetX = nativeEventParams.contentOffset?.x;
          event.offsetY = nativeEventParams.contentOffset?.y;
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

// list-item component
const li: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.ListViewItem,
    attributeMaps: {
      ...accessibilityAttrMaps,
    },
    eventNamesMap: mapHippyEvent([
      ['disappear', Native.isAndroid() ? 'onDisAppear' : 'onDisappear'],
    ]),
  },
};

// span component
const span: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.Text,
    attributeMaps: div.component.attributeMaps,
    eventNamesMap: div.component.eventNamesMap,
    processEventData: div.component.processEventData,
    defaultNativeProps: {
      text: '',
    },
    defaultNativeStyle: {
      color: 4278190080, // Black color(#000), necessary for Android
    },
  },
};

// label component
const label: ElementComponent = span;

// p component
const p: ElementComponent = span;

// a component
const a: ElementComponent = {
  component: {
    ...span.component,
    defaultNativeStyle: {
      color: 4278190318, // Blue color(rgb(0, 0, 238), necessary for android
    },
    attributeMaps: {
      href: {
        name: 'href',
        propsValue(value: string) {
          if (
            ['//', 'http://', 'https://'].filter(url => value.indexOf(url) === 0).length
          ) {
            warn(`href attribute can't apply effect in native with url: ${value}`);
            return '';
          }
          return value;
        },
      },
    },
  },
};

// input component
const input: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.TextInput,
    attributeMaps: {
      type: {
        name: 'keyboardType',
        propsValue(value: string) {
          const newValue = INPUT_VALUE_MAP[value];
          if (!newValue) {
            return value;
          }
          return newValue;
        },
      },
      disabled: {
        name: 'editable',
        propsValue(value: boolean) {
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
    eventNamesMap: mapHippyEvent([
      ['change', 'onChangeText'],
      ['select', 'onSelectionChange'],
    ]),
    processEventData(
      evtData: EventsUnionType,
      nativeEventParams: {
        selection: {
          start: number;
          end: number;
        };
        keyboardHeight: number;
        contentSize: {
          width: number;
          height: number;
        };
        text: string;
      },
    ) {
      const { handler: event, __evt: nativeEventName } = evtData;

      switch (nativeEventName) {
        case 'onChangeText':
        case 'onEndEditing':
          event.value = nativeEventParams.text;
          break;
        case 'onSelectionChange':
          // The event in web not response meaningful things.
          // But in hippy we can respond the selection start & end position.
          event.start = nativeEventParams.selection.start;
          event.end = nativeEventParams.selection.end;
          break;
        case 'onKeyboardWillShow':
          event.keyboardHeight = nativeEventParams.keyboardHeight;
          if (Native.isAndroid() && event.keyboardHeight) {
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

// textarea component
const textarea: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.TextInput,
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

// iframe component
const iframe: ElementComponent = {
  component: {
    name: NATIVE_COMPONENT_MAP.WebView,
    defaultNativeProps: {
      method: 'get',
      userAgent: '',
    },
    attributeMaps: {
      src: {
        name: 'source',
        propsValue(value: string) {
          return {
            uri: value,
          };
        },
      },
    },
    processEventData(
      evtData: EventsUnionType,
      nativeEventParams: {
        url: string;
        success?: boolean;
        error?: string;
      },
    ) {
      const { handler: event, __evt: nativeEventName } = evtData;

      switch (nativeEventName) {
        case 'onLoad':
        case 'onLoadStart':
          event.url = nativeEventParams.url;
          break;
        case 'onLoadEnd':
          event.url = nativeEventParams.url;
          event.success = nativeEventParams.success;
          event.error = nativeEventParams.error;
          break;

        default:
      }
      return event;
    },
  },
};

builtInTagComponentList.set('div', div);
builtInTagComponentList.set('button', button);
builtInTagComponentList.set('form', form);
builtInTagComponentList.set('img', img);
builtInTagComponentList.set('ul', ul);
builtInTagComponentList.set('li', li);
builtInTagComponentList.set('span', span);
builtInTagComponentList.set('label', label);
builtInTagComponentList.set('p', p);
builtInTagComponentList.set('a', a);
builtInTagComponentList.set('input', input);
builtInTagComponentList.set('textarea', textarea);
builtInTagComponentList.set('iframe', iframe);

export default {
  install(): void {
    // register all built-in components
    builtInTagComponentList.forEach((elementComponent, tagName) => {
      registerElement(tagName, elementComponent);
    });
  },
};
