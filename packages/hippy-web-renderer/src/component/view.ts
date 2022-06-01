import { InnerNodeTag } from '../types';
import { HippyView } from './hippy-view';

export class View extends HippyView<HTMLDivElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.VIEW;
    this.dom = document.createElement('div');
  }
}
