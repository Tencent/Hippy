// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TimelineLoader } from './TimelineLoader.js'; // eslint-disable-line no-unused-vars
export class ExtensionTracingSession {
    _provider;
    _performanceModel;
    _completionCallback;
    _completionPromise;
    _timeOffset;
    constructor(provider, performanceModel) {
        this._provider = provider;
        this._performanceModel = performanceModel;
        this._completionPromise = new Promise(fulfill => {
            this._completionCallback = fulfill;
        });
        this._timeOffset = 0;
    }
    loadingStarted() {
    }
    processingStarted() {
    }
    loadingProgress(_progress) {
    }
    loadingComplete(tracingModel) {
        if (!tracingModel) {
            return;
        }
        this._performanceModel.addExtensionEvents(this._provider.longDisplayName(), tracingModel, this._timeOffset);
        this._completionCallback();
    }
    complete(url, timeOffsetMicroseconds) {
        if (!url) {
            this._completionCallback();
            return;
        }
        this._timeOffset = timeOffsetMicroseconds;
        TimelineLoader.loadFromURL(url, this);
    }
    start() {
        this._provider.start(this);
    }
    stop() {
        this._provider.stop();
        return this._completionPromise;
    }
}
//# sourceMappingURL=ExtensionTracingSession.js.map