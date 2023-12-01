import ElementNode from '../../renderer/element-node';
import { SelectorsMatch } from '../css-selectors-match';
import { SiblingGroup } from './sibling-group';

export class ChildGroup {
  public dynamic: boolean;
  public selectors: SiblingGroup[];

  public constructor(selectors: SiblingGroup[]) {
    this.selectors = selectors;
    this.dynamic = selectors.some((sel: SiblingGroup) => sel.dynamic);
  }

  public match(matchNode: ElementNode): ElementNode | null {
    let node = matchNode;
    if (!node) return null;
    const pass = this.selectors.every((sel: SiblingGroup, i: number) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  public mayMatch(matchNode: ElementNode): ElementNode | null {
    let node = matchNode;
    if (!node) return null;
    const pass = this.selectors.every((sel: SiblingGroup, i: number) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.mayMatch(node);
    });
    return pass ? node : null;
  }

  public trackChanges(matchNode: ElementNode, map: SelectorsMatch) {
    let node = matchNode;
    this.selectors.forEach((sel: SiblingGroup, i: number) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      if (!node) {
        return;
      }
      sel.trackChanges(node, map);
    });
  }
}
