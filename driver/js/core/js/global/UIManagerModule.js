/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const UIManagerModule = internalBinding('UIManagerModule');

Hippy.document = {
  createNode() {
    // noop
  },
  updateNode() {
    // noop
  },
  deleteNode() {
    // noop
  },
  flushBatch() {
    // noop
  },
  endBatch() {
    // noop
  },
  callUIFunction(id, name, param, cb) {
    UIManagerModule.CallUIFunction(id, name, param, cb);
  },
  sendRenderError(error) {
    if (error) {
      throw error;
    }
  },
};
