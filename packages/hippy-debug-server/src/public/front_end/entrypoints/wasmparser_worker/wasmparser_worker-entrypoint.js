// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as WasmParserWorker from './wasmparser_worker.js'; // eslint-disable-line rulesdir/es_modules_import
self.onmessage = (event) => {
    const method = event.data.method;
    if (method !== 'disassemble') {
        return;
    }
    self.postMessage(WasmParserWorker.WasmParserWorker.dissambleWASM(event.data.params, (message) => {
        self.postMessage(message);
    }));
};
self.postMessage('workerReady');
//# sourceMappingURL=wasmparser_worker-entrypoint.js.map