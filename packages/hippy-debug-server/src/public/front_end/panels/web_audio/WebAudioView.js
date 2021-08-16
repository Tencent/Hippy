// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ContextDetailBuilder, ContextSummaryBuilder } from './AudioContextContentBuilder.js';
import { AudioContextSelector } from './AudioContextSelector.js';
import { GraphManager } from './graph_visualizer/GraphManager.js';
import { WebAudioModel } from './WebAudioModel.js';
const UIStrings = {
    /**
    *@description Text in Web Audio View
    */
    openAPageThatUsesWebAudioApiTo: 'Open a page that uses Web Audio API to start monitoring.',
};
const str_ = i18n.i18n.registerUIStrings('panels/web_audio/WebAudioView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let webAudioViewInstance;
export class WebAudioView extends UI.ThrottledWidget.ThrottledWidget {
    _contextSelector;
    _contentContainer;
    _detailViewContainer;
    _graphManager;
    _landingPage;
    _summaryBarContainer;
    constructor() {
        super(true, 1000);
        this.element.classList.add('web-audio-drawer');
        this.registerRequiredCSS('panels/web_audio/webAudio.css', { enableLegacyPatching: false });
        // Creates the toolbar.
        const toolbarContainer = this.contentElement.createChild('div', 'web-audio-toolbar-container vbox');
        this._contextSelector = new AudioContextSelector();
        const toolbar = new UI.Toolbar.Toolbar('web-audio-toolbar', toolbarContainer);
        toolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButtonForId('components.collect-garbage'));
        toolbar.appendSeparator();
        toolbar.appendToolbarItem(this._contextSelector.toolbarItem());
        // Create content container
        this._contentContainer = this.contentElement.createChild('div', 'web-audio-content-container vbox flex-auto');
        // Creates the detail view.
        this._detailViewContainer = this._contentContainer.createChild('div', 'web-audio-details-container vbox flex-auto');
        this._graphManager = new GraphManager();
        // Creates the landing page.
        this._landingPage = new UI.Widget.VBox();
        this._landingPage.contentElement.classList.add('web-audio-landing-page', 'fill');
        this._landingPage.contentElement.appendChild(UI.Fragment.html `
  <div>
  <p>${i18nString(UIStrings.openAPageThatUsesWebAudioApiTo)}</p>
  </div>
  `);
        this._landingPage.show(this._detailViewContainer);
        // Creates the summary bar.
        this._summaryBarContainer = this._contentContainer.createChild('div', 'web-audio-summary-container');
        this._contextSelector.addEventListener("ContextSelected" /* ContextSelected */, (event) => {
            const context = event.data;
            this._updateDetailView(context);
            this.doUpdate();
        });
        SDK.TargetManager.TargetManager.instance().observeModels(WebAudioModel, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!webAudioViewInstance || forceNew) {
            webAudioViewInstance = new WebAudioView();
        }
        return webAudioViewInstance;
    }
    wasShown() {
        super.wasShown();
        for (const model of SDK.TargetManager.TargetManager.instance().models(WebAudioModel)) {
            this._addEventListeners(model);
        }
    }
    willHide() {
        for (const model of SDK.TargetManager.TargetManager.instance().models(WebAudioModel)) {
            this._removeEventListeners(model);
        }
    }
    modelAdded(webAudioModel) {
        if (this.isShowing()) {
            this._addEventListeners(webAudioModel);
        }
    }
    modelRemoved(webAudioModel) {
        this._removeEventListeners(webAudioModel);
    }
    async doUpdate() {
        await this._pollRealtimeData();
        this.update();
    }
    _addEventListeners(webAudioModel) {
        webAudioModel.ensureEnabled();
        webAudioModel.addEventListener("ContextCreated" /* ContextCreated */, this._contextCreated, this);
        webAudioModel.addEventListener("ContextDestroyed" /* ContextDestroyed */, this._contextDestroyed, this);
        webAudioModel.addEventListener("ContextChanged" /* ContextChanged */, this._contextChanged, this);
        webAudioModel.addEventListener("ModelReset" /* ModelReset */, this._reset, this);
        webAudioModel.addEventListener("ModelSuspend" /* ModelSuspend */, this._suspendModel, this);
        webAudioModel.addEventListener("AudioListenerCreated" /* AudioListenerCreated */, this._audioListenerCreated, this);
        webAudioModel.addEventListener("AudioListenerWillBeDestroyed" /* AudioListenerWillBeDestroyed */, this._audioListenerWillBeDestroyed, this);
        webAudioModel.addEventListener("AudioNodeCreated" /* AudioNodeCreated */, this._audioNodeCreated, this);
        webAudioModel.addEventListener("AudioNodeWillBeDestroyed" /* AudioNodeWillBeDestroyed */, this._audioNodeWillBeDestroyed, this);
        webAudioModel.addEventListener("AudioParamCreated" /* AudioParamCreated */, this._audioParamCreated, this);
        webAudioModel.addEventListener("AudioParamWillBeDestroyed" /* AudioParamWillBeDestroyed */, this._audioParamWillBeDestroyed, this);
        webAudioModel.addEventListener("NodesConnected" /* NodesConnected */, this._nodesConnected, this);
        webAudioModel.addEventListener("NodesDisconnected" /* NodesDisconnected */, this._nodesDisconnected, this);
        webAudioModel.addEventListener("NodeParamConnected" /* NodeParamConnected */, this._nodeParamConnected, this);
        webAudioModel.addEventListener("NodeParamDisconnected" /* NodeParamDisconnected */, this._nodeParamDisconnected, this);
    }
    _removeEventListeners(webAudioModel) {
        webAudioModel.removeEventListener("ContextCreated" /* ContextCreated */, this._contextCreated, this);
        webAudioModel.removeEventListener("ContextDestroyed" /* ContextDestroyed */, this._contextDestroyed, this);
        webAudioModel.removeEventListener("ContextChanged" /* ContextChanged */, this._contextChanged, this);
        webAudioModel.removeEventListener("ModelReset" /* ModelReset */, this._reset, this);
        webAudioModel.removeEventListener("ModelSuspend" /* ModelSuspend */, this._suspendModel, this);
        webAudioModel.removeEventListener("AudioListenerCreated" /* AudioListenerCreated */, this._audioListenerCreated, this);
        webAudioModel.removeEventListener("AudioListenerWillBeDestroyed" /* AudioListenerWillBeDestroyed */, this._audioListenerWillBeDestroyed, this);
        webAudioModel.removeEventListener("AudioNodeCreated" /* AudioNodeCreated */, this._audioNodeCreated, this);
        webAudioModel.removeEventListener("AudioNodeWillBeDestroyed" /* AudioNodeWillBeDestroyed */, this._audioNodeWillBeDestroyed, this);
        webAudioModel.removeEventListener("AudioParamCreated" /* AudioParamCreated */, this._audioParamCreated, this);
        webAudioModel.removeEventListener("AudioParamWillBeDestroyed" /* AudioParamWillBeDestroyed */, this._audioParamWillBeDestroyed, this);
        webAudioModel.removeEventListener("NodesConnected" /* NodesConnected */, this._nodesConnected, this);
        webAudioModel.removeEventListener("NodesDisconnected" /* NodesDisconnected */, this._nodesDisconnected, this);
        webAudioModel.removeEventListener("NodeParamConnected" /* NodeParamConnected */, this._nodeParamConnected, this);
        webAudioModel.removeEventListener("NodeParamDisconnected" /* NodeParamDisconnected */, this._nodeParamDisconnected, this);
    }
    _contextCreated(event) {
        const context = event.data;
        this._graphManager.createContext(context.contextId);
        this._contextSelector.contextCreated(event);
    }
    _contextDestroyed(event) {
        const contextId = event.data;
        this._graphManager.destroyContext(contextId);
        this._contextSelector.contextDestroyed(event);
    }
    _contextChanged(event) {
        const context = event.data;
        if (!this._graphManager.hasContext(context.contextId)) {
            return;
        }
        this._contextSelector.contextChanged(event);
    }
    _reset() {
        if (this._landingPage.isShowing()) {
            this._landingPage.detach();
        }
        this._contextSelector.reset();
        this._detailViewContainer.removeChildren();
        this._landingPage.show(this._detailViewContainer);
        this._graphManager.clearGraphs();
    }
    _suspendModel() {
        this._graphManager.clearGraphs();
    }
    _audioListenerCreated(event) {
        const listener = event.data;
        const graph = this._graphManager.getGraph(listener.contextId);
        if (!graph) {
            return;
        }
        graph.addNode({
            nodeId: listener.listenerId,
            nodeType: 'Listener',
            numberOfInputs: 0,
            numberOfOutputs: 0,
        });
    }
    _audioListenerWillBeDestroyed(event) {
        const { contextId, listenerId } = event.data;
        const graph = this._graphManager.getGraph(contextId);
        if (!graph) {
            return;
        }
        graph.removeNode(listenerId);
    }
    _audioNodeCreated(event) {
        const node = event.data;
        const graph = this._graphManager.getGraph(node.contextId);
        if (!graph) {
            return;
        }
        graph.addNode({
            nodeId: node.nodeId,
            nodeType: node.nodeType,
            numberOfInputs: node.numberOfInputs,
            numberOfOutputs: node.numberOfOutputs,
        });
    }
    _audioNodeWillBeDestroyed(event) {
        const { contextId, nodeId } = event.data;
        const graph = this._graphManager.getGraph(contextId);
        if (!graph) {
            return;
        }
        graph.removeNode(nodeId);
    }
    _audioParamCreated(event) {
        const param = event.data;
        const graph = this._graphManager.getGraph(param.contextId);
        if (!graph) {
            return;
        }
        graph.addParam({
            paramId: param.paramId,
            paramType: param.paramType,
            nodeId: param.nodeId,
        });
    }
    _audioParamWillBeDestroyed(event) {
        const { contextId, paramId } = event.data;
        const graph = this._graphManager.getGraph(contextId);
        if (!graph) {
            return;
        }
        graph.removeParam(paramId);
    }
    _nodesConnected(event) {
        const { contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex } = event.data;
        const graph = this._graphManager.getGraph(contextId);
        if (!graph) {
            return;
        }
        graph.addNodeToNodeConnection({
            sourceId,
            destinationId,
            sourceOutputIndex,
            destinationInputIndex,
        });
    }
    _nodesDisconnected(event) {
        const { contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex } = event.data;
        const graph = this._graphManager.getGraph(contextId);
        if (!graph) {
            return;
        }
        graph.removeNodeToNodeConnection({
            sourceId,
            destinationId,
            sourceOutputIndex,
            destinationInputIndex,
        });
    }
    _nodeParamConnected(event) {
        const { contextId, sourceId, destinationId, sourceOutputIndex } = event.data;
        const graph = this._graphManager.getGraph(contextId);
        if (!graph) {
            return;
        }
        // Since the destinationId is AudioParamId, we need to find the nodeId as the
        // real destinationId.
        const nodeId = graph.getNodeIdByParamId(destinationId);
        if (!nodeId) {
            return;
        }
        graph.addNodeToParamConnection({
            sourceId,
            destinationId: nodeId,
            sourceOutputIndex,
            destinationParamId: destinationId,
        });
    }
    _nodeParamDisconnected(event) {
        const { contextId, sourceId, destinationId, sourceOutputIndex } = event.data;
        const graph = this._graphManager.getGraph(contextId);
        if (!graph) {
            return;
        }
        // Since the destinationId is AudioParamId, we need to find the nodeId as the
        // real destinationId.
        const nodeId = graph.getNodeIdByParamId(destinationId);
        if (!nodeId) {
            return;
        }
        graph.removeNodeToParamConnection({
            sourceId,
            destinationId: nodeId,
            sourceOutputIndex,
            destinationParamId: destinationId,
        });
    }
    _updateDetailView(context) {
        if (this._landingPage.isShowing()) {
            this._landingPage.detach();
        }
        const detailBuilder = new ContextDetailBuilder(context);
        this._detailViewContainer.removeChildren();
        this._detailViewContainer.appendChild(detailBuilder.getFragment());
    }
    _updateSummaryBar(contextId, contextRealtimeData) {
        const summaryBuilder = new ContextSummaryBuilder(contextId, contextRealtimeData);
        this._summaryBarContainer.removeChildren();
        this._summaryBarContainer.appendChild(summaryBuilder.getFragment());
    }
    _clearSummaryBar() {
        this._summaryBarContainer.removeChildren();
    }
    async _pollRealtimeData() {
        const context = this._contextSelector.selectedContext();
        if (!context) {
            this._clearSummaryBar();
            return;
        }
        for (const model of SDK.TargetManager.TargetManager.instance().models(WebAudioModel)) {
            // Display summary only for real-time context.
            if (context.contextType === 'realtime') {
                if (!this._graphManager.hasContext(context.contextId)) {
                    continue;
                }
                const realtimeData = await model.requestRealtimeData(context.contextId);
                if (realtimeData) {
                    this._updateSummaryBar(context.contextId, realtimeData);
                }
            }
            else {
                this._clearSummaryBar();
            }
        }
    }
}
//# sourceMappingURL=WebAudioView.js.map