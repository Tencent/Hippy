// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import { RuntimeModel } from './RuntimeModel.js';
import { TargetManager } from './TargetManager.js';
let isolateManagerInstance;
export class IsolateManager extends Common.ObjectWrapper.ObjectWrapper {
    _isolates;
    _isolateIdByModel;
    _observers;
    _pollId;
    constructor() {
        super();
        this._isolates = new Map();
        // _isolateIdByModel contains null while the isolateId is being retrieved.
        this._isolateIdByModel = new Map();
        this._observers = new Set();
        TargetManager.instance().observeModels(RuntimeModel, this);
        this._pollId = 0;
    }
    static instance({ forceNew } = { forceNew: false }) {
        if (!isolateManagerInstance || forceNew) {
            isolateManagerInstance = new IsolateManager();
        }
        return isolateManagerInstance;
    }
    observeIsolates(observer) {
        if (this._observers.has(observer)) {
            throw new Error('Observer can only be registered once');
        }
        if (!this._observers.size) {
            this._poll();
        }
        this._observers.add(observer);
        for (const isolate of this._isolates.values()) {
            observer.isolateAdded(isolate);
        }
    }
    unobserveIsolates(observer) {
        this._observers.delete(observer);
        if (!this._observers.size) {
            ++this._pollId;
        } // Stops the current polling loop.
    }
    modelAdded(model) {
        this._modelAdded(model);
    }
    async _modelAdded(model) {
        this._isolateIdByModel.set(model, null);
        const isolateId = await model.isolateId();
        if (!this._isolateIdByModel.has(model)) {
            // The model has been removed during await.
            return;
        }
        if (!isolateId) {
            this._isolateIdByModel.delete(model);
            return;
        }
        this._isolateIdByModel.set(model, isolateId);
        let isolate = this._isolates.get(isolateId);
        if (!isolate) {
            isolate = new Isolate(isolateId);
            this._isolates.set(isolateId, isolate);
        }
        isolate._models.add(model);
        if (isolate._models.size === 1) {
            for (const observer of this._observers) {
                observer.isolateAdded(isolate);
            }
        }
        else {
            for (const observer of this._observers) {
                observer.isolateChanged(isolate);
            }
        }
    }
    modelRemoved(model) {
        const isolateId = this._isolateIdByModel.get(model);
        this._isolateIdByModel.delete(model);
        if (!isolateId) {
            return;
        }
        const isolate = this._isolates.get(isolateId);
        if (!isolate) {
            return;
        }
        isolate._models.delete(model);
        if (isolate._models.size) {
            for (const observer of this._observers) {
                observer.isolateChanged(isolate);
            }
            return;
        }
        for (const observer of this._observers) {
            observer.isolateRemoved(isolate);
        }
        this._isolates.delete(isolateId);
    }
    isolateByModel(model) {
        return this._isolates.get(this._isolateIdByModel.get(model) || '') || null;
    }
    isolates() {
        return this._isolates.values();
    }
    async _poll() {
        const pollId = this._pollId;
        while (pollId === this._pollId) {
            await Promise.all(Array.from(this.isolates(), isolate => isolate._update()));
            await new Promise(r => setTimeout(r, PollIntervalMs));
        }
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["MemoryChanged"] = "MemoryChanged";
})(Events || (Events = {}));
export const MemoryTrendWindowMs = 120e3;
const PollIntervalMs = 2e3;
export class Isolate {
    _id;
    _models;
    _usedHeapSize;
    _memoryTrend;
    constructor(id) {
        this._id = id;
        this._models = new Set();
        this._usedHeapSize = 0;
        const count = MemoryTrendWindowMs / PollIntervalMs;
        this._memoryTrend = new MemoryTrend(count);
    }
    id() {
        return this._id;
    }
    models() {
        return this._models;
    }
    runtimeModel() {
        return this._models.values().next().value || null;
    }
    heapProfilerModel() {
        const runtimeModel = this.runtimeModel();
        return runtimeModel && runtimeModel.heapProfilerModel();
    }
    async _update() {
        const model = this.runtimeModel();
        const usage = model && await model.heapUsage();
        if (!usage) {
            return;
        }
        this._usedHeapSize = usage.usedSize;
        this._memoryTrend.add(this._usedHeapSize);
        IsolateManager.instance().dispatchEventToListeners(Events.MemoryChanged, this);
    }
    samplesCount() {
        return this._memoryTrend.count();
    }
    usedHeapSize() {
        return this._usedHeapSize;
    }
    /** bytes per millisecond
       */
    usedHeapSizeGrowRate() {
        return this._memoryTrend.fitSlope();
    }
    isMainThread() {
        const model = this.runtimeModel();
        return model ? model.target().id() === 'main' : false;
    }
}
export class MemoryTrend {
    _maxCount;
    _base;
    _index;
    _x;
    _y;
    _sx;
    _sy;
    _sxx;
    _sxy;
    constructor(maxCount) {
        this._maxCount = maxCount | 0;
        this.reset();
    }
    reset() {
        this._base = Date.now();
        this._index = 0;
        this._x = [];
        this._y = [];
        this._sx = 0;
        this._sy = 0;
        this._sxx = 0;
        this._sxy = 0;
    }
    count() {
        return this._x.length;
    }
    add(heapSize, timestamp) {
        const x = typeof timestamp === 'number' ? timestamp : Date.now() - this._base;
        const y = heapSize;
        if (this._x.length === this._maxCount) {
            // Turns into a cyclic buffer once it reaches the |_maxCount|.
            const x0 = this._x[this._index];
            const y0 = this._y[this._index];
            this._sx -= x0;
            this._sy -= y0;
            this._sxx -= x0 * x0;
            this._sxy -= x0 * y0;
        }
        this._sx += x;
        this._sy += y;
        this._sxx += x * x;
        this._sxy += x * y;
        this._x[this._index] = x;
        this._y[this._index] = y;
        this._index = (this._index + 1) % this._maxCount;
    }
    fitSlope() {
        // We use the linear regression model to find the slope.
        const n = this.count();
        return n < 2 ? 0 : (this._sxy - this._sx * this._sy / n) / (this._sxx - this._sx * this._sx / n);
    }
}
//# sourceMappingURL=IsolateManager.js.map