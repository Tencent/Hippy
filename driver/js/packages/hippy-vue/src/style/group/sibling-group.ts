import ElementNode from '../../renderer/element-node';
import ViewNode from '../../renderer/view-node';
import { SelectorsMatch } from '../css-selectors-match';
import { SimpleSelector } from '../selector/simple-selector';

export class SiblingGroup {
  public dynamic: boolean;
  public selectors: SimpleSelector[];

  public constructor(selectors: SimpleSelector[]) {
    this.selectors = selectors;
    this.dynamic = selectors.some((sel: SimpleSelector) => sel.dynamic);
  }

  public match(matchNode?: ViewNode): ViewNode | undefined {
    let node: ViewNode | undefined = matchNode;
    if (!node) return undefined;
    const pass = this.selectors.every((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node?.nextSibling;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : undefined;
  }

  public mayMatch(matchNode?: ViewNode): ViewNode | undefined {
    let node: ViewNode | undefined = matchNode;
    if (!node) return undefined;
    const pass = this.selectors.every((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node?.nextSibling;
      }
      return !!node && !!sel.mayMatch(node);
    });
    return pass ? node : undefined;
  }

  public trackChanges(matchNode: ViewNode, map: SelectorsMatch) {
    let node: ViewNode | undefined = matchNode;
    this.selectors.forEach((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node?.nextSibling;
      }
      if (!node) {
        return;
      }
      sel.trackChanges(node as ElementNode, map);
    });
  }
}

