// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class StringOutputStream {
    _data;
    constructor() {
        this._data = '';
    }
    async write(chunk) {
        this._data += chunk;
    }
    async close() {
    }
    data() {
        return this._data;
    }
}
//# sourceMappingURL=StringOutputStream.js.map