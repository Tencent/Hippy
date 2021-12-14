/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const UIManagerModule = internalBinding('UIManagerModule');

// 兼容 hippy2.0，hippy3.0 放量一段时间后可删除, __标识 hippy 保留方法
global.__onClick = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onClick;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onLongClick = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onLongClick;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchStart = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchStart;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchMove = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchMove;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchEnd = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchEnd;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchCancel = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchCancel;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onAttachedToWindow = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onAttachedToWindow;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onDetachedFromWindow = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onDetachedFromWindow;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onShow = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onShow;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onDismiss = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.EventDispatcher.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onDismiss;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

Hippy.document = {
  createNode(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`createNode queue = ${JSON.stringify(queue)}`);
    UIManagerModule.CreateNodes(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'createNode', rootViewId, queue);
  },
  updateNode(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`updateNode queue = ${JSON.stringify(queue)}`);
    UIManagerModule.UpdateNodes(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'updateNode', rootViewId, queue);
  },
  deleteNode(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`deleteNode queue = ${JSON.stringify(queue)}`);
    UIManagerModule.DeleteNodes(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'deleteNode', rootViewId, queue);
  },
  flushBatch(rootViewId, queue) {
    global.ConsoleModule.debug(`rootViewId = ${rootViewId}`);
    global.ConsoleModule.debug(`flushBatch queue = ${JSON.stringify(queue)}`);
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
