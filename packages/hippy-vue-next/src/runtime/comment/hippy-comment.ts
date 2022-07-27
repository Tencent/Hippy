import { HippyNode, NodeType } from '../node/hippy-node';

/**
 * 注释节点
 */
export class HippyComment extends HippyNode {
  public text: string;

  constructor(text: string) {
    super(NodeType.CommentNode);
    this.text = text;
  }
}
