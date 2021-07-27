// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
export class ExecutionContextSelector {
    targetManager;
    context;
    lastSelectedContextId;
    ignoreContextChanged;
    constructor(targetManager, context) {
        context.addFlavorChangeListener(SDK.RuntimeModel.ExecutionContext, this.executionContextChanged, this);
        context.addFlavorChangeListener(SDK.Target.Target, this.targetChanged, this);
        targetManager.addModelListener(SDK.RuntimeModel.RuntimeModel, SDK.RuntimeModel.Events.ExecutionContextCreated, this.onExecutionContextCreated, this);
        targetManager.addModelListener(SDK.RuntimeModel.RuntimeModel, SDK.RuntimeModel.Events.ExecutionContextDestroyed, this.onExecutionContextDestroyed, this);
        targetManager.addModelListener(SDK.RuntimeModel.RuntimeModel, SDK.RuntimeModel.Events.ExecutionContextOrderChanged, this.onExecutionContextOrderChanged, this);
        this.targetManager = targetManager;
        this.context = context;
        targetManager.observeModels(SDK.RuntimeModel.RuntimeModel, this);
    }
    modelAdded(runtimeModel) {
        // Defer selecting default target since we need all clients to get their
        // targetAdded notifications first.
        queueMicrotask(deferred.bind(this));
        function deferred() {
            // We always want the second context for the service worker targets.
            if (!this.context.flavor(SDK.Target.Target)) {
                this.context.setFlavor(SDK.Target.Target, runtimeModel.target());
            }
        }
    }
    modelRemoved(runtimeModel) {
        const currentExecutionContext = this.context.flavor(SDK.RuntimeModel.ExecutionContext);
        if (currentExecutionContext && currentExecutionContext.runtimeModel === runtimeModel) {
            this.currentExecutionContextGone();
        }
        const models = this.targetManager.models(SDK.RuntimeModel.RuntimeModel);
        if (this.context.flavor(SDK.Target.Target) === runtimeModel.target() && models.length) {
            this.context.setFlavor(SDK.Target.Target, models[0].target());
        }
    }
    executionContextChanged(event) {
        const newContext = event.data;
        if (newContext) {
            this.context.setFlavor(SDK.Target.Target, newContext.target());
            if (!this.ignoreContextChanged) {
                this.lastSelectedContextId = this.contextPersistentId(newContext);
            }
        }
    }
    contextPersistentId(executionContext) {
        return executionContext.isDefault ? executionContext.target().name() + ':' + executionContext.frameId : '';
    }
    targetChanged(event) {
        const newTarget = event.data;
        const currentContext = this.context.flavor(SDK.RuntimeModel.ExecutionContext);
        if (!newTarget || (currentContext && currentContext.target() === newTarget)) {
            return;
        }
        const runtimeModel = newTarget.model(SDK.RuntimeModel.RuntimeModel);
        const executionContexts = runtimeModel ? runtimeModel.executionContexts() : [];
        if (!executionContexts.length) {
            return;
        }
        let newContext = null;
        for (let i = 0; i < executionContexts.length && !newContext; ++i) {
            if (this.shouldSwitchToContext(executionContexts[i])) {
                newContext = executionContexts[i];
            }
        }
        for (let i = 0; i < executionContexts.length && !newContext; ++i) {
            if (this.isDefaultContext(executionContexts[i])) {
                newContext = executionContexts[i];
            }
        }
        this.ignoreContextChanged = true;
        this.context.setFlavor(SDK.RuntimeModel.ExecutionContext, newContext || executionContexts[0]);
        this.ignoreContextChanged = false;
    }
    shouldSwitchToContext(executionContext) {
        if (this.lastSelectedContextId && this.lastSelectedContextId === this.contextPersistentId(executionContext)) {
            return true;
        }
        return !this.lastSelectedContextId && this.isDefaultContext(executionContext);
    }
    isDefaultContext(executionContext) {
        if (!executionContext.isDefault || !executionContext.frameId) {
            return false;
        }
        if (executionContext.target().parentTarget()) {
            return false;
        }
        const resourceTreeModel = executionContext.target().model(SDK.ResourceTreeModel.ResourceTreeModel);
        const frame = resourceTreeModel && resourceTreeModel.frameForId(executionContext.frameId);
        return Boolean(frame?.isTopFrame());
    }
    onExecutionContextCreated(event) {
        this.switchContextIfNecessary(event.data);
    }
    onExecutionContextDestroyed(event) {
        const executionContext = event.data;
        if (this.context.flavor(SDK.RuntimeModel.ExecutionContext) === executionContext) {
            this.currentExecutionContextGone();
        }
    }
    onExecutionContextOrderChanged(event) {
        const runtimeModel = event.data;
        const executionContexts = runtimeModel.executionContexts();
        for (let i = 0; i < executionContexts.length; i++) {
            if (this.switchContextIfNecessary(executionContexts[i])) {
                break;
            }
        }
    }
    switchContextIfNecessary(executionContext) {
        if (!this.context.flavor(SDK.RuntimeModel.ExecutionContext) || this.shouldSwitchToContext(executionContext)) {
            this.ignoreContextChanged = true;
            this.context.setFlavor(SDK.RuntimeModel.ExecutionContext, executionContext);
            this.ignoreContextChanged = false;
            return true;
        }
        return false;
    }
    currentExecutionContextGone() {
        const runtimeModels = this.targetManager.models(SDK.RuntimeModel.RuntimeModel);
        let newContext = null;
        for (let i = 0; i < runtimeModels.length && !newContext; ++i) {
            const executionContexts = runtimeModels[i].executionContexts();
            for (const executionContext of executionContexts) {
                if (this.isDefaultContext(executionContext)) {
                    newContext = executionContext;
                    break;
                }
            }
        }
        if (!newContext) {
            for (let i = 0; i < runtimeModels.length && !newContext; ++i) {
                const executionContexts = runtimeModels[i].executionContexts();
                if (executionContexts.length) {
                    newContext = executionContexts[0];
                    break;
                }
            }
        }
        this.ignoreContextChanged = true;
        this.context.setFlavor(SDK.RuntimeModel.ExecutionContext, newContext);
        this.ignoreContextChanged = false;
    }
}
//# sourceMappingURL=ExecutionContextSelector.js.map