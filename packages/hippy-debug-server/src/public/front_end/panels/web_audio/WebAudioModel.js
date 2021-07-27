// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../core/sdk/sdk.js';
export class WebAudioModel extends SDK.SDKModel.SDKModel {
    _enabled;
    _agent;
    constructor(target) {
        super(target);
        this._enabled = false;
        this._agent = target.webAudioAgent();
        target.registerWebAudioDispatcher(this);
        // TODO(crbug.com/963510): Some OfflineAudioContexts are not uninitialized
        // properly because LifeCycleObserver::ContextDestroyed() is not fired for
        // unknown reasons. This creates inconsistency in AudioGraphTracer
        // and AudioContextSelector in DevTools.
        //
        // To resolve this inconsistency, we flush the leftover from the previous
        // frame when the current page is loaded. This call can be omitted when the
        // bug is fixed.
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.FrameNavigated, this._flushContexts, this);
    }
    _flushContexts() {
        this.dispatchEventToListeners("ModelReset" /* ModelReset */);
    }
    async suspendModel() {
        this.dispatchEventToListeners("ModelSuspend" /* ModelSuspend */);
        await this._agent.invoke_disable();
    }
    async resumeModel() {
        if (!this._enabled) {
            return Promise.resolve();
        }
        await this._agent.invoke_enable();
    }
    ensureEnabled() {
        if (this._enabled) {
            return;
        }
        this._agent.invoke_enable();
        this._enabled = true;
    }
    contextCreated({ context }) {
        this.dispatchEventToListeners("ContextCreated" /* ContextCreated */, context);
    }
    contextWillBeDestroyed({ contextId }) {
        this.dispatchEventToListeners("ContextDestroyed" /* ContextDestroyed */, contextId);
    }
    contextChanged({ context }) {
        this.dispatchEventToListeners("ContextChanged" /* ContextChanged */, context);
    }
    audioListenerCreated({ listener }) {
        this.dispatchEventToListeners("AudioListenerCreated" /* AudioListenerCreated */, listener);
    }
    audioListenerWillBeDestroyed({ listenerId, contextId }) {
        this.dispatchEventToListeners("AudioListenerWillBeDestroyed" /* AudioListenerWillBeDestroyed */, { listenerId, contextId });
    }
    audioNodeCreated({ node }) {
        this.dispatchEventToListeners("AudioNodeCreated" /* AudioNodeCreated */, node);
    }
    audioNodeWillBeDestroyed({ contextId, nodeId }) {
        this.dispatchEventToListeners("AudioNodeWillBeDestroyed" /* AudioNodeWillBeDestroyed */, { contextId, nodeId });
    }
    audioParamCreated({ param }) {
        this.dispatchEventToListeners("AudioParamCreated" /* AudioParamCreated */, param);
    }
    audioParamWillBeDestroyed({ contextId, nodeId, paramId }) {
        this.dispatchEventToListeners("AudioParamWillBeDestroyed" /* AudioParamWillBeDestroyed */, { contextId, nodeId, paramId });
    }
    nodesConnected({ contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex }) {
        this.dispatchEventToListeners("NodesConnected" /* NodesConnected */, { contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex });
    }
    nodesDisconnected({ contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex }) {
        this.dispatchEventToListeners("NodesDisconnected" /* NodesDisconnected */, { contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex });
    }
    nodeParamConnected({ contextId, sourceId, destinationId, sourceOutputIndex }) {
        this.dispatchEventToListeners("NodeParamConnected" /* NodeParamConnected */, { contextId, sourceId, destinationId, sourceOutputIndex });
    }
    nodeParamDisconnected({ contextId, sourceId, destinationId, sourceOutputIndex }) {
        this.dispatchEventToListeners("NodeParamDisconnected" /* NodeParamDisconnected */, { contextId, sourceId, destinationId, sourceOutputIndex });
    }
    async requestRealtimeData(contextId) {
        const realtimeResponse = await this._agent.invoke_getRealtimeData({ contextId });
        return realtimeResponse.realtimeData;
    }
}
SDK.SDKModel.SDKModel.register(WebAudioModel, { capabilities: SDK.Target.Capability.DOM, autostart: false });
//# sourceMappingURL=WebAudioModel.js.map