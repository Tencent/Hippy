// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../core/sdk/sdk.js';
export class BackgroundServiceModel extends SDK.SDKModel.SDKModel {
    _backgroundServiceAgent;
    _events;
    constructor(target) {
        super(target);
        this._backgroundServiceAgent = target.backgroundServiceAgent();
        target.registerBackgroundServiceDispatcher(this);
        this._events = new Map();
    }
    enable(service) {
        this._events.set(service, []);
        this._backgroundServiceAgent.invoke_startObserving({ service });
    }
    setRecording(shouldRecord, service) {
        this._backgroundServiceAgent.invoke_setRecording({ shouldRecord, service });
    }
    clearEvents(service) {
        this._events.set(service, []);
        this._backgroundServiceAgent.invoke_clearEvents({ service });
    }
    getEvents(service) {
        return this._events.get(service) || [];
    }
    recordingStateChanged({ isRecording, service }) {
        this.dispatchEventToListeners(Events.RecordingStateChanged, { isRecording, serviceName: service });
    }
    backgroundServiceEventReceived({ backgroundServiceEvent }) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // @ts-expect-error
        this._events.get(backgroundServiceEvent.service).push(backgroundServiceEvent);
        this.dispatchEventToListeners(Events.BackgroundServiceEventReceived, backgroundServiceEvent);
    }
}
SDK.SDKModel.SDKModel.register(BackgroundServiceModel, { capabilities: SDK.Target.Capability.Browser, autostart: false });
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["RecordingStateChanged"] = "RecordingStateChanged";
    Events["BackgroundServiceEventReceived"] = "BackgroundServiceEventReceived";
})(Events || (Events = {}));
//# sourceMappingURL=BackgroundServiceModel.js.map