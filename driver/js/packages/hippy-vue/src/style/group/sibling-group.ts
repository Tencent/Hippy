import ElementNode from '../../renderer/element-node';
import { SelectorsMatch } from '../css-selectors-match';
import { SimpleSelector } from '../selector/simple-selector';

export class SiblingGroup {
  public dynamic: boolean;
  public selectors: SimpleSelector[];

  public constructor(selectors: SimpleSelector[]) {
    this.selectors = selectors;
    this.dynamic = selectors.some((sel: SimpleSelector) => sel.dynamic);
  }

  public match(matchNode: ElementNode): ElementNode | null {
    let node = matchNode;
    if (!node) return null;
    const pass = this.selectors.every((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  public mayMatch(matchNode: ElementNode): ElementNode | null {
    let node = matchNode;
    if (!node) return null;
    const pass = this.selectors.every((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && !!sel.mayMatch(node);
    });
    return pass ? node : null;
  }

  public trackChanges(matchNode: ElementNode, map: SelectorsMatch) {
    let node = matchNode;
    this.selectors.forEach((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      if (!node) {
        return;
      }
      sel.trackChanges(node, map);
    });
  }
}

