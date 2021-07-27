// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as Bindings from '../bindings/bindings.js';
import * as Workspace from '../workspace/workspace.js';
import { Automapping } from './Automapping.js';
import { LinkDecorator } from './PersistenceUtils.js';
let persistenceInstance;
export class PersistenceImpl extends Common.ObjectWrapper.ObjectWrapper {
    _workspace;
    _breakpointManager;
    _filePathPrefixesToBindingCount;
    _subscribedBindingEventListeners;
    _mapping;
    constructor(workspace, breakpointManager) {
        super();
        this._workspace = workspace;
        this._breakpointManager = breakpointManager;
        this._filePathPrefixesToBindingCount = new Map();
        this._subscribedBindingEventListeners = new Platform.MapUtilities.Multimap();
        const linkDecorator = new LinkDecorator(this);
        Components.Linkifier.Linkifier.setLinkDecorator(linkDecorator);
        this._mapping = new Automapping(this._workspace, this._onStatusAdded.bind(this), this._onStatusRemoved.bind(this));
    }
    static instance(opts = { forceNew: null, workspace: null, breakpointManager: null }) {
        const { forceNew, workspace, breakpointManager } = opts;
        if (!persistenceInstance || forceNew) {
            if (!workspace || !breakpointManager) {
                throw new Error('Missing arguments for workspace');
            }
            persistenceInstance = new PersistenceImpl(workspace, breakpointManager);
        }
        return persistenceInstance;
    }
    addNetworkInterceptor(interceptor) {
        this._mapping.addNetworkInterceptor(interceptor);
    }
    refreshAutomapping() {
        this._mapping.scheduleRemap();
    }
    async addBinding(binding) {
        await this._innerAddBinding(binding);
    }
    async addBindingForTest(binding) {
        await this._innerAddBinding(binding);
    }
    async removeBinding(binding) {
        await this._innerRemoveBinding(binding);
    }
    async removeBindingForTest(binding) {
        await this._innerRemoveBinding(binding);
    }
    async _innerAddBinding(binding) {
        bindings.set(binding.network, binding);
        bindings.set(binding.fileSystem, binding);
        binding.fileSystem.forceLoadOnCheckContent();
        binding.network.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._onWorkingCopyCommitted, this);
        binding.fileSystem.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._onWorkingCopyCommitted, this);
        binding.network.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._onWorkingCopyChanged, this);
        binding.fileSystem.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._onWorkingCopyChanged, this);
        this._addFilePathBindingPrefixes(binding.fileSystem.url());
        await this._moveBreakpoints(binding.fileSystem, binding.network);
        console.assert(!binding.fileSystem.isDirty() || !binding.network.isDirty());
        if (binding.fileSystem.isDirty()) {
            this._syncWorkingCopy(binding.fileSystem);
        }
        else if (binding.network.isDirty()) {
            this._syncWorkingCopy(binding.network);
        }
        else if (binding.network.hasCommits() && binding.network.content() !== binding.fileSystem.content()) {
            binding.network.setWorkingCopy(binding.network.content());
            this._syncWorkingCopy(binding.network);
        }
        this._notifyBindingEvent(binding.network);
        this._notifyBindingEvent(binding.fileSystem);
        this.dispatchEventToListeners(Events.BindingCreated, binding);
    }
    async _innerRemoveBinding(binding) {
        if (bindings.get(binding.network) !== binding) {
            return;
        }
        console.assert(bindings.get(binding.network) === bindings.get(binding.fileSystem), 'ERROR: inconsistent binding for networkURL ' + binding.network.url());
        bindings.delete(binding.network);
        bindings.delete(binding.fileSystem);
        binding.network.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._onWorkingCopyCommitted, this);
        binding.fileSystem.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._onWorkingCopyCommitted, this);
        binding.network.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._onWorkingCopyChanged, this);
        binding.fileSystem.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._onWorkingCopyChanged, this);
        this._removeFilePathBindingPrefixes(binding.fileSystem.url());
        await this._breakpointManager.copyBreakpoints(binding.network.url(), binding.fileSystem);
        this._notifyBindingEvent(binding.network);
        this._notifyBindingEvent(binding.fileSystem);
        this.dispatchEventToListeners(Events.BindingRemoved, binding);
    }
    async _onStatusAdded(status) {
        const binding = new PersistenceBinding(status.network, status.fileSystem);
        statusBindings.set(status, binding);
        await this._innerAddBinding(binding);
    }
    async _onStatusRemoved(status) {
        const binding = statusBindings.get(status);
        await this._innerRemoveBinding(binding);
    }
    _onWorkingCopyChanged(event) {
        const uiSourceCode = event.data;
        this._syncWorkingCopy(uiSourceCode);
    }
    _syncWorkingCopy(uiSourceCode) {
        const binding = bindings.get(uiSourceCode);
        if (!binding || mutedWorkingCopies.has(binding)) {
            return;
        }
        const other = binding.network === uiSourceCode ? binding.fileSystem : binding.network;
        if (!uiSourceCode.isDirty()) {
            mutedWorkingCopies.add(binding);
            other.resetWorkingCopy();
            mutedWorkingCopies.delete(binding);
            this._contentSyncedForTest();
            return;
        }
        const target = Bindings.NetworkProject.NetworkProject.targetForUISourceCode(binding.network);
        if (target && target.type() === SDK.Target.Type.Node) {
            const newContent = uiSourceCode.workingCopy();
            other.requestContent().then(() => {
                const nodeJSContent = PersistenceImpl.rewrapNodeJSContent(other, other.workingCopy(), newContent);
                setWorkingCopy.call(this, () => nodeJSContent);
            });
            return;
        }
        setWorkingCopy.call(this, () => uiSourceCode.workingCopy());
        function setWorkingCopy(workingCopyGetter) {
            if (binding) {
                mutedWorkingCopies.add(binding);
            }
            other.setWorkingCopyGetter(workingCopyGetter);
            if (binding) {
                mutedWorkingCopies.delete(binding);
            }
            this._contentSyncedForTest();
        }
    }
    _onWorkingCopyCommitted(event) {
        const uiSourceCode = event.data.uiSourceCode;
        const newContent = event.data.content;
        this.syncContent(uiSourceCode, newContent, event.data.encoded);
    }
    syncContent(uiSourceCode, newContent, encoded) {
        const binding = bindings.get(uiSourceCode);
        if (!binding || mutedCommits.has(binding)) {
            return;
        }
        const other = binding.network === uiSourceCode ? binding.fileSystem : binding.network;
        const target = Bindings.NetworkProject.NetworkProject.targetForUISourceCode(binding.network);
        if (target && target.type() === SDK.Target.Type.Node) {
            other.requestContent().then(currentContent => {
                const nodeJSContent = PersistenceImpl.rewrapNodeJSContent(other, currentContent.content || '', newContent);
                setContent.call(this, nodeJSContent);
            });
            return;
        }
        setContent.call(this, newContent);
        function setContent(newContent) {
            if (binding) {
                mutedCommits.add(binding);
            }
            other.setContent(newContent, encoded);
            if (binding) {
                mutedCommits.delete(binding);
            }
            this._contentSyncedForTest();
        }
    }
    static rewrapNodeJSContent(uiSourceCode, currentContent, newContent) {
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.FileSystem) {
            if (newContent.startsWith(NodePrefix) && newContent.endsWith(NodeSuffix)) {
                newContent = newContent.substring(NodePrefix.length, newContent.length - NodeSuffix.length);
            }
            if (currentContent.startsWith(NodeShebang)) {
                newContent = NodeShebang + newContent;
            }
        }
        else {
            if (newContent.startsWith(NodeShebang)) {
                newContent = newContent.substring(NodeShebang.length);
            }
            if (currentContent.startsWith(NodePrefix) && currentContent.endsWith(NodeSuffix)) {
                newContent = NodePrefix + newContent + NodeSuffix;
            }
        }
        return newContent;
    }
    _contentSyncedForTest() {
    }
    async _moveBreakpoints(from, to) {
        const breakpoints = this._breakpointManager.breakpointLocationsForUISourceCode(from).map(breakpointLocation => breakpointLocation.breakpoint);
        await Promise.all(breakpoints.map(breakpoint => {
            breakpoint.remove(false /* keepInStorage */);
            return this._breakpointManager.setBreakpoint(to, breakpoint.lineNumber(), breakpoint.columnNumber(), breakpoint.condition(), breakpoint.enabled());
        }));
    }
    hasUnsavedCommittedChanges(uiSourceCode) {
        if (this._workspace.hasResourceContentTrackingExtensions()) {
            return false;
        }
        if (uiSourceCode.project().canSetFileContent()) {
            return false;
        }
        if (bindings.has(uiSourceCode)) {
            return false;
        }
        return Boolean(uiSourceCode.hasCommits());
    }
    binding(uiSourceCode) {
        return bindings.get(uiSourceCode) || null;
    }
    subscribeForBindingEvent(uiSourceCode, listener) {
        this._subscribedBindingEventListeners.set(uiSourceCode, listener);
    }
    unsubscribeFromBindingEvent(uiSourceCode, listener) {
        this._subscribedBindingEventListeners.delete(uiSourceCode, listener);
    }
    _notifyBindingEvent(uiSourceCode) {
        if (!this._subscribedBindingEventListeners.has(uiSourceCode)) {
            return;
        }
        const listeners = Array.from(this._subscribedBindingEventListeners.get(uiSourceCode));
        for (const listener of listeners) {
            listener.call(null);
        }
    }
    fileSystem(uiSourceCode) {
        const binding = this.binding(uiSourceCode);
        return binding ? binding.fileSystem : null;
    }
    network(uiSourceCode) {
        const binding = this.binding(uiSourceCode);
        return binding ? binding.network : null;
    }
    _addFilePathBindingPrefixes(filePath) {
        let relative = '';
        for (const token of filePath.split('/')) {
            relative += token + '/';
            const count = this._filePathPrefixesToBindingCount.get(relative) || 0;
            this._filePathPrefixesToBindingCount.set(relative, count + 1);
        }
    }
    _removeFilePathBindingPrefixes(filePath) {
        let relative = '';
        for (const token of filePath.split('/')) {
            relative += token + '/';
            const count = this._filePathPrefixesToBindingCount.get(relative);
            if (count === 1) {
                this._filePathPrefixesToBindingCount.delete(relative);
            }
            else if (count !== undefined) {
                this._filePathPrefixesToBindingCount.set(relative, count - 1);
            }
        }
    }
    filePathHasBindings(filePath) {
        if (!filePath.endsWith('/')) {
            filePath += '/';
        }
        return this._filePathPrefixesToBindingCount.has(filePath);
    }
}
const bindings = new WeakMap();
const statusBindings = new WeakMap();
const mutedCommits = new WeakSet();
const mutedWorkingCopies = new WeakSet();
export const NodePrefix = '(function (exports, require, module, __filename, __dirname) { ';
export const NodeSuffix = '\n});';
export const NodeShebang = '#!/usr/bin/env node';
export const Events = {
    BindingCreated: Symbol('BindingCreated'),
    BindingRemoved: Symbol('BindingRemoved'),
};
export class PathEncoder {
    _encoder;
    constructor() {
        this._encoder = new Common.CharacterIdMap.CharacterIdMap();
    }
    encode(path) {
        return path.split('/').map(token => this._encoder.toChar(token)).join('');
    }
    decode(path) {
        return path.split('').map(token => this._encoder.fromChar(token)).join('/');
    }
}
export class PersistenceBinding {
    network;
    fileSystem;
    constructor(network, fileSystem) {
        this.network = network;
        this.fileSystem = fileSystem;
    }
}
//# sourceMappingURL=PersistenceImpl.js.map