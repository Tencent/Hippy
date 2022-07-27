/**
 * Hippy 事件分发器，对用户触发或Native产生的事件进行分发
 */
import { trace } from '../../util';
import type { HippyCachedInstanceType } from '../../util/instance';
import { getHippyCachedInstance } from '../../util/instance';
import type { HippyNode } from '../node/hippy-node';

import { EventBus } from './event-bus';
import type { HippyGlobalEventHandlersEventMap } from './hippy-event';
import { HippyEvent, HippyLayoutEvent } from './hippy-event';

/** 扩展global对象，引入第三方注入的对象 */
declare global {
  // 这里是为了typescript定义的 var，所以disable eslint
  // eslint-disable-next-line  no-var, @typescript-eslint/naming-convention, vars-on-top
  var __GLOBAL__: any;
}

/** Native事件类型 */
export type NativeEvent = any[];

/** Native手势事件类型 */
export interface NativeGestureEvent {
  // 触发事件的Native节点id
  id: number;
  // 触发的事件名
  name: string;
}

/**
 * 获取Vue的事件名称
 *
 * @param eventName - 事件名
 * @param targetNode - 目标节点
 */
function getVueEventName(eventName: string, targetNode: HippyNode): string {
  const { eventNamesMap } = targetNode.component;
  // 如果事件名是组件自定义事件，直接返回事件名
  if (eventNamesMap?.has(eventName)) {
    return eventNamesMap.get(eventName) as string;
  }

  // 非on开头的事件可能是自定义事件，直接返回事件名
  if (eventName.indexOf('on') !== 0) {
    return eventName;
  }

  // 将Dom事件名的on去除，然后将得到的事件名首字母转小写
  // 例如Dom的onClick得到Vue使用的click
  const str = eventName.slice(2, eventName.length);
  return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
}

/**
 * 判断native event是否合法
 *
 * @param nativeEvent - native 事件
 */
function isInvalidNativeEvent(nativeEvent: NativeEvent): boolean {
  return !nativeEvent || !Array.isArray(nativeEvent) || nativeEvent.length < 2;
}

/**
 * 查找目标节点并返回
 *
 * @param targetNodeId - 目标节点的id
 */
function findTargetNode(targetNodeId: number): HippyNode | null {
  const vueInstance: Partial<HippyCachedInstanceType> = getHippyCachedInstance();

  if (vueInstance.instance) {
    const { $el: rootNode } = vueInstance.instance;

    return rootNode.findChild((node: HippyNode) => node.nodeId === targetNodeId);
  }

  return null;
}

/**
 * 定义Hippy事件分发器，并赋值给Native
 * Native会触发三种类型事件，并回调注册的三种回调方法
 */
const HippyEventDispatcher = {
  /**
   * 收到转发给Vue的终端事件，如页面可见等
   *
   * @param nativeEvent - native 事件
   */
  receiveNativeEvent(nativeEvent: NativeEvent): void {
    trace('receiverNativeEvent', nativeEvent);

    if (isInvalidNativeEvent(nativeEvent)) {
      return;
    }

    const [eventName, eventParams] = nativeEvent;

    // 将终端事件直接转发给event bus，由bus进行分发
    // 原来Vue2可以直接在vue的emit上监听事件，Vue3移除了该批api
    // 因此通过emitter事件总线进行事件转发
    EventBus.$emit(eventName, eventParams);
  },

  /**
   * 收到native的交互事件通知，如点击，滑动等事件
   *
   * @param nativeEvent - native 事件
   */
  receiveNativeGesture(nativeEvent: NativeGestureEvent): void {
    trace('receiveNativeGesture', nativeEvent);

    if (!nativeEvent) {
      return;
    }

    const { id: targetNodeId, name: eventName } = nativeEvent;
    const targetNode = findTargetNode(targetNodeId);

    if (!targetNode) {
      return;
    }

    const targetEventName = getVueEventName(eventName, targetNode);
    const targetEvent = new HippyEvent(targetEventName, targetNode);
    const { processEventData } = targetNode.component;
    if (processEventData) {
      processEventData(
        {
          __evt: eventName as keyof HippyGlobalEventHandlersEventMap,
          handler: targetEvent,
        },
        nativeEvent,
      );
    }
    targetNode.dispatchEvent(targetEvent);
  },

  /**
   * 接收到UI类的事件通知，如键盘输入等
   */
  receiveUIComponentEvent(nativeEvent: NativeEvent): void {
    trace('receiveUIComponentEvent', nativeEvent);

    if (isInvalidNativeEvent(nativeEvent)) {
      return;
    }

    const [targetNodeId, eventName, params] = nativeEvent;
    if (typeof targetNodeId !== 'number' || typeof eventName !== 'string') {
      return;
    }

    const targetNode = findTargetNode(targetNodeId);
    if (!targetNode) {
      return;
    }

    const targetEventName = getVueEventName(eventName, targetNode);

    // layout事件处理
    if (eventName === 'onLayout') {
      const { layout } = params;
      const targetLayoutEvent = new HippyLayoutEvent(
        targetEventName,
        targetNode,
      );
      targetLayoutEvent.top = layout.y;
      targetLayoutEvent.left = layout.x;
      targetLayoutEvent.bottom = layout.y + layout.height;
      targetLayoutEvent.right = layout.x + layout.width;
      targetLayoutEvent.width = layout.width;
      targetLayoutEvent.height = layout.height;
      // 分发事件执行
      targetNode.dispatchEvent(targetLayoutEvent);
    } else {
      const targetEvent = new HippyEvent(targetEventName, targetNode);

      // 其他事件处理，如果节点本身有额外事件处理逻辑，也需要处理
      const { processEventData } = targetNode.component;

      if (processEventData) {
        processEventData(
          {
            __evt: eventName as keyof HippyGlobalEventHandlersEventMap,
            handler: targetEvent,
          },
          params,
        );
      }
      // 分发事件执行
      targetNode.dispatchEvent(targetEvent);
    }
  },
};

// 将事件派发器注册给全局接口，Native事件触发会调用
// global.__GLOBAL__.jsModuleList.EventDispatcher内的方法

// 这里注册的全局对象是第三方，我们无法控制，因此关闭eslint检查
if (global.__GLOBAL__) {
  global.__GLOBAL__.jsModuleList.EventDispatcher = HippyEventDispatcher;
}
