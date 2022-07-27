import { Native } from '../native';

import { HippyElement } from './hippy-element';

/**
 * Hippy输入框元素，如input，textarea等，派生自HippyElement类
 *
 * @public
 */
export class HippyInputElement extends HippyElement {
  /**
   * 设置节点的文本内容
   *
   * @param text - 文本内容
   */
  public setText(text: string): void {
    if (this.tagName === 'textarea') {
      // textarea的文本内容是节点的value
      this.setAttribute('value', text);
    } else {
      // 其他节点文本内容就是节点的text属性
      this.setAttribute('text', text);
    }
  }

  /**
   * 获取 input 元素的内容
   */
  async getValue(): Promise<string> {
    return new Promise(resolve => Native.callUIFunction(this, 'getValue', (r: { text: string }) => resolve(r.text)));
  }

  /**
   * 设置 input 元素的内容
   */
  setValue(value: string): void {
    Native.callUIFunction(this, 'setValue', [value]);
  }

  /**
   * 让 input 元素获取焦点
   */
  focus(): void {
    Native.callUIFunction(this, 'focusTextInput', []);
  }

  /**
   * 让 input 元素失去焦点
   */
  blur(): void {
    Native.callUIFunction(this, 'blurTextInput', []);
  }

  /**
   * 清除 input 元素内容
   */
  clear(): void {
    Native.callUIFunction(this, 'clear', []);
  }

  /**
   * 展示输入法菜单
   */
  showInputMenu(): void {
    Native.callUIFunction(this, 'showInputMethod', []);
  }

  /**
   * 隐藏输入法菜单
   */
  hideInputMenu(): void {
    Native.callUIFunction(this, 'hideInputMethod', []);
  }
}
