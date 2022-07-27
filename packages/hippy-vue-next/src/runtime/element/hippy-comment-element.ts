import { HippyElement } from './hippy-element';

/**
 * Hippy评论元素，派生自HippyElement类
 *
 * @public
 */
class HippyCommentElement extends HippyElement {
  public text: string;

  constructor(text: string) {
    super(text);

    this.text = text;

    // 评论节点无需插入Native
    this.isNeedInsertToNative = false;
  }
}

export { HippyCommentElement };
