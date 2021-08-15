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
  scrollToPosition(posX = 0, posY = 0, needAnimation = true) {
    if (typeof posX !== 'number' || typeof posY !== 'number') {
      return;
    }
    Native.callUIFunction(this, 'scrollToContentOffset', [posX, posY, needAnimation]);
  }

  /**
   * Polyfill native event
   */
  polyFillNativeEvents(method, eventNames, callback, options) {
    const eventHandlerMap = {
      addEvent: 'addEventListener',
      removeEvent: 'removeEventListener',
    };
    let name = eventNames;
    if (eventNames === 'endReached' || eventNames === 'loadMore') {
      name = eventNames === 'endReached' ? 'loadMore' : 'endReached';
      if (this.emitter && eventHandlerMap[method]) {
        const handler = eventHandlerMap[method];
        this.emitter[handler](name, callback, options);
      }
    }
  }
}

export default ListNode;
