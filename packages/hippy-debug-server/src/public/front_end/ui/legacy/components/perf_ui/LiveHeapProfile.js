// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../../core/common/common.js'; // eslint-disable-line no-unused-vars
import * as Host from '../../../../core/host/host.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import { Memory } from './LineLevelProfile.js';
let liveHeapProfileInstance;
export class LiveHeapProfile {
    _running;
    _sessionId;
    _loadEventCallback;
    _setting;
    constructor() {
        this._running = false;
        this._sessionId = 0;
        this._loadEventCallback = () => { };
        this._setting = Common.Settings.Settings.instance().moduleSetting('memoryLiveHeapProfile');
        this._setting.addChangeListener(event => event.data ? this._startProfiling() : this._stopProfiling());
        if (this._setting.get()) {
            this._startProfiling();
        }
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!liveHeapProfileInstance || forceNew) {
            liveHeapProfileInstance = new LiveHeapProfile();
        }
        return liveHeapProfileInstance;
    }
    run() {
        return Promise.resolve();
    }
    modelAdded(model) {
        model.startSampling(1e4);
    }
    modelRemoved(_model) {
        // Cannot do much when the model has already been removed.
    }
    async _startProfiling() {
        if (this._running) {
            return;
        }
        this._running = true;
        const sessionId = this._sessionId;
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.HeapProfilerModel.HeapProfilerModel, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.Load, this._loadEventFired, this);
        do {
            const models = SDK.TargetManager.TargetManager.instance().models(SDK.HeapProfilerModel.HeapProfilerModel);
            const profiles = await Promise.all(models.map(model => model.getSamplingProfile()));
            if (sessionId !== this._sessionId) {
                break;
            }
            Memory.instance().reset();
            for (let i = 0; i < profiles.length; ++i) {
                const profile = profiles[i];
                if (!profile) {
                    continue;
                }
                Memory.instance().appendHeapProfile(profile, models[i].target());
            }
            await Promise.race([
                new Promise(r => setTimeout(r, Host.InspectorFrontendHost.isUnderTest() ? 10 : 5000)),
                new Promise(r => {
                    this._loadEventCallback = r;
                }),
            ]);
        } while (sessionId === this._sessionId);
        SDK.TargetManager.TargetManager.instance().unobserveModels(SDK.HeapProfilerModel.HeapProfilerModel, this);
        SDK.TargetManager.TargetManager.instance().removeModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.Load, this._loadEventFired, this);
        for (const model of SDK.TargetManager.TargetManager.instance().models(SDK.HeapProfilerModel.HeapProfilerModel)) {
            model.stopSampling();
        }
        Memory.instance().reset();
    }
    _stopProfiling() {
        if (!this._running) {
            return;
        }
        this._running = false;
        this._sessionId++;
    }
    _loadEventFired() {
        this._loadEventCallback();
    }
}
//# sourceMappingURL=LiveHeapProfile.js.map