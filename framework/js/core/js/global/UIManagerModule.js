/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const UIManagerModule = internalBinding('UIManagerModule');

const gestureKeyMap = {
  onClick: 'click',
  onLongClick: 'longclick',
  onPressIn: 'touchstart', // 归一化处理
  onPressOut: 'touchend', // 归一化处理
  onTouchDown: 'touchstart',  // w3c是touchstart，此处兼容老代码
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchCancel: 'touchcancel',
};

const uiEventKeyMap = {
  onLayout: 'layout',
  onShow: 'show',
  onDismiss: 'dismiss',
};

// 兼容 hippy2.0，hippy3.0 放量一段时间后可删除
function HandleEventListener(node) {
  if (!node.props) {
    return;
  }
  for (const [key, value] of Object.entries(node.props)) {
    if ((gestureKeyMap[key] || uiEventKeyMap[key]) && value === true) {
      let name;
      const { id } = node;
      global.ConsoleModule.debug(`HandleEventListener id = ${id}, key = ${key}`);
      if (gestureKeyMap[key]) {
        name = gestureKeyMap[key];
        const {
          EventDispatcher: {
            receiveNativeGesture = null,
          },
        } = __GLOBAL__.jsModuleList;
        node[key] = function (param) {
          if (receiveNativeGesture) {
            const event = {
              id, name,
            };
            Object.assign(event, param);
            receiveNativeGesture(event);
          }
        };
      } else if (uiEventKeyMap[key]) {
        name = uiEventKeyMap[key];
        const {
          EventDispatcher: {
            receiveUIComponentEvent = null,
          },
        } = __GLOBAL__.jsModuleList;
        node[key] = function (param) {
          if (receiveUIComponentEvent) {
            const event = [id, name, param];
            receiveUIComponentEvent(event);
          }
        };
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
