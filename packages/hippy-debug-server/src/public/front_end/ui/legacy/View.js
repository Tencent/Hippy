// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { ViewManager } from './ViewManager.js';
import { VBox } from './Widget.js'; // eslint-disable-line no-unused-vars
export class SimpleView extends VBox {
    _title;
    constructor(title, isWebComponent) {
        super(isWebComponent);
        this._title = title;
    }
    viewId() {
        return this._title;
    }
    title() {
        return this._title;
    }
    isCloseable() {
        return false;
    }
    isTransient() {
        return false;
    }
    toolbarItems() {
        return Promise.resolve([]);
    }
    widget() {
        return Promise.resolve(this);
    }
    revealView() {
        return ViewManager.instance().revealView(this);
    }
    disposeView() {
    }
}
//# sourceMappingURL=View.js.map