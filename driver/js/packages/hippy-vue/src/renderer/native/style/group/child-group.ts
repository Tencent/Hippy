import { SelectorsMatch } from '../css-selectors-match';
import { SimpleSelector } from '../selector/simple-selector';

export class ChildGroup {
  public dynamic: boolean;
  public selectors: SimpleSelector[];

  public constructor(selectors: SimpleSelector[]) {
    this.selectors = selectors;
    this.dynamic = selectors.some((sel: SimpleSelector) => sel.dynamic);
  }

  public match(matchNode: any) {
    let node = matchNode;
    if (!node) return false;
    const pass = this.selectors.every((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  public mayMatch(matchNode: any) {
    let node = matchNode;
    if (!node) return false;
    const pass = this.selectors.every((sel: SimpleSelector, i: number) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.mayMatch(node);
    });
    return pass ? node : null;
  }

  public trackChanges(matchNode: any, map: SelectorsMatch) {
    let node = matchNode;
    this.selectors.forEach((sel: SimpleSelector, i: number) => {
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
