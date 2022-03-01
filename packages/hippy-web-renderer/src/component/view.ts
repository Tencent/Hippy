import { InnerNodeTag } from '../../types';
import { HippyView } from './hippy-view';

export class View extends HippyView<HTMLDivElement> {
  public constructor(id: number, pId: number) {
    super(id, pId);
    this.tagName = InnerNodeTag.VIEW;
    this.dom = document.createElement('div');
  }
}
