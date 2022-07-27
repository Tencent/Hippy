/**
 * Hippy内置支持的tag列表
 */
import { NATIVE_COMPONENT_MAP, HIPPY_DEBUG_ADDRESS } from './config';
import type { TagComponent } from './runtime/component';
import { registerHippyTag } from './runtime/component';
import type { EventsUnionType } from './runtime/event/hippy-event';
import { Native } from './runtime/native';
import type { HippyNode } from './runtime/node/hippy-node';
import { mapHippyEvent, convertImageLocalPath, warn, arrayCount } from './util';

// 内置tag组件列表
const builtInTagComponentList: Map<string, TagComponent> = new Map();

/** 输入框类型 */
interface InputValueMapType {
  [key: string]: string;
}

// 输入框的类型
const INPUT_VALUE_MAP: InputValueMapType = {
  number: 'numeric',
  text: 'default',
  search: 'web-search',
};

// 无障碍属性
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

// div组件
const div: TagComponent = {
  name: NATIVE_COMPONENT_MAP.View,
  eventNamesMap: mapHippyEvent([
    ['touchStart', 'onTouchDown'], // TODO: Back compatible, will remove soon
    ['touchstart', 'onTouchDown'],
    ['touchmove', 'onTouchMove'],
    ['touchend', 'onTouchEnd'],
    ['touchcancel', 'onTouchCancel'],
  ]),
  attributeMaps: {
    ...accessibilityAttrMaps,
  },
  processEventData(evtData: EventsUnionType, nativeEventParams: any) {
    const { handler: event, __evt: nativeEventName } = evtData;

    switch (nativeEventName) {
      case 'onScroll':
      case 'onScrollBeginDrag':
      case 'onScrollEndDrag':
        event.offsetX = nativeEventParams.contentOffset?.x;
        event.offsetY = nativeEventParams.contentOffset?.y;
        // 如果是滚动事件并且事件响应中包含了滚动内容区域的尺寸，则将滚动内容区域的实际尺寸进行赋值
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
};

// button组件
const button: TagComponent = {
  name: NATIVE_COMPONENT_MAP.View,
  attributeMaps: div.attributeMaps,
  eventNamesMap: div.eventNamesMap,
  processEventData: div.processEventData,
};

// form组件
const form: TagComponent = {
  name: NATIVE_COMPONENT_MAP.View,
};

// img组件
const img: TagComponent = {
  name: NATIVE_COMPONENT_MAP.Image,
  eventNamesMap: div.eventNamesMap,
  processEventData: div.processEventData,
  defaultNativeStyle: {
    backgroundColor: 0,
  },
  attributeMaps: {
    // TODO: check placeholder or defaultSource value in compile-time wll be better.
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
};

// list组件
const ul: TagComponent = {
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
};

// list-item 组件
const li: TagComponent = {
  name: NATIVE_COMPONENT_MAP.ListViewItem,
  attributeMaps: {
    ...accessibilityAttrMaps,
  },
  eventNamesMap: mapHippyEvent([
    ['disappear', Native.isAndroid() ? 'onDisAppear' : 'onDisappear'],
  ]),
};

// span文本组件
const span: TagComponent = {
  name: NATIVE_COMPONENT_MAP.Text,
  attributeMaps: div.attributeMaps,
  eventNamesMap: div.eventNamesMap,
  processEventData: div.processEventData,
  defaultNativeProps: {
    text: '',
  },
  defaultNativeStyle: {
    color: 4278190080, // Black color(#000), necessary for Android
  },
};

// Label组件
const label: TagComponent = span;

// p组件
const p: TagComponent = span;

// a组件
const a: TagComponent = {
  ...span,
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
};

// input 组件
const input: TagComponent = {
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
          event.keyboardHeight /= Native.pixelRatio;
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
};

// textarea 组件
const textarea: TagComponent = {
  name: NATIVE_COMPONENT_MAP.TextInput,
  defaultNativeProps: {
    ...input.defaultNativeProps,
    numberOfLines: 5,
  },
  attributeMaps: {
    ...input.attributeMaps,
    rows: 'numberOfLines',
  },
  nativeProps: {
    multiline: true,
  },
  defaultNativeStyle: input.defaultNativeStyle,
  eventNamesMap: input.eventNamesMap,
  processEventData: input.processEventData,
};

// iframe 组件
const iframe: TagComponent = {
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
    },
  ) {
    const { handler: event, __evt: nativeEventName } = evtData;

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
};

// div组件
builtInTagComponentList.set('div', div);
// button组件
builtInTagComponentList.set('button', button);
// form组件
builtInTagComponentList.set('form', form);
// image组件
builtInTagComponentList.set('img', img);
// ul组件
builtInTagComponentList.set('ul', ul);
// li组件
builtInTagComponentList.set('li', li);
// span组件 label组件 p组件, 这三个在native都是一样的
builtInTagComponentList.set('span', span);
builtInTagComponentList.set('label', label);
builtInTagComponentList.set('p', p);
// a组件
builtInTagComponentList.set('a', a);
// input组件
builtInTagComponentList.set('input', input);
// textarea组件
builtInTagComponentList.set('textarea', textarea);
// iframe组件
builtInTagComponentList.set('iframe', iframe);

/**
 * 导出Vue使用组件中间件默认的install方法
 */
export default {
  install(): void {
    // 注册全部内置built-in组件
    builtInTagComponentList.forEach((tagComponent, tagName) => {
      registerHippyTag(tagName, tagComponent);
    });
  },
};
