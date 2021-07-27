// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import { ParallelConnection } from './Connections.js';
import { Capability, Type } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { Events as TargetManagerEvents, TargetManager } from './TargetManager.js';
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _lastAnonymousTargetId = 0;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _attachCallback;
export class ChildTargetManager extends SDKModel {
    _targetManager;
    _parentTarget;
    _targetAgent;
    _targetInfos;
    _childTargets;
    _parallelConnections;
    _parentTargetId;
    constructor(parentTarget) {
        super(parentTarget);
        this._targetManager = parentTarget.targetManager();
        this._parentTarget = parentTarget;
        this._targetAgent = parentTarget.targetAgent();
        this._targetInfos = new Map();
        this._childTargets = new Map();
        this._parallelConnections = new Map();
        this._parentTargetId = null;
        parentTarget.registerTargetDispatcher(this);
        this._targetAgent.invoke_setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
        if (!parentTarget.parentTarget() && !Host.InspectorFrontendHost.isUnderTest()) {
            this._targetAgent.invoke_setDiscoverTargets({ discover: true });
            this._targetAgent.invoke_setRemoteLocations({ locations: [{ host: 'localhost', port: 9229 }] });
        }
    }
    static install(attachCallback) {
        _attachCallback = attachCallback;
        SDKModel.register(ChildTargetManager, { capabilities: Capability.Target, autostart: true });
    }
    childTargets() {
        return Array.from(this._childTargets.values());
    }
    async suspendModel() {
        await this._targetAgent.invoke_setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
    }
    async resumeModel() {
        await this._targetAgent.invoke_setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
    }
    dispose() {
        for (const sessionId of this._childTargets.keys()) {
            this.detachedFromTarget({ sessionId, targetId: undefined });
        }
    }
    targetCreated({ targetInfo }) {
        this._targetInfos.set(targetInfo.targetId, targetInfo);
        this._fireAvailableTargetsChanged();
        this.dispatchEventToListeners(Events.TargetCreated, targetInfo);
    }
    targetInfoChanged({ targetInfo }) {
        this._targetInfos.set(targetInfo.targetId, targetInfo);
        const target = this._childTargets.get(targetInfo.targetId);
        if (target) {
            target.updateTargetInfo(targetInfo);
        }
        this._fireAvailableTargetsChanged();
        this.dispatchEventToListeners(Events.TargetInfoChanged, targetInfo);
    }
    targetDestroyed({ targetId }) {
        this._targetInfos.delete(targetId);
        this._fireAvailableTargetsChanged();
        this.dispatchEventToListeners(Events.TargetDestroyed, targetId);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    targetCrashed({ targetId, status, errorCode }) {
    }
    _fireAvailableTargetsChanged() {
        TargetManager.instance().dispatchEventToListeners(TargetManagerEvents.AvailableTargetsChanged, [...this._targetInfos.values()]);
    }
    async _getParentTargetId() {
        if (!this._parentTargetId) {
            this._parentTargetId = (await this._parentTarget.targetAgent().invoke_getTargetInfo({})).targetInfo.targetId;
        }
        return this._parentTargetId;
    }
    attachedToTarget({ sessionId, targetInfo, waitingForDebugger }) {
        if (this._parentTargetId === targetInfo.targetId) {
            return;
        }
        let targetName = '';
        if (targetInfo.type === 'worker' && targetInfo.title && targetInfo.title !== targetInfo.url) {
            targetName = targetInfo.title;
        }
        else if (targetInfo.type !== 'iframe') {
            const parsedURL = Common.ParsedURL.ParsedURL.fromString(targetInfo.url);
            targetName = parsedURL ? parsedURL.lastPathComponentWithFragment() : '#' + (++_lastAnonymousTargetId);
        }
        let type = Type.Browser;
        if (targetInfo.type === 'iframe') {
            type = Type.Frame;
        }
        // TODO(lfg): ensure proper capabilities for child pages (e.g. portals).
        else if (targetInfo.type === 'page') {
            type = Type.Frame;
        }
        else if (targetInfo.type === 'worker') {
            type = Type.Worker;
        }
        else if (targetInfo.type === 'service_worker') {
            type = Type.ServiceWorker;
        }
        const target = this._targetManager.createTarget(targetInfo.targetId, targetName, type, this._parentTarget, sessionId, undefined, undefined, targetInfo);
        this._childTargets.set(sessionId, target);
        if (_attachCallback) {
            _attachCallback({ target, waitingForDebugger }).then(() => {
                target.runtimeAgent().invoke_runIfWaitingForDebugger();
            });
        }
        else {
            target.runtimeAgent().invoke_runIfWaitingForDebugger();
        }
    }
    detachedFromTarget({ sessionId }) {
        if (this._parallelConnections.has(sessionId)) {
            this._parallelConnections.delete(sessionId);
        }
        else {
            const session = this._childTargets.get(sessionId);
            if (session) {
                session.dispose('target terminated');
                this._childTargets.delete(sessionId);
            }
        }
    }
    receivedMessageFromTarget({}) {
        // We use flatten protocol.
    }
    async createParallelConnection(onMessage) {
        // The main Target id is actually just `main`, instead of the real targetId.
        // Get the real id (requires an async operation) so that it can be used synchronously later.
        const targetId = await this._getParentTargetId();
        const { connection, sessionId } = await this._createParallelConnectionAndSessionForTarget(this._parentTarget, targetId);
        connection.setOnMessage(onMessage);
        this._parallelConnections.set(sessionId, connection);
        return connection;
    }
    async _createParallelConnectionAndSessionForTarget(target, targetId) {
        const targetAgent = target.targetAgent();
        const targetRouter = target.router();
        const sessionId = (await targetAgent.invoke_attachToTarget({ targetId, flatten: true })).sessionId;
        const connection = new ParallelConnection(targetRouter.connection(), sessionId);
        targetRouter.registerSession(target, sessionId, connection);
        connection.setOnDisconnect(() => {
            targetRouter.unregisterSession(sessionId);
            targetAgent.invoke_detachFromTarget({ sessionId });
        });
        return { connection, sessionId };
    }
    targetInfos() {
        return Array.from(this._targetInfos.values());
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["TargetCreated"] = "TargetCreated";
    Events["TargetDestroyed"] = "TargetDestroyed";
    Events["TargetInfoChanged"] = "TargetInfoChanged";
})(Events || (Events = {}));
//# sourceMappingURL=ChildTargetManager.js.map