// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
let zoomManagerInstance;
export class ZoomManager extends Common.ObjectWrapper.ObjectWrapper {
    _frontendHost;
    _zoomFactor;
    constructor(window, frontendHost) {
        super();
        this._frontendHost = frontendHost;
        this._zoomFactor = this._frontendHost.zoomFactor();
        window.addEventListener('resize', this._onWindowResize.bind(this), true);
    }
    static instance(opts = { forceNew: null, win: null, frontendHost: null }) {
        const { forceNew, win, frontendHost } = opts;
        if (!zoomManagerInstance || forceNew) {
            if (!win || !frontendHost) {
                throw new Error(`Unable to create zoom manager: window and frontendHost must be provided: ${new Error().stack}`);
            }
            zoomManagerInstance = new ZoomManager(win, frontendHost);
        }
        return zoomManagerInstance;
    }
    static removeInstance() {
        zoomManagerInstance = undefined;
    }
    zoomFactor() {
        return this._zoomFactor;
    }
    cssToDIP(value) {
        return value * this._zoomFactor;
    }
    dipToCSS(valueDIP) {
        return valueDIP / this._zoomFactor;
    }
    _onWindowResize() {
        const oldZoomFactor = this._zoomFactor;
        this._zoomFactor = this._frontendHost.zoomFactor();
        if (oldZoomFactor !== this._zoomFactor) {
            this.dispatchEventToListeners("ZoomChanged" /* ZoomChanged */, { from: oldZoomFactor, to: this._zoomFactor });
        }
    }
}
//# sourceMappingURL=ZoomManager.js.map