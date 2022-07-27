import { Native } from '../native';

import { HippyElement } from './hippy-element';

/**
 * Hippy列表item元素，li，派生自HippyElement类
 *
 * @public
 */
export class HippyListItemElement extends HippyElement {
  constructor(tagName: string) {
    super(tagName);

    /**
     * 对 Native 事件进行polyfill，返回需要polyfill的事件名，无法匹配则返回空
     *
     * @param eventNames - 事件名称
     */
    this.polyFillNativeEvents = (eventNames: string): string => {
      if (eventNames === 'disappear') {
        return Native.isIOS() ? 'disappear' : 'disAppear';
      }

      return '';
    };
  }
}
