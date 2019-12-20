import ElementNode from './element-node';
import Native from '../runtime/native';

/**
 * List element
 */
class ListNode extends ElementNode {
  /**
   * Scroll to child node with index
   */
  scrollToIndex(indexLeft = 0, indexTop = 0, needAnimation = true) {
    if (typeof indexLeft !== 'number' || typeof indexTop !== 'number') {
      return;
    }
    Native.callUIFunction(this, 'scrollToIndex', [indexLeft, indexTop, needAnimation]);
  }

  /**
   * Scroll children to specific position.
   */
  scrollToPosition(posX = 0, posY = 0, needAnimation = true)  {
    if (typeof posX !== 'number' || typeof posY !== 'number') {
      return;
    }
    Native.callUIFunction(this, 'scrollToContentOffset', [posX, posY, needAnimation]);
  }
}

export default ListNode;
