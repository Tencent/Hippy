const UIManagerModule = internalBinding('UIManagerModule');

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
    //Hippy.bridge.callNative('UIManagerModule', 'deleteNode', rootViewId, queue);
  },
  flushBatch(rootViewId, queue) {
    UIManagerModule.FlushBatch(rootViewId, queue);
    //Hippy.bridge.callNative('UIManagerModule', 'flushBatch', rootViewId, queue);
  },
  startBatch(renderId) {
    UIManagerModule.StartBatch((`${renderId}`));
    //Hippy.bridge.callNative('UIManagerModule', 'startBatch', (`${renderId}`));
  },
  endBatch(renderId) {
    UIManagerModule.EndBatch((`${renderId}`));
    //Hippy.bridge.callNative('UIManagerModule', 'endBatch', (`${renderId}`));

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