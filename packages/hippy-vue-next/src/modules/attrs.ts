import type { HippyElement } from '../runtime/element/hippy-element';

/**
 * 设置元素属性值
 *
 * @param el - 元素
 * @param key - 设置的key
 * @param value - 设置的值
 */
export function patchAttr(
  el: HippyElement,
  key: string,
  value: any,
): void {
  el.setAttribute(key, value);
}
