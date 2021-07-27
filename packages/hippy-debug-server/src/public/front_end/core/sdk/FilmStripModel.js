// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../platform/platform.js';
import { TracingModel } from './TracingModel.js'; // eslint-disable-line no-unused-vars
export class FilmStripModel {
    _frames;
    _zeroTime;
    _spanTime;
    constructor(tracingModel, zeroTime) {
        this._frames = [];
        this._zeroTime = 0;
        this._spanTime = 0;
        this.reset(tracingModel, zeroTime);
    }
    reset(tracingModel, zeroTime) {
        this._zeroTime = zeroTime || tracingModel.minimumRecordTime();
        this._spanTime = tracingModel.maximumRecordTime() - this._zeroTime;
        /** @type {!Array<!Frame>} */
        this._frames = [];
        const browserMain = TracingModel.browserMainThread(tracingModel);
        if (!browserMain) {
            return;
        }
        const events = browserMain.events();
        for (let i = 0; i < events.length; ++i) {
            const event = events[i];
            if (event.startTime < this._zeroTime) {
                continue;
            }
            if (!event.hasCategory(_category)) {
                continue;
            }
            if (event.name === TraceEvents.CaptureFrame) {
                const data = event.args['data'];
                if (data) {
                    this._frames.push(Frame._fromEvent(this, event, this._frames.length));
                }
            }
            else if (event.name === TraceEvents.Screenshot) {
                this._frames.push(Frame._fromSnapshot(this, event, this._frames.length));
            }
        }
    }
    frames() {
        return this._frames;
    }
    zeroTime() {
        return this._zeroTime;
    }
    spanTime() {
        return this._spanTime;
    }
    frameByTimestamp(timestamp) {
        const index = Platform.ArrayUtilities.upperBound(this._frames, timestamp, (timestamp, frame) => timestamp - frame.timestamp) -
            1;
        return index >= 0 ? this._frames[index] : null;
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _category = 'disabled-by-default-devtools.screenshot';
const TraceEvents = {
    CaptureFrame: 'CaptureFrame',
    Screenshot: 'Screenshot',
};
export class Frame {
    _model;
    timestamp;
    index;
    _imageData;
    _snapshot;
    constructor(model, timestamp, index) {
        this._model = model;
        this.timestamp = timestamp;
        this.index = index;
        this._imageData = null;
        this._snapshot = null;
    }
    static _fromEvent(model, event, index) {
        const frame = new Frame(model, event.startTime, index);
        frame._imageData = event.args['data'];
        return frame;
    }
    static _fromSnapshot(model, snapshot, index) {
        const frame = new Frame(model, snapshot.startTime, index);
        frame._snapshot = snapshot;
        return frame;
    }
    model() {
        return this._model;
    }
    imageDataPromise() {
        if (this._imageData || !this._snapshot) {
            return Promise.resolve(this._imageData);
        }
        return /** @type {!Promise<?string>} */ this._snapshot.objectPromise();
    }
}
//# sourceMappingURL=FilmStripModel.js.map