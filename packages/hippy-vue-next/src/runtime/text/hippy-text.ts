import type { HippyElement } from '../element/hippy-element';
import { HippyNode, NodeType } from '../node/hippy-node';

/**
 * 文本节点
 */
export class HippyText extends HippyNode {
  public text: string;

  constructor(text: string) {
    super(NodeType.TextNode);
    this.text = text;
  }

  public setText(text: string): void {
    this.text = text;
    if (this.parentNode && this.nodeType === NodeType.ElementNode) {
      (this.parentNode as HippyElement).setText(text);
    }
  }
}
