// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as ProtocolClient from '../protocol_client/protocol_client.js';
import { SDKModel } from './SDKModel.js';
export class Target extends ProtocolClient.InspectorBackend.TargetBase {
    _targetManager;
    _name;
    _inspectedURL;
    _inspectedURLName;
    _capabilitiesMask;
    _type;
    _parentTarget;
    _id;
    _modelByConstructor;
    _isSuspended;
    _targetInfo;
    _creatingModels;
    constructor(targetManager, id, name, type, parentTarget, sessionId, suspended, connection, targetInfo) {
        const needsNodeJSPatching = type === Type.Node;
        super(needsNodeJSPatching, parentTarget, sessionId, connection);
        this._targetManager = targetManager;
        this._name = name;
        this._inspectedURL = '';
        this._inspectedURLName = '';
        this._capabilitiesMask = 0;
        switch (type) {
            case Type.Frame:
                this._capabilitiesMask = Capability.Browser | Capability.Storage | Capability.DOM | Capability.JS |
                    Capability.Log | Capability.Network | Capability.Target | Capability.Tracing | Capability.Emulation |
                    Capability.Input | Capability.Inspector | Capability.Audits | Capability.WebAuthn | Capability.IO |
                    Capability.Media;
                if (!parentTarget) {
                    // This matches backend exposing certain capabilities only for the main frame.
                    this._capabilitiesMask |=
                        Capability.DeviceEmulation | Capability.ScreenCapture | Capability.Security | Capability.ServiceWorker;
                    // TODO(dgozman): we report service workers for the whole frame tree on the main frame,
                    // while we should be able to only cover the subtree corresponding to the target.
                }
                break;
            case Type.ServiceWorker:
                this._capabilitiesMask = Capability.JS | Capability.Log | Capability.Network | Capability.Target |
                    Capability.Inspector | Capability.IO;
                if (!parentTarget) {
                    this._capabilitiesMask |= Capability.Browser;
                }
                break;
            case Type.Worker:
                this._capabilitiesMask =
                    Capability.JS | Capability.Log | Capability.Network | Capability.Target | Capability.IO | Capability.Media;
                break;
            case Type.Node:
                this._capabilitiesMask = Capability.JS;
                break;
            case Type.Browser:
                this._capabilitiesMask = Capability.Target | Capability.IO;
                break;
        }
        this._type = type;
        this._parentTarget = parentTarget;
        this._id = id;
        /* } */
        this._modelByConstructor = new Map();
        this._isSuspended = suspended;
        this._targetInfo = targetInfo;
    }
    createModels(required) {
        this._creatingModels = true;
        const registeredModels = Array.from(SDKModel.registeredModels.entries());
        // Create early models.
        for (const [modelClass, info] of registeredModels) {
            if (info.early) {
                this.model(modelClass);
            }
        }
        // Create autostart and required models.
        for (const [modelClass, info] of registeredModels) {
            if (info.autostart || required.has(modelClass)) {
                this.model(modelClass);
            }
        }
        this._creatingModels = false;
    }
    id() {
        return this._id;
    }
    name() {
        return this._name || this._inspectedURLName;
    }
    type() {
        return this._type;
    }
    markAsNodeJSForTest() {
        super.markAsNodeJSForTest();
        this._type = Type.Node;
    }
    targetManager() {
        return this._targetManager;
    }
    hasAllCapabilities(capabilitiesMask) {
        // TODO(dgozman): get rid of this method, once we never observe targets with
        // capability mask.
        return (this._capabilitiesMask & capabilitiesMask) === capabilitiesMask;
    }
    decorateLabel(label) {
        return (this._type === Type.Worker || this._type === Type.ServiceWorker) ? '\u2699 ' + label : label;
    }
    parentTarget() {
        return this._parentTarget;
    }
    dispose(reason) {
        super.dispose(reason);
        this._targetManager.removeTarget(this);
        for (const model of this._modelByConstructor.values()) {
            model.dispose();
        }
    }
    model(modelClass) {
        if (!this._modelByConstructor.get(modelClass)) {
            const info = SDKModel.registeredModels.get(modelClass);
            if (info === undefined) {
                throw 'Model class is not registered @' + new Error().stack;
            }
            if ((this._capabilitiesMask & info.capabilities) === info.capabilities) {
                const model = new modelClass(this);
                this._modelByConstructor.set(modelClass, model);
                if (!this._creatingModels) {
                    this._targetManager.modelAdded(this, modelClass, model);
                }
            }
        }
        return this._modelByConstructor.get(modelClass) || null;
    }
    models() {
        return this._modelByConstructor;
    }
    inspectedURL() {
        return this._inspectedURL;
    }
    setInspectedURL(inspectedURL) {
        this._inspectedURL = inspectedURL;
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(inspectedURL);
        this._inspectedURLName = parsedURL ? parsedURL.lastPathComponentWithFragment() : '#' + this._id;
        if (!this.parentTarget()) {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.inspectedURLChanged(inspectedURL || '');
        }
        this._targetManager.onInspectedURLChange(this);
        if (!this._name) {
            this._targetManager.onNameChange(this);
        }
    }
    async suspend(reason) {
        if (this._isSuspended) {
            return;
        }
        this._isSuspended = true;
        await Promise.all(Array.from(this.models().values(), m => m.preSuspendModel(reason)));
        await Promise.all(Array.from(this.models().values(), m => m.suspendModel(reason)));
    }
    async resume() {
        if (!this._isSuspended) {
            return;
        }
        this._isSuspended = false;
        await Promise.all(Array.from(this.models().values(), m => m.resumeModel()));
        await Promise.all(Array.from(this.models().values(), m => m.postResumeModel()));
    }
    suspended() {
        return this._isSuspended;
    }
    updateTargetInfo(targetInfo) {
        this._targetInfo = targetInfo;
    }
    targetInfo() {
        return this._targetInfo;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Type;
(function (Type) {
    Type["Frame"] = "frame";
    Type["ServiceWorker"] = "service-worker";
    Type["Worker"] = "worker";
    Type["Node"] = "node";
    Type["Browser"] = "browser";
})(Type || (Type = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Capability;
(function (Capability) {
    Capability[Capability["Browser"] = 1] = "Browser";
    Capability[Capability["DOM"] = 2] = "DOM";
    Capability[Capability["JS"] = 4] = "JS";
    Capability[Capability["Log"] = 8] = "Log";
    Capability[Capability["Network"] = 16] = "Network";
    Capability[Capability["Target"] = 32] = "Target";
    Capability[Capability["ScreenCapture"] = 64] = "ScreenCapture";
    Capability[Capability["Tracing"] = 128] = "Tracing";
    Capability[Capability["Emulation"] = 256] = "Emulation";
    Capability[Capability["Security"] = 512] = "Security";
    Capability[Capability["Input"] = 1024] = "Input";
    Capability[Capability["Inspector"] = 2048] = "Inspector";
    Capability[Capability["DeviceEmulation"] = 4096] = "DeviceEmulation";
    Capability[Capability["Storage"] = 8192] = "Storage";
    Capability[Capability["ServiceWorker"] = 16384] = "ServiceWorker";
    Capability[Capability["Audits"] = 32768] = "Audits";
    Capability[Capability["WebAuthn"] = 65536] = "WebAuthn";
    Capability[Capability["IO"] = 131072] = "IO";
    Capability[Capability["Media"] = 262144] = "Media";
    Capability[Capability["None"] = 0] = "None";
})(Capability || (Capability = {}));
//# sourceMappingURL=Target.js.map