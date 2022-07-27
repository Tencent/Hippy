import { looseEqual } from '@vue/shared';

import type { CallbackType } from '../../../global';

import type { HippyEvent } from './hippy-event';

/** 回调事件参数类型 */
export interface EventListenerOptions {
  // 事件选项参数
  [key: string]: string | boolean;
}

/** 回调事件类型 */
interface EventListener {
  // 事件回调
  callback: CallbackType;
  // 事件选项参数
  options?: EventListenerOptions;
}

/** 回调事件列表 */
interface EventListeners {
  [eventName: string]: EventListener[] | undefined;
}

/**
 * Hippy Event Target，所有Node和Element的事件对象基类
 */
export abstract class HippyEventTarget {
  /**
   * 在事件回调列表中查找匹配的回调的索引位置
   *
   * @param list - 存储事件监听器列表
   * @param callback - 事件回调函数
   * @param options - 选项参数
   *
   */
  private static indexOfListener(
    list: EventListener[],
    callback: CallbackType,
    options: EventListenerOptions,
  ): number {
    return list.findIndex((entry) => {
      if (options) {
        return (
          entry.callback === callback && looseEqual(entry.options, options)
        );
      }

      return entry.callback === callback;
    });
  }

  // 事件监听列表
  protected listeners: EventListeners = {};

  /**
   * 添加事件监听器
   *
   * @param type - 事件类型
   * @param callback - 事件回调
   * @param options - 选项参数
   */
  public addEventListener(
    type: string,
    callback: CallbackType,
    options?: EventListenerOptions,
  ): void {
    // 事件名可以有多个，主要用于native-component的事件映射
    // 在模版中的事件名为通用事件名，实际Native的可能是另外的名称
    const events = type.split(',');
    const len = events.length;
    for (let i = 0; i < len; i += 1) {
      const eventName = events[i].trim();

      // 获取当前已注册的事件
      const existEventList = this.listeners[eventName];
      // 事件列表
      const eventList = existEventList ?? [];

      eventList.push({
        callback,
        options,
      });

      // 保存事件列表
      this.listeners[eventName] = eventList;
    }
  }

  /**
   * 移除事件监听器
   *
   * @param type - 事件类型
   * @param callback - 事件回调
   * @param options - 选项参数
   */
  public removeEventListener(
    type: string,
    callback: CallbackType,
    options?: EventListenerOptions,
  ): void {
    // 事件名可以有多个，主要用于native-component的事件映射
    // 在模版中的事件名为通用事件名，实际Native的可能是另外的名称
    const events = type.split(',');
    const len = events.length;
    for (let i = 0; i < len; i += 1) {
      const eventName = events[i].trim();

      if (callback) {
        // 指定了回调则移除回调
        if (this.listeners[eventName]) {
          const list = this.listeners[eventName];

          if (list?.length) {
            // 查找指定回调找到则移除指定回调
            const index = HippyEventTarget.indexOfListener(
              list,
              callback,
              options as EventListenerOptions,
            );

            if (index >= 0) {
              // 如果有匹配的选项，则移除
              list.splice(index, 1);
            }

            // 如果移除回调之后，回调列表为空，则清除回调
            if (!list.length) {
              this.listeners[eventName] = undefined;
            }
          }
        }
      } else {
        // 未指定回调则移除整个事件的回调
        this.listeners[eventName] = undefined;
      }
    }
  }

  /**
   * 执行事件
   *
   * @param event - 触发的事件实例
   */
  public emitEvent(event: HippyEvent): void {
    const { type: eventName } = event;
    const listeners = this.listeners[eventName];

    // 将指定事件类型的回调函数列表取出并逐一执行
    if (!listeners) {
      return;
    }

    for (let i = listeners.length - 1; i >= 0; i -= 1) {
      const listener = listeners[i];

      // 如果事件是once，则仅执行一次
      if (listener.options?.once) {
        listeners.splice(i, 1);
      }

      // 如果指定了 this 变量，则使用指定的this
      if (listener.options?.thisArg) {
        listener.callback.apply(listener.options.thisArg, [event]);
      } else {
        listener.callback(event);
      }
    }
  }

  /**
   * 获取当前节点所绑定的事件列表
   */
  public getEventListenerList(): EventListeners {
    return this.listeners;
  }

  /**
   * 传入触发的事件对象，分发事件执行
   *
   * @param event - Hippy事件对象
   */
  public abstract dispatchEvent(event: HippyEvent): void;
}
