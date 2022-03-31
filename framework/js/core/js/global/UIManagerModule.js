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
    if (/^__bind__.+/g.test(originalKey)) {
      const key = originalKey.replace(/^__bind__+/g, '');
      const { id } = node;
      const standardEventName = gestureKeyMap[key];
      if (standardEventName) {
        if (value === false) {
          global.ConsoleModule.debug(`RemoveEventListener gestureKeyMap id = ${id}, key = ${key}`);
          node[kEventsListsKey].push({
            name: standardEventName,
            cb: null,
          });
        } else if (value === true) {
          global.ConsoleModule.debug(`AddEventListener gestureKeyMap id = ${id}, key = ${key}`);
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
        }
      } else {
        const normalEventName = key.replace(/^(on)?/g, '').toLocaleLowerCase();
        if (value === false) {
          global.ConsoleModule.debug(`RemoveRenderListener id = ${id}, key = ${key}`);
          node[kEventsListsKey].push({
            name: normalEventName,
            cb: null,
          });
        } else if (value === true) {
          global.ConsoleModule.debug(`AddRenderListener id = ${id}, key = ${key}, name = ${normalEventName}`);
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
      // eslint-disable-next-line no-param-reassign
      delete node.props[originalKey];
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
  endBatch(renderId) {
    global.ConsoleModule.debug(`endBatch renderId = ${renderId}`);
    UIManagerModule.EndBatch((`${renderId}`));
    // Hippy.bridge.callNative('UIManagerModule', 'endBatch', (`${renderId}`));

    if (typeof flushQueueImmediate === 'function') {
      flushQueueImmediate();
    }
  },
  callUIFunction(id, name, param, cb) {
    global.ConsoleModule.debug(`callUIFunction id = ${id}, name = ${name}, param = ${JSON.stringify(param)}, 
      cb = ${typeof cb}`);
    let newcb;
    if (typeof cb === 'function') {
      newcb = function (arr) {
        cb(...arr);
      };
    }
    UIManagerModule.CallUIFunction(id, name, param, newcb);
  },
  sendRenderError(error) {
    if (error) {
      throw error;
    }
  },
  setContextName(contextName) {
    global.ConsoleModule.debug(`setContextName contextName = ${contextName}`);
    UIManagerModule.SetContextName(contextName);
  },
};
