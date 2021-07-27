// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as HeapSnapshotWorker from './heap_snapshot_worker.js'; // eslint-disable-line rulesdir/es_modules_import
// We need to force the worker context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctxSelf = self;
const dispatcher = new HeapSnapshotWorker.HeapSnapshotWorkerDispatcher.HeapSnapshotWorkerDispatcher(ctxSelf, (message) => self.postMessage(message));
function installMessageEventListener(listener) {
    ctxSelf.addEventListener('message', listener, false);
}
// @ts-ignore
installMessageEventListener(dispatcher.dispatchMessage.bind(dispatcher));
self.postMessage('workerReady');
//# sourceMappingURL=heap_snapshot_worker-entrypoint.js.map