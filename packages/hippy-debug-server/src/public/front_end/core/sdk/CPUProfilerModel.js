/*
 * Copyright (C) 2014 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../i18n/i18n.js';
import * as Root from '../root/root.js';
import { DebuggerModel, Location } from './DebuggerModel.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
const UIStrings = {
    /**
    *@description Name of a profile. Placeholder is either a user-supplied name or a number automatically assigned to the profile.
    *@example {2} PH1
    */
    profileD: 'Profile {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/CPUProfilerModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CPUProfilerModel extends SDKModel {
    _isRecording;
    _nextAnonymousConsoleProfileNumber;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _anonymousConsoleProfileIdToTitle;
    _profilerAgent;
    _preciseCoverageDeltaUpdateCallback;
    _debuggerModel;
    constructor(target) {
        super(target);
        this._isRecording = false;
        this._nextAnonymousConsoleProfileNumber = 1;
        this._anonymousConsoleProfileIdToTitle = new Map();
        this._profilerAgent = target.profilerAgent();
        this._preciseCoverageDeltaUpdateCallback = null;
        target.registerProfilerDispatcher(this);
        this._profilerAgent.invoke_enable();
        this._debuggerModel = target.model(DebuggerModel);
    }
    runtimeModel() {
        return this._debuggerModel.runtimeModel();
    }
    debuggerModel() {
        return this._debuggerModel;
    }
    consoleProfileStarted({ id, location, title }) {
        if (!title) {
            title = i18nString(UIStrings.profileD, { PH1: this._nextAnonymousConsoleProfileNumber++ });
            this._anonymousConsoleProfileIdToTitle.set(id, title);
        }
        this._dispatchProfileEvent(Events.ConsoleProfileStarted, id, location, title);
    }
    consoleProfileFinished({ id, location, profile, title }) {
        if (!title) {
            title = this._anonymousConsoleProfileIdToTitle.get(id);
            this._anonymousConsoleProfileIdToTitle.delete(id);
        }
        // Make sure ProfilesPanel is initialized and CPUProfileType is created.
        Root.Runtime.Runtime.instance().loadModulePromise('profiler').then(() => {
            this._dispatchProfileEvent(Events.ConsoleProfileFinished, id, location, title, profile);
        });
    }
    _dispatchProfileEvent(eventName, id, scriptLocation, title, cpuProfile) {
        const debuggerLocation = Location.fromPayload(this._debuggerModel, scriptLocation);
        const globalId = this.target().id() + '.' + id;
        const data = {
            id: globalId,
            scriptLocation: debuggerLocation,
            cpuProfile: cpuProfile,
            title: title,
            cpuProfilerModel: this,
        };
        this.dispatchEventToListeners(eventName, data);
    }
    isRecordingProfile() {
        return this._isRecording;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startRecording() {
        this._isRecording = true;
        const intervalUs = 100;
        this._profilerAgent.invoke_setSamplingInterval({ interval: intervalUs });
        return this._profilerAgent.invoke_start();
    }
    stopRecording() {
        this._isRecording = false;
        return this._profilerAgent.invoke_stop().then(response => response.profile || null);
    }
    startPreciseCoverage(jsCoveragePerBlock, preciseCoverageDeltaUpdateCallback) {
        const callCount = false;
        this._preciseCoverageDeltaUpdateCallback = preciseCoverageDeltaUpdateCallback;
        const allowUpdatesTriggeredByBackend = true;
        return this._profilerAgent.invoke_startPreciseCoverage({ callCount, detailed: jsCoveragePerBlock, allowTriggeredUpdates: allowUpdatesTriggeredByBackend });
    }
    async takePreciseCoverage() {
        const r = await this._profilerAgent.invoke_takePreciseCoverage();
        const timestamp = (r && r.timestamp) || 0;
        const coverage = (r && r.result) || [];
        return { timestamp, coverage };
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stopPreciseCoverage() {
        this._preciseCoverageDeltaUpdateCallback = null;
        return this._profilerAgent.invoke_stopPreciseCoverage();
    }
    preciseCoverageDeltaUpdate({ timestamp, occasion, result }) {
        if (this._preciseCoverageDeltaUpdateCallback) {
            this._preciseCoverageDeltaUpdateCallback(timestamp, occasion, result);
        }
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ConsoleProfileStarted"] = "ConsoleProfileStarted";
    Events["ConsoleProfileFinished"] = "ConsoleProfileFinished";
})(Events || (Events = {}));
SDKModel.register(CPUProfilerModel, { capabilities: Capability.JS, autostart: true });
//# sourceMappingURL=CPUProfilerModel.js.map