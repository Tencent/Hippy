/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const UIManagerModule = internalBinding('UIManagerModule');

const gestureKeyMap = {
  onClick: 'click',
  onLongClick: 'longclick',
  // onPressIn: 'touchstart', // 归一化处理
  // onPressOut: 'touchend', // 归一化处理
  onPressIn: 'pressin',
  onPressOut: 'pressout',
  onTouchDown: 'touchstart', // w3c是touchstart，此处兼容老代码
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

// 兼容 hippy2.0，hippy3.0 放量一段时间后可删除
function HandleEventListener(node) {
  if (!node.props) {
    return;
  }
  if (typeof node[kEventsListsKey] === 'undefined') {
    node[kEventsListsKey] = [];
  }
  for (const [key, value] of Object.entries(node.props)) {
    if (/^(on)/g.test(key)) {
      if (value === true) {
        const { id } = node;
        global.ConsoleModule.debug(`HandleEventListener id = ${id}, key = ${key}`);
        if (gestureKeyMap[key]) {
          const {
            EventDispatcher: {
              receiveNativeGesture = null,
            },
          } = __GLOBAL__.jsModuleList;
          node[kEventsListsKey].push({
            name: gestureKeyMap[key],
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
          const name = key.replace(/^(on)/g, '').toLocaleLowerCase();
          global.ConsoleModule.debug(`HandleEventListener id = ${id}, key = ${key}, name = ${name}`);
          const {
            EventDispatcher: {
              receiveUIComponentEvent = null,
            },
          } = __GLOBAL__.jsModuleList;
          node[kEventsListsKey].push({
            name,
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
