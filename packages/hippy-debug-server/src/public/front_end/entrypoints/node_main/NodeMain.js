// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as SDK from '../../core/sdk/sdk.js';
const UIStrings = {
    /**
    *@description Text that refers to the main target
    */
    main: 'Main',
    /**
    *@description Text in Node Main of the Sources panel when debugging a Node.js app
    *@example {example.com} PH1
    */
    nodejsS: 'Node.js: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('entrypoints/node_main/NodeMain.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let nodeMainImplInstance;
export class NodeMainImpl extends Common.ObjectWrapper.ObjectWrapper {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!nodeMainImplInstance || forceNew) {
            nodeMainImplInstance = new NodeMainImpl();
        }
        return nodeMainImplInstance;
    }
    async run() {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.ConnectToNodeJSFromFrontend);
        SDK.Connections.initMainConnection(async () => {
            const target = SDK.TargetManager.TargetManager.instance().createTarget('main', i18nString(UIStrings.main), SDK.Target.Type.Browser, null);
            target.setInspectedURL('Node.js');
        }, Components.TargetDetachedDialog.TargetDetachedDialog.webSocketConnectionLost);
    }
}
Common.Runnable.registerEarlyInitializationRunnable(NodeMainImpl.instance);
export class NodeChildTargetManager extends SDK.SDKModel.SDKModel {
    _targetManager;
    _parentTarget;
    _targetAgent;
    _childTargets;
    _childConnections;
    constructor(parentTarget) {
        super(parentTarget);
        this._targetManager = parentTarget.targetManager();
        this._parentTarget = parentTarget;
        this._targetAgent = parentTarget.targetAgent();
        this._childTargets = new Map();
        this._childConnections = new Map();
        parentTarget.registerTargetDispatcher(this);
        this._targetAgent.invoke_setDiscoverTargets({ discover: true });
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.DevicesDiscoveryConfigChanged, this._devicesDiscoveryConfigChanged, this);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setDevicesUpdatesEnabled(false);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setDevicesUpdatesEnabled(true);
    }
    _devicesDiscoveryConfigChanged(event) {
        const config = event.data;
        const locations = [];
        for (const address of config.networkDiscoveryConfig) {
            const parts = address.split(':');
            const port = parseInt(parts[1], 10);
            if (parts[0] && port) {
                locations.push({ host: parts[0], port: port });
            }
        }
        this._targetAgent.invoke_setRemoteLocations({ locations });
    }
    dispose() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.removeEventListener(Host.InspectorFrontendHostAPI.Events.DevicesDiscoveryConfigChanged, this._devicesDiscoveryConfigChanged, this);
        for (const sessionId of this._childTargets.keys()) {
            this.detachedFromTarget({ sessionId });
        }
    }
    targetCreated({ targetInfo }) {
        if (targetInfo.type === 'node' && !targetInfo.attached) {
            this._targetAgent.invoke_attachToTarget({ targetId: targetInfo.targetId, flatten: false });
        }
    }
    targetInfoChanged(_event) {
    }
    targetDestroyed(_event) {
    }
    attachedToTarget({ sessionId, targetInfo }) {
        const name = i18nString(UIStrings.nodejsS, { PH1: targetInfo.url });
        const connection = new NodeConnection(this._targetAgent, sessionId);
        this._childConnections.set(sessionId, connection);
        const target = this._targetManager.createTarget(targetInfo.targetId, name, SDK.Target.Type.Node, this._parentTarget, undefined, undefined, connection);
        this._childTargets.set(sessionId, target);
        target.runtimeAgent().invoke_runIfWaitingForDebugger();
    }
    detachedFromTarget({ sessionId }) {
        const childTarget = this._childTargets.get(sessionId);
        if (childTarget) {
            childTarget.dispose('target terminated');
        }
        this._childTargets.delete(sessionId);
        this._childConnections.delete(sessionId);
    }
    receivedMessageFromTarget({ sessionId, message }) {
        const connection = this._childConnections.get(sessionId);
        const onMessage = connection ? connection._onMessage : null;
        if (onMessage) {
            onMessage.call(null, message);
        }
    }
    targetCrashed(_event) {
    }
}
export class NodeConnection {
    _targetAgent;
    _sessionId;
    _onMessage;
    _onDisconnect;
    constructor(targetAgent, sessionId) {
        this._targetAgent = targetAgent;
        this._sessionId = sessionId;
        this._onMessage = null;
        this._onDisconnect = null;
    }
    setOnMessage(onMessage) {
        this._onMessage = onMessage;
    }
    setOnDisconnect(onDisconnect) {
        this._onDisconnect = onDisconnect;
    }
    sendRawMessage(message) {
        this._targetAgent.invoke_sendMessageToTarget({ message, sessionId: this._sessionId });
    }
    async disconnect() {
        if (this._onDisconnect) {
            this._onDisconnect.call(null, 'force disconnect');
        }
        this._onDisconnect = null;
        this._onMessage = null;
        await this._targetAgent.invoke_detachFromTarget({ sessionId: this._sessionId });
    }
}
SDK.SDKModel.SDKModel.register(NodeChildTargetManager, { capabilities: SDK.Target.Capability.Target, autostart: true });
//# sourceMappingURL=NodeMain.js.map