/**
 * util工具类集合
 */
import type { ComponentPublicInstance } from '@vue/runtime-core';
import { capitalize } from '@vue/shared';

import type { CallbackType, CommonMapParams } from '../../global';
import { HIPPY_DEBUG_ADDRESS, HIPPY_STATIC_PROTOCOL, IS_PROD } from '../config';

let uniqueId = 0;

// rootViewId初始值，因为默认为0，生成id时会加1，root container id一定是1
export const DEFAULT_ROOT_ID = 1;

export function getUniqueId(): number {
  uniqueId += 1;

  // id不使用整10数字，从hippy-vue copy而来，实现原因需要了解
  if (uniqueId % 10 === 0) {
    uniqueId += 1;
  }

  return uniqueId;
}

/**
 * 将调试信息输出到console中
 *
 * @param context - 要跟踪的内容
 */
export function trace(...context: any[]): void {
  // 生产环境不输出
  if (IS_PROD) {
    return;
  }

  // console统一封装处理
  // eslint-disable-next-line no-console
  console.log(...context);
}

/**
 * 将警告调试信息输出到console中
 *
 * @param context - 要输出的内容
 */
export function warn(...context: any[]): void {
  // 生产环境不输出
  if (IS_PROD) {
    return;
  }

  // console统一封装处理
  // eslint-disable-next-line no-console
  console.warn(...context);
}

/**
 * 统一标准化标签名
 *
 * @param tagName - 标签名
 */
export function normalizeTagName(tagName: string): string {
  return tagName.toLowerCase();
}

/**
 * 将字符串的首字母小写
 *
 * @param str - 要处理的字符串
 */
export function lowerFirstLetter(str: string): string {
  return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
}

/**
 * 将字符串的首字母大写
 *
 * @param str - 要处理的字符串
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 数字格式正则
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');

/**
 * 将字符串尽可能转为数字
 */
export function tryConvertNumber<T extends string | number>(
  str: T,
): T extends number ? number : string | number;

/**
 * 将字符串尽可能转为数字
 */
export function tryConvertNumber(str: string | number): string | number {
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

// 样式加载钩子
let beforeLoadStyleHook: CallbackType = (declaration: CallbackType): CallbackType => declaration;

/**
 * 保存样式加载的钩子函数
 *
 * @param beforeLoadStyle - 样式预处理钩子
 */
export function setBeforeLoadStyle(beforeLoadStyle: CallbackType): void {
  beforeLoadStyleHook = beforeLoadStyle;
}

/**
 * 返回样式加载的钩子函数
 */
export function getBeforeLoadStyle(): CallbackType {
  return beforeLoadStyleHook;
}

/**
 * 将 unicode 格式字符串转成 char 型
 *
 * @param text - 待转换的文本
 */
export function unicodeToChar(text: string): string {
  return text.replace(/\\u[\dA-F]{4}|\\x[\dA-F]{2}/gi, match => String.fromCharCode(parseInt(match.replace(/\\u|\\x/g, ''), 16)));
}

/**
 * 比较两个Set是否相等
 *
 * @param leftSet - 待比较的set1
 * @param rightSet - 待比较的set2
 */
export function setsAreEqual(
  leftSet: Set<unknown>,
  rightSet: Set<unknown>,
): boolean {
  if (leftSet.size !== rightSet.size) {
    return false;
  }

  const values = leftSet.values();
  let leftValue = values.next().value;

  while (leftValue) {
    if (!rightSet.has(leftValue)) {
      return false;
    }
    leftValue = values.next().value;
  }

  return true;
}

/**
 * 对Hippy事件进行 Map，vue事件名格式和native事件名格式互相处理
 *
 * @param generalEventParams - 通用事件参数
 * @param rawNativeEventName - 终端事件名
 */
export function mapHippyEvent(
  generalEventParams: string | string[][],
  rawNativeEventName?: string,
): Map<string, string> {
  const map = new Map();

  // 如果第一个参数是数组，则第一个参数是事件 map 列表
  if (Array.isArray(generalEventParams)) {
    // vueEventName标识click，change等vue监听等事件名，无on
    // native事件名则是onXxx格式
    generalEventParams.forEach(([vueEventName, nativeEventName]) => {
      map.set(vueEventName, nativeEventName);
      map.set(nativeEventName, vueEventName);
    });
  } else {
    map.set(generalEventParams, rawNativeEventName);
    map.set(rawNativeEventName, generalEventParams);
  }

  return map;
}

/**
 * 将本地格式的路径转换为Native可以识别的格式
 *
 * @param originalUrl - 待转换的原始url
 */
export function convertImageLocalPath(originalUrl: string): string {
  let url: string = originalUrl;

  if (/^assets/.test(url)) {
    if (IS_PROD) {
      url = `${HIPPY_STATIC_PROTOCOL}./${url}`;
    } else {
      url = `${HIPPY_DEBUG_ADDRESS}${url}`;
    }
  }

  return url;
}

/**
 * 统计数组元素总数，需要过滤不符合要求的 item
 *
 * @param arr - 待统计的数组
 * @param iterator - 需要执行的回调
 */
export function arrayCount(arr: any[], iterator: CallbackType): number {
  let count = 0;

  for (const arrayItem of arr) {
    if (iterator(arrayItem)) {
      count += 1;
    }
  }

  return count;
}

/**
 * 获取标准事件名，类似onClick
 *
 * @param name - 事件名
 */
export function getNormalizeEventName(name: string): string {
  return `on${capitalize(name)}`;
}

/**
 * 获取事件转发器处理后的事件，
 *
 * 因为比如swiper，提供给用户在vue上定义的事件与native实际事件名有所不同，
 * 所以需要进行转换，在vue2中，事件需要单独赋值给on属性，vue3拍平了属性
 *
 * @param events - 事件列表
 */
export function getEventRedirects(
  this: ComponentPublicInstance,
  events: string[] | string[][],
): CommonMapParams {
  const on: CommonMapParams = {};

  events.forEach((event) => {
    // 对于array的情况，exposedEventName已经在vue中声明，因此需要处理nativeEvent
    // 对于非array的情况，因为vue现在已经是对属性处理成onXXX类型了，所以这里无需再处理了
    if (Array.isArray(event)) {
      // exposedEventName已经在vue中声明，nativeEventName已经在native中声明
      // 用户标签上定义的事件名
      const exposedEventName = getNormalizeEventName(event[0]);
      // 终端native所使用的事件名
      const nativeEventName = getNormalizeEventName(event[1]);

      // 如果已经定义了vue事件，则可以进行事件转换，否则不处理
      if (Object.prototype.hasOwnProperty.call(this.$attrs, exposedEventName)) {
        // 如果没有定义native事件则使用vue事件
        if (!this.$attrs[nativeEventName]) {
          on[nativeEventName] = this.$attrs[exposedEventName];
        }
      }
    }
  });

  return on;
}
