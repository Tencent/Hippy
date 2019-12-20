/* eslint-disable no-underscore-dangle */

import ElementNode from './element-node';
import { Text } from './native/components';

class CommentNode extends ElementNode {
  constructor(text) {
    super('comment');

    this.text = text;
    this._meta = {
      symbol: Text,
      skipAddToDom: true,
    };
  }
}

export default CommentNode;
