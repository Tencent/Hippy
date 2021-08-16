// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class Plugin {
    static accepts(_uiSourceCode) {
        return false;
    }
    wasShown() {
    }
    willHide() {
    }
    async rightToolbarItems() {
        return [];
    }
    /**
     *
     * TODO(szuend): It is OK to asyncify this function (similar to {rightToolbarItems}),
     *               but it is currently not strictly necessary.
     */
    leftToolbarItems() {
        return [];
    }
    populateLineGutterContextMenu(_contextMenu, _lineNumber) {
        return Promise.resolve();
    }
    populateTextAreaContextMenu(_contextMenu, _lineNumber, _columnNumber) {
        return Promise.resolve();
    }
    dispose() {
    }
}
//# sourceMappingURL=Plugin.js.map