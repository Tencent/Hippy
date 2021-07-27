// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
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
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text in Call Stack Sidebar Pane of the Sources panel
    */
    callStack: 'Call Stack',
    /**
    *@description Not paused message element text content in Call Stack Sidebar Pane of the Sources panel
    */
    notPaused: 'Not paused',
    /**
    *@description Text exposed to screen reader when navigating through a ignore-listed call frame in the sources panel
    */
    onIgnoreList: 'on ignore list',
    /**
    *@description Show all link text content in Call Stack Sidebar Pane of the Sources panel
    */
    showIgnorelistedFrames: 'Show ignore-listed frames',
    /**
    *@description Text to show more content
    */
    showMore: 'Show more',
    /**
    *@description A context menu item in the Call Stack Sidebar Pane of the Sources panel
    */
    copyStackTrace: 'Copy stack trace',
    /**
    *@description Text to stop preventing the debugger from stepping into library code
    */
    removeFromIgnoreList: 'Remove from ignore list',
    /**
    *@description Text for scripts that should not be stepped into when debugging
    */
    addScriptToIgnoreList: 'Add script to ignore list',
    /**
    *@description A context menu item in the Call Stack Sidebar Pane of the Sources panel
    */
    removeAllContentScriptsFrom: 'Remove all content scripts from ignore list',
    /**
    *@description A context menu item in the Call Stack Sidebar Pane of the Sources panel
    */
    addAllContentScriptsToIgnoreList: 'Add all content scripts to ignore list',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/CallStackSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let callstackSidebarPaneInstance;
