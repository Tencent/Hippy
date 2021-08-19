import Native from '../runtime/native';
import ElementNode from './element-node';

/**
 * ListItemNode element
 */
class ListItemNode extends ElementNode {
  /**
   * Poly fill native event
   */
  polyFillNativeEvents(method, eventNames, callback, options) {
    const eventHandlerMap = {
      addEvent: 'addEventListener',
      removeEvent: 'removeEventListener',
    };
    let name = eventNames;
    if (eventNames === 'disappear') {
      name = Native.Platform === 'ios' ? 'disappear' : 'disAppear';
      if (this.emitter && eventHandlerMap[method]) {
        const handler = eventHandlerMap[method];
        this.emitter[handler](name, callback, options);
      }
    }
  }
}

export default ListItemNode;
