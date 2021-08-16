// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { RuntimeModel } from './RuntimeModel.js'; // eslint-disable-line no-unused-vars
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
export class HeapProfilerModel extends SDKModel {
    _enabled;
    _heapProfilerAgent;
    _memoryAgent;
    _runtimeModel;
    _samplingProfilerDepth;
    constructor(target) {
        super(target);
        target.registerHeapProfilerDispatcher(new HeapProfilerDispatcher(this));
        this._enabled = false;
        this._heapProfilerAgent = target.heapProfilerAgent();
        this._memoryAgent = target.memoryAgent();
        this._runtimeModel = target.model(RuntimeModel);
        this._samplingProfilerDepth = 0;
    }
    debuggerModel() {
        return this._runtimeModel.debuggerModel();
    }
    runtimeModel() {
        return this._runtimeModel;
    }
    async enable() {
        if (this._enabled) {
            return;
        }
        this._enabled = true;
        await this._heapProfilerAgent.invoke_enable();
    }
    async startSampling(samplingRateInBytes) {
        if (this._samplingProfilerDepth++) {
            return false;
        }
        const defaultSamplingIntervalInBytes = 16384;
        const response = await this._heapProfilerAgent.invoke_startSampling({ samplingInterval: samplingRateInBytes || defaultSamplingIntervalInBytes });
        return Boolean(response.getError());
    }
    async stopSampling() {
        if (!this._samplingProfilerDepth) {
            throw new Error('Sampling profiler is not running.');
        }
        if (--this._samplingProfilerDepth) {
            return this.getSamplingProfile();
        }
        const response = await this._heapProfilerAgent.invoke_stopSampling();
        if (response.getError()) {
            return null;
        }
        return response.profile;
    }
    async getSamplingProfile() {
        const response = await this._heapProfilerAgent.invoke_getSamplingProfile();
        if (response.getError()) {
            return null;
        }
        return response.profile;
    }
    async collectGarbage() {
        const response = await this._heapProfilerAgent.invoke_collectGarbage();
        return Boolean(response.getError());
    }
    async snapshotObjectIdForObjectId(objectId) {
        const response = await this._heapProfilerAgent.invoke_getHeapObjectId({ objectId });
        if (response.getError()) {
            return null;
        }
        return response.heapSnapshotObjectId;
    }
    async objectForSnapshotObjectId(snapshotObjectId, objectGroupName) {
        const result = await this._heapProfilerAgent.invoke_getObjectByHeapObjectId({ objectId: snapshotObjectId, objectGroup: objectGroupName });
        if (result.getError()) {
            return null;
        }
        return this._runtimeModel.createRemoteObject(result.result);
    }
    async addInspectedHeapObject(snapshotObjectId) {
        const response = await this._heapProfilerAgent.invoke_addInspectedHeapObject({ heapObjectId: snapshotObjectId });
        return Boolean(response.getError());
    }
    async takeHeapSnapshot(heapSnapshotOptions) {
        await this._heapProfilerAgent.invoke_takeHeapSnapshot(heapSnapshotOptions);
    }
    async startTrackingHeapObjects(recordAllocationStacks) {
        const response = await this._heapProfilerAgent.invoke_startTrackingHeapObjects({ trackAllocations: recordAllocationStacks });
        return Boolean(response.getError());
    }
    async stopTrackingHeapObjects(reportProgress) {
        const response = await this._heapProfilerAgent.invoke_stopTrackingHeapObjects({ reportProgress });
        return Boolean(response.getError());
    }
    heapStatsUpdate(samples) {
        this.dispatchEventToListeners(Events.HeapStatsUpdate, samples);
    }
    lastSeenObjectId(lastSeenObjectId, timestamp) {
        this.dispatchEventToListeners(Events.LastSeenObjectId, { lastSeenObjectId: lastSeenObjectId, timestamp: timestamp });
    }
    addHeapSnapshotChunk(chunk) {
        this.dispatchEventToListeners(Events.AddHeapSnapshotChunk, chunk);
    }
    reportHeapSnapshotProgress(done, total, finished) {
        this.dispatchEventToListeners(Events.ReportHeapSnapshotProgress, { done: done, total: total, finished: finished });
    }
    resetProfiles() {
        this.dispatchEventToListeners(Events.ResetProfiles, this);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["HeapStatsUpdate"] = "HeapStatsUpdate";
    Events["LastSeenObjectId"] = "LastSeenObjectId";
    Events["AddHeapSnapshotChunk"] = "AddHeapSnapshotChunk";
    Events["ReportHeapSnapshotProgress"] = "ReportHeapSnapshotProgress";
    Events["ResetProfiles"] = "ResetProfiles";
})(Events || (Events = {}));
class HeapProfilerDispatcher {
    _heapProfilerModel;
    constructor(model) {
        this._heapProfilerModel = model;
    }
    heapStatsUpdate({ statsUpdate }) {
        this._heapProfilerModel.heapStatsUpdate(statsUpdate);
    }
    lastSeenObjectId({ lastSeenObjectId, timestamp }) {
        this._heapProfilerModel.lastSeenObjectId(lastSeenObjectId, timestamp);
    }
    addHeapSnapshotChunk({ chunk }) {
        this._heapProfilerModel.addHeapSnapshotChunk(chunk);
    }
    reportHeapSnapshotProgress({ done, total, finished }) {
        this._heapProfilerModel.reportHeapSnapshotProgress(done, total, finished);
    }
    resetProfiles() {
        this._heapProfilerModel.resetProfiles();
    }
}
SDKModel.register(HeapProfilerModel, { capabilities: Capability.JS, autostart: false });
//# sourceMappingURL=HeapProfilerModel.js.map