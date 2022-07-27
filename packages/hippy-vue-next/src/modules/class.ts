import type { HippyElement } from '../runtime/element/hippy-element';

/**
 * 给元素设置class属性
 *
 * @param el - 要设置的元素
 * @param newValue - 要设置的新值
 */
export function patchClass(el: HippyElement, newValue: string): void {
  let value = newValue;

  if (value === null) {
    value = '';
  }

  // directly setting className should be faster than setAttribute in theory
  // if this is an element during a transition, take the temporary transition
  // classes into account.
  // 动画class后续再来处理
  // const transitionClasses = (el as ElementWithTransition)._vtc;
  const transitionClasses = '';
  if (transitionClasses) {
    value = (
      value ? [value, ...transitionClasses] : [...transitionClasses]
    ).join(' ');
  }

  el.setAttribute('class', value);
}
