import { Native } from '../native';

import { HippyElement } from './hippy-element';

/**
 * Hippy列表元素，ul，派生自HippyElement类
 *
 * @public
 */
export class HippyListElement extends HippyElement {
  constructor(tagName: string) {
    super(tagName);

    /**
     * 对 Native 事件进行polyfill，返回需要polyfill的事件名，无法匹配则返回空
     *
     * @param eventNames - 事件名称
     */
    this.polyFillNativeEvents = (eventNames: string): string => {
      if (eventNames === 'endReached' || eventNames === 'loadMore') {
        return eventNames === 'endReached' ? 'loadMore' : 'endReached';
      }

      return '';
    };
  }

  /**
   * 滚动至指定 index 节点处
   */
  public scrollToIndex(
    indexLeft = 0,
    indexTop = 0,
    needAnimation = true,
  ): void {
    Native.callUIFunction(this, 'scrollToIndex', [
      indexLeft,
      indexTop,
      needAnimation,
    ]);
  }

  /**
   * 滚动至指定 offset 位置处
   */
  public scrollToPosition(posX = 0, posY = 0, needAnimation = true): void {
    Native.callUIFunction(this, 'scrollToContentOffset', [
      posX,
      posY,
      needAnimation,
    ]);
  }
}
