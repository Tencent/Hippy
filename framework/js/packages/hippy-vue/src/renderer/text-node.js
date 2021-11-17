/* eslint-disable no-underscore-dangle */

import ViewNode from './view-node';
import { Text } from './native/components';

export default class TextNode extends ViewNode {
  constructor(text) {
    super();

    this.text = text;
    this._meta = {
      symbol: Text,
      skipAddToDom: true,
    };
  }

  setText(text) {
    this.text = text;
    this.parentNode.setText(text);
  }
}
