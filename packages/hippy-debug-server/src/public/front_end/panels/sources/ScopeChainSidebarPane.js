// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as LinearMemoryInspector from '../../ui/components/linear_memory_inspector/linear_memory_inspector.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { resolveScopeChain, resolveScopeInObject, resolveThisObject } from './SourceMapNamesResolver.js';
const UIStrings = {
    /**
    *@description Loading indicator in Scope Sidebar Pane of the Sources panel
    */
    loading: 'Loading...',
    /**
    *@description Not paused message element text content in Call Stack Sidebar Pane of the Sources panel
    */
    notPaused: 'Not paused',
    /**
    *@description Empty placeholder in Scope Chain Sidebar Pane of the Sources panel
    */
    noVariables: 'No variables',
    /**
    *@description Text in the Sources panel Scope pane describing a closure scope.
    *@example {func} PH1
    */
    closureS: 'Closure ({PH1})',
    /**
    *@description Text that refers to closure as a programming term
    */
    closure: 'Closure',
    /**
    *@description Text in Scope Chain Sidebar Pane of the Sources panel
    */
    exception: 'Exception',
    /**
    *@description Text in Scope Chain Sidebar Pane of the Sources panel
    */
    returnValue: 'Return value',
    /**
    *@description A context menu item in the Scope View of the Sources Panel
    */
    revealInMemoryInspectorPanel: 'Reveal in Memory Inspector panel',
    /**
    *@description Error message that shows up in the console if a buffer to be opened in the lienar memory inspector cannot be found.
    */
    couldNotOpenLinearMemory: 'Could not open linear memory inspector: failed locating buffer.',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/ScopeChainSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let scopeChainSidebarPaneInstance;
export class ScopeChainSidebarPane extends UI.Widget.VBox {
    _treeOutline;
    _expandController;
    _linkifier;
    _infoElement;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/sources/scopeChainSidebarPane.css', { enableLegacyPatching: false });
        this._treeOutline = new ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeOutline();
        this._treeOutline.registerRequiredCSS('panels/sources/scopeChainSidebarPane.css', { enableLegacyPatching: false });
        this._treeOutline.setShowSelectionOnKeyboardFocus(/* show */ true);
        this._expandController =
            new ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController(this._treeOutline);
        this._linkifier = new Components.Linkifier.Linkifier();
        this._infoElement = document.createElement('div');
        this._infoElement.className = 'gray-info-message';
        this._infoElement.tabIndex = -1;
        this._update();
    }
    static instance() {
        if (!scopeChainSidebarPaneInstance) {
            scopeChainSidebarPaneInstance = new ScopeChainSidebarPane();
        }
        return scopeChainSidebarPaneInstance;
    }
    flavorChanged(_object) {
        this._update();
    }
    focus() {
        if (this.hasFocus()) {
            return;
        }
        if (UI.Context.Context.instance().flavor(SDK.DebuggerModel.DebuggerPausedDetails)) {
            this._treeOutline.forceSelect();
        }
    }
    async _update() {
        // The `resolveThisObject(callFrame)` and `resolveScopeChain(callFrame)` calls
        // below may take a while to complete, so indicate to the user that something
        // is happening (see https://crbug.com/1162416).
        this._infoElement.textContent = i18nString(UIStrings.loading);
        this.contentElement.removeChildren();
        this.contentElement.appendChild(this._infoElement);
        this._linkifier.reset();
        const callFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        const [thisObject, scopeChain] = await Promise.all([resolveThisObject(callFrame), resolveScopeChain(callFrame)]);
        // By now the developer might have moved on, and we don't want to show stale
        // scope information, so check again that we're still on the same CallFrame.
        if (callFrame === UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame)) {
            const details = UI.Context.Context.instance().flavor(SDK.DebuggerModel.DebuggerPausedDetails);
            this._treeOutline.removeChildren();
            if (!details || !callFrame || !scopeChain) {
                this._infoElement.textContent = i18nString(UIStrings.notPaused);
                return;
            }
            this.contentElement.removeChildren();
            this.contentElement.appendChild(this._treeOutline.element);
            let foundLocalScope = false;
            for (let i = 0; i < scopeChain.length; ++i) {
                const scope = scopeChain[i];
                const extraProperties = this._extraPropertiesForScope(scope, details, callFrame, thisObject, i === 0);
                if (scope.type() === "local" /* Local */) {
                    foundLocalScope = true;
                }
                const section = this._createScopeSectionTreeElement(scope, extraProperties);
                if (scope.type() === "global" /* Global */) {
                    section.collapse();
                }
                else if (!foundLocalScope || scope.type() === "local" /* Local */) {
                    section.expand();
                }
                this._treeOutline.appendChild(section);
                if (i === 0) {
                    section.select(/* omitFocus */ true);
                }
            }
            this._sidebarPaneUpdatedForTest();
        }
    }
    _createScopeSectionTreeElement(scope, extraProperties) {
        let emptyPlaceholder = null;
        if (scope.type() === "local" /* Local */ || "closure" /* Closure */) {
            emptyPlaceholder = i18nString(UIStrings.noVariables);
        }
        let title = scope.typeName();
        if (scope.type() === "closure" /* Closure */) {
            const scopeName = scope.name();
            if (scopeName) {
                title = i18nString(UIStrings.closureS, { PH1: UI.UIUtils.beautifyFunctionName(scopeName) });
            }
            else {
                title = i18nString(UIStrings.closure);
            }
        }
        let subtitle = scope.description();
        if (!title || title === subtitle) {
            subtitle = null;
        }
        const icon = scope.icon();
        const titleElement = document.createElement('div');
        titleElement.classList.add('scope-chain-sidebar-pane-section-header');
        titleElement.classList.add('tree-element-title');
        if (icon) {
            const iconElement = document.createElement('img');
            iconElement.classList.add('scope-chain-sidebar-pane-section-icon');
            iconElement.src = icon;
            titleElement.appendChild(iconElement);
        }
        titleElement.createChild('div', 'scope-chain-sidebar-pane-section-subtitle').textContent = subtitle;
        titleElement.createChild('div', 'scope-chain-sidebar-pane-section-title').textContent = title;
        const section = new ObjectUI.ObjectPropertiesSection.RootElement(resolveScopeInObject(scope), this._linkifier, emptyPlaceholder, 
        /* ignoreHasOwnProperty */ true, extraProperties);
        section.title = titleElement;
        section.listItemElement.classList.add('scope-chain-sidebar-pane-section');
        section.listItemElement.setAttribute('aria-label', title);
        this._expandController.watchSection(title + (subtitle ? ':' + subtitle : ''), section);
        return section;
    }
    _extraPropertiesForScope(scope, details, callFrame, thisObject, isFirstScope) {
        if (scope.type() !== "local" /* Local */ || callFrame.script.isWasm()) {
            return [];
        }
        const extraProperties = [];
        if (thisObject) {
            extraProperties.push(new SDK.RemoteObject.RemoteObjectProperty('this', thisObject));
        }
        if (isFirstScope) {
            const exception = details.exception();
            if (exception) {
                extraProperties.push(new SDK.RemoteObject.RemoteObjectProperty(i18nString(UIStrings.exception), exception, undefined, undefined, undefined, undefined, undefined, 
                /* synthetic */ true));
            }
            const returnValue = callFrame.returnValue();
            if (returnValue) {
                extraProperties.push(new SDK.RemoteObject.RemoteObjectProperty(i18nString(UIStrings.returnValue), returnValue, undefined, undefined, undefined, undefined, undefined, 
                /* synthetic */ true, callFrame.setReturnValue.bind(callFrame)));
            }
        }
        return extraProperties;
    }
    _sidebarPaneUpdatedForTest() {
    }
}
let openLinearMemoryInspectorInstance;
export class OpenLinearMemoryInspector extends UI.Widget.VBox {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!openLinearMemoryInspectorInstance || forceNew) {
            openLinearMemoryInspectorInstance = new OpenLinearMemoryInspector();
        }
        return openLinearMemoryInspectorInstance;
    }
    _isMemoryObjectProperty(obj) {
        const isWasmMemory = obj.type === 'object' && obj.subtype &&
            LinearMemoryInspector.LinearMemoryInspectorController.ACCEPTED_MEMORY_TYPES.includes(obj.subtype);
        if (isWasmMemory) {
            return true;
        }
        if (obj instanceof Bindings.DebuggerLanguagePlugins.ValueNode) {
            const valueNode = /** @type {!Bindings.DebuggerLanguagePlugins.ValueNode} */ obj;
            return valueNode.inspectableAddress !== undefined;
        }
        return false;
    }
    appendApplicableItems(event, contextMenu, target) {
        if (target instanceof ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement) {
            if (target.property && target.property.value && this._isMemoryObjectProperty(target.property.value)) {
                contextMenu.debugSection().appendItem(i18nString(UIStrings.revealInMemoryInspectorPanel), this._openMemoryInspector.bind(this, target.property.value));
            }
        }
    }
    async _openMemoryInspector(obj) {
        const controller = LinearMemoryInspector.LinearMemoryInspectorController.LinearMemoryInspectorController.instance();
        let address = 0;
        let memoryObj = obj;
        if (obj instanceof Bindings.DebuggerLanguagePlugins.ValueNode) {
            const valueNode = /** @type {!Bindings.DebuggerLanguagePlugins.ValueNode} */ obj;
            address = valueNode.inspectableAddress || 0;
            const callFrame = valueNode.callFrame;
            const response = await obj.debuggerModel()._agent.invoke_evaluateOnCallFrame({
                callFrameId: callFrame.id,
                expression: 'memories[0]',
            });
            const error = response.getError();
            if (error) {
                console.error(error);
                Common.Console.Console.instance().error(i18nString(UIStrings.couldNotOpenLinearMemory));
            }
            const runtimeModel = obj.debuggerModel().runtimeModel();
            memoryObj = runtimeModel.createRemoteObject(response.result);
        }
        Host.userMetrics.linearMemoryInspectorRevealedFrom(Host.UserMetrics.LinearMemoryInspectorRevealedFrom.ContextMenu);
        controller.openInspectorView(memoryObj, address);
    }
}
//# sourceMappingURL=ScopeChainSidebarPane.js.map