import { camelize } from '@vue/runtime-core';
import { isString } from '@vue/shared';

import type { HippyElement } from '../runtime/element/hippy-element';

/** 样式的类型 */
type Style = string | Record<string, string | string[]> | null;

/**
 * 设置Style属性
 *
 * @param rawEl - 要设置的元素
 * @param prev - 旧值
 * @param next - 新值
 */
export function patchStyle(
  rawEl: HippyElement,
  prev: Style,
  next: Style,
): void {
  const el = rawEl;

  if (!next) {
    // 清空样式
    el.removeAttribute('style');
  } else if (isString(next)) {
    // hippy应该都是array，抛异常
    throw new Error('Style is Not Array');
  } else {
    // next新样式是array，则将新样式全部应用
    Object.keys(next).forEach((key) => {
      el.setStyle(camelize(key), next[key]);
    });

    // 旧样式如果存在并且是数组，则遍历并移除
    if (prev && !isString(prev)) {
      Object.keys(prev).forEach((key) => {
        if (next[key] === null) {
          el.setStyle(camelize(key), '');
        }
      });
    }
  }
}
