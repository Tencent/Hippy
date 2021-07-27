// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js'; // eslint-disable-line no-unused-vars
export class TracingManager extends SDKModel {
    _tracingAgent;
    _activeClient;
    _eventBufferSize;
    _eventsRetrieved;
    _finishing;
    constructor(target) {
        super(target);
        this._tracingAgent = target.tracingAgent();
        target.registerTracingDispatcher(new TracingDispatcher(this));
        this._activeClient = null;
        this._eventBufferSize = 0;
        this._eventsRetrieved = 0;
    }
    _bufferUsage(usage, eventCount, percentFull) {
        this._eventBufferSize = eventCount === undefined ? null : eventCount;
        if (this._activeClient) {
            this._activeClient.tracingBufferUsage(usage || percentFull || 0);
        }
    }
    _eventsCollected(events) {
        if (!this._activeClient) {
            return;
        }
        this._activeClient.traceEventsCollected(events);
        this._eventsRetrieved += events.length;
        if (!this._eventBufferSize) {
            this._activeClient.eventsRetrievalProgress(0);
            return;
        }
        if (this._eventsRetrieved > this._eventBufferSize) {
            this._eventsRetrieved = this._eventBufferSize;
        }
        this._activeClient.eventsRetrievalProgress(this._eventsRetrieved / this._eventBufferSize);
    }
    _tracingComplete() {
        this._eventBufferSize = 0;
        this._eventsRetrieved = 0;
        if (this._activeClient) {
            this._activeClient.tracingComplete();
            this._activeClient = null;
        }
        this._finishing = false;
    }
    // TODO(petermarshall): Use the traceConfig argument instead of deprecated
    // categories + options.
    async start(client, categoryFilter, options) {
        if (this._activeClient) {
            throw new Error('Tracing is already started');
        }
        const bufferUsageReportingIntervalMs = 500;
        this._activeClient = client;
        const args = {
            bufferUsageReportingInterval: bufferUsageReportingIntervalMs,
            categories: categoryFilter,
            options: options,
            transferMode: "ReportEvents" /* ReportEvents */,
        };
        const response = await this._tracingAgent.invoke_start(args);
        if (response.getError()) {
            this._activeClient = null;
        }
        return response;
    }
    stop() {
        if (!this._activeClient) {
            throw new Error('Tracing is not started');
        }
        if (this._finishing) {
            throw new Error('Tracing is already being stopped');
        }
        this._finishing = true;
        this._tracingAgent.invoke_end();
    }
}
class TracingDispatcher {
    _tracingManager;
    constructor(tracingManager) {
        this._tracingManager = tracingManager;
    }
    bufferUsage({ value, eventCount, percentFull }) {
        this._tracingManager._bufferUsage(value, eventCount, percentFull);
    }
    dataCollected({ value }) {
        this._tracingManager._eventsCollected(value);
    }
    tracingComplete() {
        this._tracingManager._tracingComplete();
    }
}
SDKModel.register(TracingManager, { capabilities: Capability.Tracing, autostart: false });
//# sourceMappingURL=TracingManager.js.map