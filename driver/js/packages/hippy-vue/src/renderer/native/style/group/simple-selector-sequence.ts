import { SelectorsMap } from '../css-selectors-map';
import { SelectorsMatch } from '../css-selectors-match';
import { SelectorCore } from '../selector/core-selector';
import { SimpleSelector } from '../selector/simple-selector';
import { wrap } from '../util';

export class SimpleSelectorSequence extends SimpleSelector {
  public head: SimpleSelector | null | boolean;
  public selectors: SimpleSelector[];

  public constructor(selectors: SimpleSelector[]) {
    super();
    this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
    this.head = selectors.reduce(
      (prev: null | boolean | SimpleSelector, curr: SimpleSelector) => (!prev
          || (prev instanceof SimpleSelector && curr.rarity > prev.rarity)
        ? curr
        : prev),
      null,
    );
    this.dynamic = selectors.some((sel: SimpleSelector) => sel.dynamic);
    this.selectors = selectors;
  }

  toString() {
    return `${this.selectors.join('')}${wrap(this.combinator)}`;
  }

  public match(node: any) {
    if (!node) return false;
    return this.selectors.every((sel: SimpleSelector) => sel.match(node));
  }

  public mayMatch(node: any) {
    if (!node) return false;
    return this.selectors.every((sel: SimpleSelector) => sel.mayMatch(node));
  }

  public trackChanges(node: any, match: SelectorsMatch) {
    this.selectors.forEach((sel: SimpleSelector) => sel.trackChanges(node, match));
  }

  public lookupSort(sorter: SelectorsMap, base: SelectorCore) {
    if (this.head && this.head instanceof SimpleSelector) {
      this.head.lookupSort(sorter, base || this);
    }
  }

  public removeSort(sorter: SelectorsMap, base: SelectorCore) {
    if (this.head && this.head instanceof SimpleSelector) {
      this.head.removeSort(sorter, base || this);
    }
  }
}
