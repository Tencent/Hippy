/**
 * 实现Vue3 VNode mount所需的patch props方法
 */
import type { ComponentInternalInstance, VNode } from '@vue/runtime-core';
import { isOn } from '@vue/shared';

import { patchAttr } from './modules/attrs';
import { patchClass } from './modules/class';
import { patchEvent } from './modules/events';
import { patchStyle } from './modules/style';
import type { HippyElement } from './runtime/element/hippy-element';
import type { HippyNode } from './runtime/node/hippy-node';

export function patchProp(
  el: any,
  key: string,
  prevValue: any,
  nextValue: any,
  isSVG: boolean,
  // prevChildren 是Vue所使用的VNode
  prevChildren: VNode<HippyNode, HippyElement>[] | undefined,
  parentComponent: ComponentInternalInstance,
): void {
  // 需要说明的是，这里prop包含的值会有字符串，数字，数组，对象，等无法确定类型，因此使用any
  switch (key) {
    case 'class':
      patchClass(el, nextValue);
      break;
    case 'style':
      patchStyle(el, prevValue, nextValue);
      break;
    default:
      if (isOn(key)) {
        // 表示事件
        patchEvent(el, key, prevValue, nextValue, parentComponent);
      } else {
        // 处理属性
        patchAttr(el, key, nextValue);
      }
      break;
  }
}
