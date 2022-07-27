import type { ComponentInternalInstance } from '@vue/runtime-core';
import { callWithAsyncErrorHandling, ErrorCodes } from '@vue/runtime-core';

import type { CallbackType } from '../../global';
import type { HippyElement } from '../runtime/element/hippy-element';
import { lowerFirstLetter } from '../util';

/** 事件回调类型 */
type EventValue = CallbackType | CallbackType[];

/** Vue事件回调接口类型 */
interface Invoker extends EventListener {
  value: EventValue;
  attached?: number;
}

/** Native事件Option */
interface EventOption {
  [key: string]: boolean;
}

// 事件修饰符正则判断表达式
const optionsModifierRE = /(?:Once|Passive|Capture)$/;

/**
 * 处理事件名，去掉on并将首字母转小写
 *
 * @param eventName - 事件名
 */
function parseName(eventName: string): (string | EventOption)[] {
  let name = eventName;
  const options: EventOption = {};
  if (optionsModifierRE.test(name)) {
    let match = name.match(optionsModifierRE);
    while (match) {
      name = name.slice(0, name.length - match[0].length);
      options[match[0].toLowerCase()] = true;
      match = name.match(optionsModifierRE);
    }
  }

  // 去掉事件名中的on,然后首字母转小写
  return [lowerFirstLetter(name.slice(2)), options];
}

/**
 * 创建事件执行方法
 *
 * @param initialValue - 事件的初始值
 * @param instance - vue 实例
 */
function createInvoker(
  initialValue: EventValue,
  instance: ComponentInternalInstance | null,
) {
  const invoker = (e: Event) => {
    callWithAsyncErrorHandling(
      invoker.value as Invoker,
      instance,
      ErrorCodes.NATIVE_EVENT_HANDLER,
      [e],
    );
  };
  invoker.value = initialValue;

  return invoker;
}

/**
 * 给元素设置事件
 *
 * @param rawEl - 要设置的元素
 * @param rawName - 事件名称
 * @param prevValue - 旧值
 * @param nextValue - 新值
 * @param instance - vue 实例
 */
export function patchEvent(
  rawEl: HippyElement & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  prevValue: EventValue | null,
  nextValue: EventValue | null,
  instance: ComponentInternalInstance | null = null,
): void {
  // vei = vue event invokers
  const el = rawEl;
  const invokers: Record<string, Invoker | undefined> =
    el._vei ?? (el._vei = {});
  const existingInvoker: Invoker | undefined = invokers[rawName];

  if (nextValue && existingInvoker) {
    // 更新事件
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);

    if (nextValue) {
      // 添加事件，先创建事件并保存在_vei中，然后给el绑定事件
      invokers[rawName] = createInvoker(nextValue, instance);
      const invoker = invokers[rawName];
      el.addEventListener(
        name as string,
        invoker as Invoker,
        options as EventOption,
      );
    } else {
      // 移除事件，先从el移除事件
      el.removeEventListener(
        name as string,
        existingInvoker as Invoker,
        options as EventOption,
      );
      // 然后移除_vei中的事件
      invokers[rawName] = undefined;
    }
  }
}
