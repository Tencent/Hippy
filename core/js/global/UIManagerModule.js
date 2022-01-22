/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

Hippy.document = {
  createNode(rootViewId, queue) {
    Hippy.bridge.callNative('UIManagerModule', 'createNode', rootViewId, queue);
  },
  updateNode(rootViewId, queue) {
    Hippy.bridge.callNative('UIManagerModule', 'updateNode', rootViewId, queue);
  },
  deleteNode(rootViewId, queue) {
    Hippy.bridge.callNative('UIManagerModule', 'deleteNode', rootViewId, queue);
  },
  flushBatch(rootViewId, queue) {
    Hippy.bridge.callNative('UIManagerModule', 'flushBatch', rootViewId, queue);
  },
  startBatch() {
    Hippy.bridge.callNative('UIManagerModule', 'startBatch');
  },
  endBatch() {
    Hippy.bridge.callNative('UIManagerModule', 'endBatch');

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