export class CallStackSidebarPane extends UI.View.SimpleView {
    _ignoreListMessageElement;
    _notPausedMessageElement;
    _items;
    _list;
    _showMoreMessageElement;
    _showIgnoreListed;
    _locationPool;
    _updateThrottler;
    _maxAsyncStackChainDepth;
    _updateItemThrottler;
    _scheduledForUpdateItems;
    _muteActivateItem;
    constructor() {
        super(i18nString(UIStrings.callStack), true);
        this.registerRequiredCSS('panels/sources/callStackSidebarPane.css', { enableLegacyPatching: false });
        this._ignoreListMessageElement = this._createIgnoreListMessageElement();
        this.contentElement.appendChild(this._ignoreListMessageElement);
        this._notPausedMessageElement = this.contentElement.createChild('div', 'gray-info-message');
        this._notPausedMessageElement.textContent = i18nString(UIStrings.notPaused);
        this._notPausedMessageElement.tabIndex = -1;
        this._items = new UI.ListModel.ListModel();
        this._list = new UI.ListControl.ListControl(this._items, this, UI.ListControl.ListMode.NonViewport);
        this.contentElement.appendChild(this._list.element);
        this._list.element.addEventListener('contextmenu', this._onContextMenu.bind(this), false);
        self.onInvokeElement(this._list.element, event => {
            const item = this._list.itemForNode(event.target);
            if (item) {
                this._activateItem(item);
                event.consume(true);
            }
        });
        this._showMoreMessageElement = this._createShowMoreMessageElement();
        this._showMoreMessageElement.classList.add('hidden');
        this.contentElement.appendChild(this._showMoreMessageElement);
        this._showIgnoreListed = false;
        this._locationPool = new Bindings.LiveLocation.LiveLocationPool();
        this._updateThrottler = new Common.Throttler.Throttler(100);
        this._maxAsyncStackChainDepth = defaultMaxAsyncStackChainDepth;
        this._update();
        this._updateItemThrottler = new Common.Throttler.Throttler(100);
        this._scheduledForUpdateItems = new Set();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!callstackSidebarPaneInstance || forceNew) {
            callstackSidebarPaneInstance = new CallStackSidebarPane();
        }
        return callstackSidebarPaneInstance;
    }
    flavorChanged(_object) {
        this._showIgnoreListed = false;
        this._maxAsyncStackChainDepth = defaultMaxAsyncStackChainDepth;
        this._update();
    }
    _update() {
        this._updateThrottler.schedule(() => this._doUpdate());
    }
    async _doUpdate() {
        this._locationPool.disposeAll();
        const details = UI.Context.Context.instance().flavor(SDK.DebuggerModel.DebuggerPausedDetails);
        if (!details) {
            this._notPausedMessageElement.classList.remove('hidden');
            this._ignoreListMessageElement.classList.add('hidden');
            this._showMoreMessageElement.classList.add('hidden');
            this._items.replaceAll([]);
            UI.Context.Context.instance().setFlavor(SDK.DebuggerModel.CallFrame, null);
            return;
        }
        let debuggerModel = details.debuggerModel;
        this._notPausedMessageElement.classList.add('hidden');
        const itemPromises = [];
        for (const frame of details.callFrames) {
            const itemPromise = Item.createForDebuggerCallFrame(frame, this._locationPool, this._refreshItem.bind(this)).then(item => {
                itemToCallFrame.set(item, frame);
                return item;
            });
            itemPromises.push(itemPromise);
        }
        const items = await Promise.all(itemPromises);
        let asyncStackTrace = details.asyncStackTrace;
        if (!asyncStackTrace && details.asyncStackTraceId) {
            if (details.asyncStackTraceId.debuggerId) {
                debuggerModel = await SDK.DebuggerModel.DebuggerModel.modelForDebuggerId(details.asyncStackTraceId.debuggerId);
            }
            asyncStackTrace = debuggerModel ? await debuggerModel.fetchAsyncStackTrace(details.asyncStackTraceId) : null;
        }
        let previousStackTrace = details.callFrames;
        let maxAsyncStackChainDepth = this._maxAsyncStackChainDepth;
        while (asyncStackTrace && maxAsyncStackChainDepth > 0) {
            let title = '';
            const isAwait = asyncStackTrace.description === 'async function';
            if (isAwait && previousStackTrace.length && asyncStackTrace.callFrames.length) {
                const lastPreviousFrame = previousStackTrace[previousStackTrace.length - 1];
                const lastPreviousFrameName = UI.UIUtils.beautifyFunctionName(lastPreviousFrame.functionName);
                title = UI.UIUtils.asyncStackTraceLabel('await in ' + lastPreviousFrameName);
            }
            else {
                title = UI.UIUtils.asyncStackTraceLabel(asyncStackTrace.description);
            }
            items.push(...await Item.createItemsForAsyncStack(title, debuggerModel, asyncStackTrace.callFrames, this._locationPool, this._refreshItem.bind(this)));
            --maxAsyncStackChainDepth;
            previousStackTrace = asyncStackTrace.callFrames;
            if (asyncStackTrace.parent) {
                asyncStackTrace = asyncStackTrace.parent;
            }
            else if (asyncStackTrace.parentId) {
                if (asyncStackTrace.parentId.debuggerId) {
                    debuggerModel = await SDK.DebuggerModel.DebuggerModel.modelForDebuggerId(asyncStackTrace.parentId.debuggerId);
                }
                asyncStackTrace = debuggerModel ? await debuggerModel.fetchAsyncStackTrace(asyncStackTrace.parentId) : null;
            }
            else {
                asyncStackTrace = null;
            }
        }
        this._showMoreMessageElement.classList.toggle('hidden', !asyncStackTrace);
        this._items.replaceAll(items);
        if (this._maxAsyncStackChainDepth === defaultMaxAsyncStackChainDepth) {
            this._list.selectNextItem(true /* canWrap */, false /* center */);
            const selectedItem = this._list.selectedItem();
            if (selectedItem) {
                this._activateItem(selectedItem);
            }
        }
        this._updatedForTest();
    }
    _updatedForTest() {
    }
    _refreshItem(item) {
        this._scheduledForUpdateItems.add(item);
        this._updateItemThrottler.schedule(async () => {
            const items = Array.from(this._scheduledForUpdateItems);
            this._scheduledForUpdateItems.clear();
            this._muteActivateItem = true;
            if (!this._showIgnoreListed && this._items.every(item => item.isIgnoreListed)) {
                this._showIgnoreListed = true;
                for (let i = 0; i < this._items.length; ++i) {
                    this._list.refreshItemByIndex(i);
                }
                this._ignoreListMessageElement.classList.toggle('hidden', true);
            }
            else {
                const itemsSet = new Set(items);
                let hasIgnoreListed = false;
                for (let i = 0; i < this._items.length; ++i) {
                    const item = this._items.at(i);
                    if (itemsSet.has(item)) {
                        this._list.refreshItemByIndex(i);
                    }
                    hasIgnoreListed = hasIgnoreListed || item.isIgnoreListed;
                }
                this._ignoreListMessageElement.classList.toggle('hidden', this._showIgnoreListed || !hasIgnoreListed);
            }
            delete this._muteActivateItem;
        });
    }
    createElementForItem(item) {
        const element = document.createElement('div');
        element.classList.add('call-frame-item');
        const title = element.createChild('div', 'call-frame-item-title');
        const titleElement = title.createChild('div', 'call-frame-title-text');
        titleElement.textContent = item.title;
        if (item.isAsyncHeader) {
            element.classList.add('async-header');
        }
        else {
            UI.Tooltip.Tooltip.install(titleElement, item.title);
            const linkElement = element.createChild('div', 'call-frame-location');
            linkElement.textContent = Platform.StringUtilities.trimMiddle(item.linkText, 30);
            UI.Tooltip.Tooltip.install(linkElement, item.linkText);
            element.classList.toggle('ignore-listed-call-frame', item.isIgnoreListed);
            if (item.isIgnoreListed) {
                UI.ARIAUtils.setDescription(element, i18nString(UIStrings.onIgnoreList));
            }
            if (!itemToCallFrame.has(item)) {
                UI.ARIAUtils.setDisabled(element, true);
            }
        }
        const isSelected = itemToCallFrame.get(item) === UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        element.classList.toggle('selected', isSelected);
        UI.ARIAUtils.setSelected(element, isSelected);
        element.classList.toggle('hidden', !this._showIgnoreListed && item.isIgnoreListed);
        element.appendChild(UI.Icon.Icon.create('smallicon-thick-right-arrow', 'selected-call-frame-icon'));
        element.tabIndex = item === this._list.selectedItem() ? 0 : -1;
        return element;
    }
    heightForItem(_item) {
        console.assert(false); // Should not be called.
        return 0;
    }
    isItemSelectable(_item) {
        return true;
    }
    selectedItemChanged(_from, _to, fromElement, toElement) {
        if (fromElement) {
            fromElement.tabIndex = -1;
        }
        if (toElement) {
            this.setDefaultFocusedElement(toElement);
            toElement.tabIndex = 0;
            if (this.hasFocus()) {
                toElement.focus();
            }
        }
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return true;
    }
    _createIgnoreListMessageElement() {
        const element = document.createElement('div');
        element.classList.add('ignore-listed-message');
        element.createChild('span');
        const showAllLink = element.createChild('span', 'link');
        showAllLink.textContent = i18nString(UIStrings.showIgnorelistedFrames);
        UI.ARIAUtils.markAsLink(showAllLink);
        showAllLink.tabIndex = 0;
        const showAll = () => {
            this._showIgnoreListed = true;
            for (const item of this._items) {
                this._refreshItem(item);
            }
            this._ignoreListMessageElement.classList.toggle('hidden', true);
        };
        showAllLink.addEventListener('click', showAll);
        showAllLink.addEventListener('keydown', event => event.key === 'Enter' && showAll());
        return element;
    }
    _createShowMoreMessageElement() {
        const element = document.createElement('div');
        element.classList.add('show-more-message');
        element.createChild('span');
        const showAllLink = element.createChild('span', 'link');
        showAllLink.textContent = i18nString(UIStrings.showMore);
        showAllLink.addEventListener('click', () => {
            this._maxAsyncStackChainDepth += defaultMaxAsyncStackChainDepth;
            this._update();
        }, false);
        return element;
    }
    _onContextMenu(event) {
        const item = this._list.itemForNode(event.target);
        if (!item) {
            return;
        }
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.copyStackTrace), this._copyStackTrace.bind(this));
        if (item.uiLocation) {
            this.appendIgnoreListURLContextMenuItems(contextMenu, item.uiLocation.uiSourceCode);
        }
        contextMenu.show();
    }
    _onClick(event) {
        const item = this._list.itemForNode(event.target);
        if (item) {
            this._activateItem(item);
        }
    }
    _activateItem(item) {
        const uiLocation = item.uiLocation;
        if (this._muteActivateItem || !uiLocation) {
            return;
        }
        this._list.selectItem(item);
        const debuggerCallFrame = itemToCallFrame.get(item);
        const oldItem = this.activeCallFrameItem();
        if (debuggerCallFrame && oldItem !== item) {
            debuggerCallFrame.debuggerModel.setSelectedCallFrame(debuggerCallFrame);
            UI.Context.Context.instance().setFlavor(SDK.DebuggerModel.CallFrame, debuggerCallFrame);
            if (oldItem) {
                this._refreshItem(oldItem);
            }
            this._refreshItem(item);
        }
        else {
            Common.Revealer.reveal(uiLocation);
        }
    }
    activeCallFrameItem() {
        const callFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        if (callFrame) {
            return this._items.find(callFrameItem => itemToCallFrame.get(callFrameItem) === callFrame) || null;
        }
        return null;
    }
    appendIgnoreListURLContextMenuItems(contextMenu, uiSourceCode) {
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
        if (binding) {
            uiSourceCode = binding.network;
        }
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.FileSystem) {
            return;
        }
        const canIgnoreList = Bindings.IgnoreListManager.IgnoreListManager.instance().canIgnoreListUISourceCode(uiSourceCode);
        const isIgnoreListed = Bindings.IgnoreListManager.IgnoreListManager.instance().isIgnoreListedUISourceCode(uiSourceCode);
        const isContentScript = uiSourceCode.project().type() === Workspace.Workspace.projectTypes.ContentScripts;
        const manager = Bindings.IgnoreListManager.IgnoreListManager.instance();
        if (canIgnoreList) {
            if (isIgnoreListed) {
                contextMenu.defaultSection().appendItem(i18nString(UIStrings.removeFromIgnoreList), manager.unIgnoreListUISourceCode.bind(manager, uiSourceCode));
            }
            else {
                contextMenu.defaultSection().appendItem(i18nString(UIStrings.addScriptToIgnoreList), manager.ignoreListUISourceCode.bind(manager, uiSourceCode));
            }
        }
        if (isContentScript) {
            if (isIgnoreListed) {
                contextMenu.defaultSection().appendItem(i18nString(UIStrings.removeAllContentScriptsFrom), manager.ignoreListContentScripts.bind(manager));
            }
            else {
                contextMenu.defaultSection().appendItem(i18nString(UIStrings.addAllContentScriptsToIgnoreList), manager.unIgnoreListContentScripts.bind(manager));
            }
        }
    }
    _selectNextCallFrameOnStack() {
        const oldItem = this.activeCallFrameItem();
        const startIndex = oldItem ? this._items.indexOf(oldItem) + 1 : 0;
        for (let i = startIndex; i < this._items.length; i++) {
            const newItem = this._items.at(i);
            if (itemToCallFrame.has(newItem)) {
                this._activateItem(newItem);
                break;
            }
        }
    }
    _selectPreviousCallFrameOnStack() {
        const oldItem = this.activeCallFrameItem();
        const startIndex = oldItem ? this._items.indexOf(oldItem) - 1 : this._items.length - 1;
        for (let i = startIndex; i >= 0; i--) {
            const newItem = this._items.at(i);
            if (itemToCallFrame.has(newItem)) {
                this._activateItem(newItem);
                break;
            }
        }
    }
    _copyStackTrace() {
        const text = [];
        for (const item of this._items) {
            let itemText = item.title;
            if (item.uiLocation) {
                itemText += ' (' + item.uiLocation.linkText(true /* skipTrim */) + ')';
            }
            text.push(itemText);
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(text.join('\n'));
    }
}
const itemToCallFrame = new WeakMap();
export const elementSymbol = Symbol('element');
export const defaultMaxAsyncStackChainDepth = 32;
let actionDelegateInstance;
export class ActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!actionDelegateInstance || forceNew) {
            actionDelegateInstance = new ActionDelegate();
        }
        return actionDelegateInstance;
    }
    handleAction(context, actionId) {
        switch (actionId) {
            case 'debugger.next-call-frame':
                CallStackSidebarPane.instance()._selectNextCallFrameOnStack();
                return true;
            case 'debugger.previous-call-frame':
                CallStackSidebarPane.instance()._selectPreviousCallFrameOnStack();
                return true;
        }
        return false;
    }
}
export class Item {
    isIgnoreListed;
    title;
    linkText;
    uiLocation;
    isAsyncHeader;
    updateDelegate;
    static async createForDebuggerCallFrame(frame, locationPool, updateDelegate) {
        const item = new Item(UI.UIUtils.beautifyFunctionName(frame.functionName), updateDelegate);
        await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createCallFrameLiveLocation(frame.location(), item._update.bind(item), locationPool);
        return item;
    }
    static async createItemsForAsyncStack(title, debuggerModel, frames, locationPool, updateDelegate) {
        const headerItemToItemsSet = new WeakMap();
        const asyncHeaderItem = new Item(title, updateDelegate);
        headerItemToItemsSet.set(asyncHeaderItem, new Set());
        asyncHeaderItem.isAsyncHeader = true;
        const asyncFrameItems = [];
        const liveLocationPromises = [];
        for (const frame of frames) {
            const item = new Item(UI.UIUtils.beautifyFunctionName(frame.functionName), update);
            const rawLocation = debuggerModel ?
                debuggerModel.createRawLocationByScriptId(frame.scriptId, frame.lineNumber, frame.columnNumber) :
                null;
            if (!rawLocation) {
                item.linkText = (frame.url || '<unknown>') + ':' + (frame.lineNumber + 1);
                item.updateDelegate(item);
            }
            else {
                liveLocationPromises.push(Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createCallFrameLiveLocation(rawLocation, item._update.bind(item), locationPool));
            }
            asyncFrameItems.push(item);
        }
        await Promise.all(liveLocationPromises);
        updateDelegate(asyncHeaderItem);
        return [asyncHeaderItem, ...asyncFrameItems];
        function update(item) {
            updateDelegate(item);
            let shouldUpdate = false;
            const items = headerItemToItemsSet.get(asyncHeaderItem);
            if (items) {
                if (item.isIgnoreListed) {
                    items.delete(item);
                    shouldUpdate = items.size === 0;
                }
                else {
                    shouldUpdate = items.size === 0;
                    items.add(item);
                }
                asyncHeaderItem.isIgnoreListed = items.size === 0;
            }
            if (shouldUpdate) {
                updateDelegate(asyncHeaderItem);
            }
        }
    }
    constructor(title, updateDelegate) {
        this.isIgnoreListed = false;
        this.title = title;
        this.linkText = '';
        this.uiLocation = null;
        this.isAsyncHeader = false;
        this.updateDelegate = updateDelegate;
    }
    async _update(liveLocation) {
        const uiLocation = await liveLocation.uiLocation();
        this.isIgnoreListed = await liveLocation.isIgnoreListed();
        this.linkText = uiLocation ? uiLocation.linkText() : '';
        this.uiLocation = uiLocation;
        this.updateDelegate(this);
    }
}
//# sourceMappingURL=CallStackSidebarPane.js.map