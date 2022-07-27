import { HippyCommentElement } from '../element/hippy-comment-element';
import { HippyElement } from '../element/hippy-element';
import { HippyInputElement } from '../element/hippy-input-element';
import { HippyListElement } from '../element/hippy-list-element';
import { HippyListItemElement } from '../element/hippy-list-item-element';
import { HippyNode, NodeType } from '../node/hippy-node';
import { HippyText } from '../text/hippy-text';

/**
 * Hippy document元素，派生自HippyNode类，提供创建各种element和node的方法
 */
export class HippyDocument extends HippyNode {
  /**
   * 使用text内容创建注释节点
   *
   * @param text - 注释内容
   */
  static createComment(text: string): HippyCommentElement {
    return new HippyCommentElement(text);
  }

  /**
   * 根据tagName创建不同元素的接口
   *
   * @param tagName - 标签名
   */
  static createElement(tagName: string):
  | HippyElement
  | HippyInputElement
  | HippyListElement
  | HippyListItemElement {
    switch (tagName) {
      case 'input':
      case 'textarea':
        return new HippyInputElement(tagName);
      case 'ul':
        return new HippyListElement(tagName);
      case 'li':
        return new HippyListItemElement(tagName);
      // 默认创建的是Element
      default:
        return new HippyElement(tagName);
    }
  }

  /**
   * 使用text内容创建注释节点
   *
   * @param text - 文本内容
   */
  static createTextNode(text: string): HippyText {
    return new HippyText(text);
  }

  constructor() {
    super(NodeType.DocumentNode);
  }
}
