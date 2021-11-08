/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const UIManagerModule = internalBinding('UIManagerModule');

// 兼容 hippy2.0，hippy3.0 放量一段时间后可删除, __标识 hippy 保留方法
global.__onClick = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onClick;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onLongClick = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onLongClick;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchStart = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchStart;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchMove = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchMove;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchEnd = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchEnd;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onTouchCancel = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveNativeGesture;
  if (targetModule) {
    const targetMethod = targetModule.onTouchCancel;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onAttachedToWindow = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onAttachedToWindow;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onDetachedFromWindow = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onDetachedFromWindow;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onShow = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onShow;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

global.__onDismiss = (param) => {
  const targetModule = __GLOBAL__.jsModuleList.receiveUIComponentEvent;
  if (targetModule) {
    const targetMethod = targetModule.onDismiss;
    if (targetMethod) {
      targetMethod(param);
    }
  }
};

Hippy.document = {
  createNode(rootViewId, queue) {
    UIManagerModule.CreateNode(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'createNode', rootViewId, queue);
  },
  updateNode(rootViewId, queue) {
    UIManagerModule.UpdateNode(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'updateNode', rootViewId, queue);
  },
  deleteNode(rootViewId, queue) {
    UIManagerModule.DeleteNode(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'deleteNode', rootViewId, queue);
  },
  flushBatch(rootViewId, queue) {
    UIManagerModule.FlushBatch(rootViewId, queue);
    // Hippy.bridge.callNative('UIManagerModule', 'flushBatch', rootViewId, queue);
  },
  startBatch(renderId) {
    UIManagerModule.StartBatch((`${renderId}`));
    // Hippy.bridge.callNative('UIManagerModule', 'startBatch', (`${renderId}`));
  },
  endBatch(renderId) {
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
