import { InnerNodeTag } from '../types';
import { HippyWebView } from './hippy-web-view';

export class View extends HippyWebView<HTMLDivElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.VIEW;
    this.dom = document.createElement('div');
  }
}
