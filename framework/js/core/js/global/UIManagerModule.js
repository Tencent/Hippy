/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const UIManagerModule = internalBinding('UIManagerModule');

const gestureKeyMap = {
  onClick: 'click',
  onLongClick: 'longclick',
  // onPressIn: 'touchstart', // normalization
  // onPressOut: 'touchend', // normalization
  onPressIn: 'pressin',
  onPressOut: 'pressout',
  onTouchDown: 'touchstart', // compatible with w3c standard name touchstart
  onTouchStart: 'touchstart',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchCancel: 'touchcancel',
};

// const uiEventKeyMap = {
//   onLayout: 'layout',
//   onShow: 'show',
//   onDismiss: 'dismiss',
// };


const kEventsListsKey = '__events';

// compatible with hippy2.0
function HandleEventListener(node) {
  if (!node.props) {
    return;
  }
  if (typeof node[kEventsListsKey] === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    node[kEventsListsKey] = [];
  }
  for (const originalKey of Object.keys(node.props)) {
    const value = node.props[originalKey];
    if (/^__bind__.+/g.test(originalKey) && value === true) {
      const key = originalKey.replace(/^__bind__+/g, '');
      const { id } = node;
      const standardEventName = gestureKeyMap[key];
      if (standardEventName) {
        global.ConsoleModule.debug(`HandleEventListener gestureKeyMap id = ${id}, key = ${key}`);
        const {
          EventDispatcher: {
            receiveNativeGesture = null,
          },
        } = __GLOBAL__.jsModuleList;
        node[kEventsListsKey].push({
          name: standardEventName,
          cb(param) {
            global.ConsoleModule.debug(`param = ${param}`);
            global.ConsoleModule.debug(`id = ${id}`);
            if (receiveNativeGesture) {
              const event = {
                id, name: key,
              };
              Object.assign(event, param);
              receiveNativeGesture(event);
            }
          },
        });
      } else {
        const normalEventName = key.replace(/^(on)?/g, '').toLocaleLowerCase();
        global.ConsoleModule.debug(`HandleEventListener other id = ${id}, key = ${key}, name = ${normalEventName}`);
        const {
          EventDispatcher: {
            receiveUIComponentEvent = null,
          },
        } = __GLOBAL__.jsModuleList;
        node[kEventsListsKey].push({
          name: normalEventName,
          cb(param) {
            if (receiveUIComponentEvent) {
              const event = [id, key, param];
              receiveUIComponentEvent(event);
            }
          },
        });
      }
    }
  }
}

Hippy.document = {
  createNode(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`createNode queue = ${JSON.stringify(queue)}`);
    queue.forEach(each => HandleEventListener(each));
    UIManagerModule.CreateNodes(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'createNode', rootViewId, queue);
  },
  updateNode(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`updateNode queue = ${JSON.stringify(queue)}`);
    queue.forEach(each => HandleEventListener(each));
    UIManagerModule.UpdateNodes(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'updateNode', rootViewId, queue);
  },
  deleteNode(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`deleteNode queue = ${JSON.stringify(queue)}`);
    // queue.forEach(each => HandleEventListener(each));
    UIManagerModule.DeleteNodes(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'deleteNode', rootViewId, queue);
  },
  flushBatch(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`flushBatch queue = ${JSON.stringify(queue)}`);
    queue.forEach(each => HandleEventListener(each));
    UIManagerModule.FlushBatch(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'flushBatch', rootViewId, queue);
  },
  startBatch(renderId) {
    global.ConsoleModule.debug(`global renderId = ${renderId}`);
    UIManagerModule.StartBatch((`${renderId}`));
    // Hippy.bridge.callNative('UIManagerModule', 'startBatch', (`${renderId}`));
  },
  endBatch(renderId) {
    global.ConsoleModule.debug(`endBatch renderId = ${renderId}`);
    UIManagerModule.EndBatch((`${renderId}`));
    // Hippy.bridge.callNative('UIManagerModule', 'endBatch', (`${renderId}`));

    if (typeof flushQueueImmediate === 'function') {
      flushQueueImmediate();
    }
  },
  sendRenderError(error) {
    if (error) {
      throw error;
    }
  },
};
