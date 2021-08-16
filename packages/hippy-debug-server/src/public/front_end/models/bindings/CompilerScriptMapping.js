/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import { IgnoreListManager } from './IgnoreListManager.js';
import { NetworkProject } from './NetworkProject.js';
export class CompilerScriptMapping {
    _debuggerModel;
    _sourceMapManager;
    _workspace;
    _debuggerWorkspaceBinding;
    _regularProject;
    _contentScriptsProject;
    _regularBindings;
    _contentScriptsBindings;
    _stubUISourceCodes;
    _stubProject;
    _eventListeners;
    constructor(debuggerModel, workspace, debuggerWorkspaceBinding) {
        this._debuggerModel = debuggerModel;
        this._sourceMapManager = this._debuggerModel.sourceMapManager();
        this._workspace = workspace;
        this._debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        const target = debuggerModel.target();
        this._regularProject = new ContentProviderBasedProject(workspace, 'jsSourceMaps::' + target.id(), Workspace.Workspace.projectTypes.Network, '', false /* isServiceProject */);
        this._contentScriptsProject = new ContentProviderBasedProject(workspace, 'jsSourceMaps:extensions:' + target.id(), Workspace.Workspace.projectTypes.ContentScripts, '', false /* isServiceProject */);
        NetworkProject.setTargetForProject(this._regularProject, target);
        NetworkProject.setTargetForProject(this._contentScriptsProject, target);
        this._regularBindings = new Map();
        this._contentScriptsBindings = new Map();
        this._stubUISourceCodes = new Map();
        this._stubProject = new ContentProviderBasedProject(workspace, 'jsSourceMaps:stub:' + target.id(), Workspace.Workspace.projectTypes.Service, '', true /* isServiceProject */);
        this._eventListeners = [
            this._sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapWillAttach, event => {
                this._sourceMapWillAttach(event);
            }, this),
            this._sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapFailedToAttach, event => {
                this._sourceMapFailedToAttach(event);
            }, this),
            this._sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapAttached, event => {
                this._sourceMapAttached(event);
            }, this),
            this._sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapDetached, event => {
                this._sourceMapDetached(event);
            }, this),
            this._workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, event => {
                this.onUiSourceCodeAdded(event);
            }, this),
        ];
    }
    onUiSourceCodeAdded(event) {
        const uiSourceCode = event.data;
        if (uiSourceCode.contentType().isDocument()) {
            for (const script of this._debuggerModel.scriptsForSourceURL(uiSourceCode.url())) {
                this._debuggerWorkspaceBinding.updateLocations(script);
            }
        }
    }
    _addStubUISourceCode(script) {
        const stubUISourceCode = this._stubProject.addContentProvider(script.sourceURL + ':sourcemap', TextUtils.StaticContentProvider.StaticContentProvider.fromString(script.sourceURL, Common.ResourceType.resourceTypes.Script, '\n\n\n\n\n// Please wait a bit.\n// Compiled script is not shown while source map is being loaded!'), 'text/javascript');
        this._stubUISourceCodes.set(script, stubUISourceCode);
    }
    async _removeStubUISourceCode(script) {
        const uiSourceCode = this._stubUISourceCodes.get(script);
        this._stubUISourceCodes.delete(script);
        if (uiSourceCode) {
            this._stubProject.removeFile(uiSourceCode.url());
        }
        await this._debuggerWorkspaceBinding.updateLocations(script);
    }
    static uiSourceCodeOrigin(uiSourceCode) {
        const binding = uiSourceCodeToBinding.get(uiSourceCode);
        if (binding) {
            return binding._referringSourceMaps.map((sourceMap) => sourceMap.compiledURL());
        }
        return [];
    }
    mapsToSourceCode(rawLocation) {
        const script = rawLocation.script();
        const sourceMap = script ? this._sourceMapManager.sourceMapForClient(script) : null;
        if (!sourceMap) {
            return true;
        }
        const entry = sourceMap.findEntry(rawLocation.lineNumber, rawLocation.columnNumber);
        return entry !== null && entry.lineNumber === rawLocation.lineNumber &&
            entry.columnNumber === rawLocation.columnNumber;
    }
    uiSourceCodeForURL(url, isContentScript) {
        return isContentScript ? this._contentScriptsProject.uiSourceCodeForURL(url) :
            this._regularProject.uiSourceCodeForURL(url);
    }
    rawLocationToUILocation(rawLocation) {
        const script = rawLocation.script();
        if (!script) {
            return null;
        }
        const lineNumber = rawLocation.lineNumber - script.lineOffset;
        let columnNumber = rawLocation.columnNumber;
        if (!lineNumber) {
            columnNumber -= script.columnOffset;
        }
        const stubUISourceCode = this._stubUISourceCodes.get(script);
        if (stubUISourceCode) {
            return new Workspace.UISourceCode.UILocation(stubUISourceCode, lineNumber, columnNumber);
        }
        const sourceMap = this._sourceMapManager.sourceMapForClient(script);
        if (!sourceMap) {
            return null;
        }
        const entry = sourceMap.findEntry(lineNumber, columnNumber);
        if (!entry || !entry.sourceURL) {
            return null;
        }
        const uiSourceCode = script.isContentScript() ? this._contentScriptsProject.uiSourceCodeForURL(entry.sourceURL) :
            this._regularProject.uiSourceCodeForURL(entry.sourceURL);
        if (!uiSourceCode) {
            return null;
        }
        return uiSourceCode.uiLocation(entry.sourceLineNumber, entry.sourceColumnNumber);
    }
    uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber) {
        const binding = uiSourceCodeToBinding.get(uiSourceCode);
        if (!binding) {
            return [];
        }
        const locations = [];
        for (const sourceMap of binding._referringSourceMaps) {
            const entry = sourceMap.sourceLineMapping(uiSourceCode.url(), lineNumber, columnNumber);
            if (!entry) {
                continue;
            }
            for (const script of this._sourceMapManager.clientsForSourceMap(sourceMap)) {
                locations.push(this._debuggerModel.createRawLocation(script, entry.lineNumber + script.lineOffset, !entry.lineNumber ? entry.columnNumber + script.columnOffset : entry.columnNumber));
            }
        }
        return locations;
    }
    async _sourceMapWillAttach(event) {
        const script = event.data;
        // Create stub UISourceCode for the time source mapping is being loaded.
        this._addStubUISourceCode(script);
        await this._debuggerWorkspaceBinding.updateLocations(script);
    }
    async _sourceMapFailedToAttach(event) {
        const script = event.data;
        await this._removeStubUISourceCode(script);
    }
    async _sourceMapAttached(event) {
        const script = event.data.client;
        const sourceMap = event.data.sourceMap;
        await this._removeStubUISourceCode(script);
        if (IgnoreListManager.instance().isIgnoreListedURL(script.sourceURL, script.isContentScript())) {
            this._sourceMapAttachedForTest(sourceMap);
            return;
        }
        await this._populateSourceMapSources(script, sourceMap);
        this._sourceMapAttachedForTest(sourceMap);
    }
    async _sourceMapDetached(event) {
        const script = event.data.client;
        const sourceMap = event.data.sourceMap;
        const bindings = script.isContentScript() ? this._contentScriptsBindings : this._regularBindings;
        for (const sourceURL of sourceMap.sourceURLs()) {
            const binding = bindings.get(sourceURL);
            if (binding) {
                binding.removeSourceMap(sourceMap, script.frameId);
                if (!binding._uiSourceCode) {
                    bindings.delete(sourceURL);
                }
            }
        }
        await this._debuggerWorkspaceBinding.updateLocations(script);
    }
    sourceMapForScript(script) {
        return this._sourceMapManager.sourceMapForClient(script);
    }
    scriptsForUISourceCode(uiSourceCode) {
        const binding = uiSourceCodeToBinding.get(uiSourceCode);
        if (!binding) {
            return [];
        }
        const scripts = [];
        for (const sourceMap of binding._referringSourceMaps) {
            this._sourceMapManager.clientsForSourceMap(sourceMap).forEach(script => scripts.push(script));
        }
        return scripts;
    }
    _sourceMapAttachedForTest(_sourceMap) {
    }
    async _populateSourceMapSources(script, sourceMap) {
        const project = script.isContentScript() ? this._contentScriptsProject : this._regularProject;
        const bindings = script.isContentScript() ? this._contentScriptsBindings : this._regularBindings;
        for (const sourceURL of sourceMap.sourceURLs()) {
            let binding = bindings.get(sourceURL);
            if (!binding) {
                binding = new Binding(project, sourceURL);
                bindings.set(sourceURL, binding);
            }
            binding.addSourceMap(sourceMap, script.frameId);
        }
        await this._debuggerWorkspaceBinding.updateLocations(script);
    }
    static uiLineHasMapping(uiSourceCode, lineNumber) {
        const binding = uiSourceCodeToBinding.get(uiSourceCode);
        if (!binding) {
            return true;
        }
        for (const sourceMap of binding._referringSourceMaps) {
            if (sourceMap.sourceLineMapping(uiSourceCode.url(), lineNumber, 0)) {
                return true;
            }
        }
        return false;
    }
    dispose() {
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
        this._regularProject.dispose();
        this._contentScriptsProject.dispose();
        this._stubProject.dispose();
    }
}
const uiSourceCodeToBinding = new WeakMap();
class Binding {
    _project;
    _url;
    _referringSourceMaps;
    _activeSourceMap;
    _uiSourceCode;
    constructor(project, url) {
        this._project = project;
        this._url = url;
        this._referringSourceMaps = [];
        this._uiSourceCode = null;
    }
    _recreateUISourceCodeIfNeeded(frameId) {
        const sourceMap = this._referringSourceMaps[this._referringSourceMaps.length - 1];
        const newUISourceCode = this._project.createUISourceCode(this._url, Common.ResourceType.resourceTypes.SourceMapScript);
        uiSourceCodeToBinding.set(newUISourceCode, this);
        const contentProvider = sourceMap.sourceContentProvider(this._url, Common.ResourceType.resourceTypes.SourceMapScript);
        const mimeType = Common.ResourceType.ResourceType.mimeFromURL(this._url) || 'text/javascript';
        const embeddedContent = sourceMap.embeddedContentByURL(this._url);
        const metadata = typeof embeddedContent === 'string' ?
            new Workspace.UISourceCode.UISourceCodeMetadata(null, embeddedContent.length) :
            null;
        if (this._uiSourceCode) {
            NetworkProject.cloneInitialFrameAttribution(this._uiSourceCode, newUISourceCode);
            this._project.removeFile(this._uiSourceCode.url());
        }
        else {
            NetworkProject.setInitialFrameAttribution(newUISourceCode, frameId);
        }
        this._uiSourceCode = newUISourceCode;
        this._project.addUISourceCodeWithProvider(this._uiSourceCode, contentProvider, metadata, mimeType);
    }
    addSourceMap(sourceMap, frameId) {
        if (this._uiSourceCode) {
            NetworkProject.addFrameAttribution(this._uiSourceCode, frameId);
        }
        this._referringSourceMaps.push(sourceMap);
        this._recreateUISourceCodeIfNeeded(frameId);
    }
    removeSourceMap(sourceMap, frameId) {
        const uiSourceCode = this._uiSourceCode;
        NetworkProject.removeFrameAttribution(uiSourceCode, frameId);
        const lastIndex = this._referringSourceMaps.lastIndexOf(sourceMap);
        if (lastIndex !== -1) {
            this._referringSourceMaps.splice(lastIndex, 1);
        }
        if (!this._referringSourceMaps.length) {
            this._project.removeFile(uiSourceCode.url());
            this._uiSourceCode = null;
        }
        else {
            this._recreateUISourceCodeIfNeeded(frameId);
        }
    }
}
//# sourceMappingURL=CompilerScriptMapping.js.map