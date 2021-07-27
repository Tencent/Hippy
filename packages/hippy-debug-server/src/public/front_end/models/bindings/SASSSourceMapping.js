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
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import { CSSWorkspaceBinding } from './CSSWorkspaceBinding.js'; // eslint-disable-line no-unused-vars
import { NetworkProject } from './NetworkProject.js';
export class SASSSourceMapping {
    _sourceMapManager;
    _project;
    _eventListeners;
    _bindings;
    constructor(target, sourceMapManager, workspace) {
        this._sourceMapManager = sourceMapManager;
        this._project = new ContentProviderBasedProject(workspace, 'cssSourceMaps:' + target.id(), Workspace.Workspace.projectTypes.Network, '', false /* isServiceProject */);
        NetworkProject.setTargetForProject(this._project, target);
        this._bindings = new Map();
        this._eventListeners = [
            this._sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapAttached, event => {
                this._sourceMapAttached(event);
            }, this),
            this._sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapDetached, event => {
                this._sourceMapDetached(event);
            }, this),
        ];
    }
    _sourceMapAttachedForTest(_sourceMap) {
    }
    async _sourceMapAttached(event) {
        const header = event.data.client;
        const sourceMap = event.data.sourceMap;
        const project = this._project;
        const bindings = this._bindings;
        for (const sourceURL of sourceMap.sourceURLs()) {
            let binding = bindings.get(sourceURL);
            if (!binding) {
                binding = new Binding(project, sourceURL);
                bindings.set(sourceURL, binding);
            }
            binding.addSourceMap(sourceMap, header.frameId);
        }
        await CSSWorkspaceBinding.instance().updateLocations(header);
        this._sourceMapAttachedForTest(sourceMap);
    }
    async _sourceMapDetached(event) {
        const header = event.data.client;
        const sourceMap = event.data.sourceMap;
        const bindings = this._bindings;
        for (const sourceURL of sourceMap.sourceURLs()) {
            const binding = bindings.get(sourceURL);
            if (binding) {
                binding.removeSourceMap(sourceMap, header.frameId);
                if (!binding._uiSourceCode) {
                    bindings.delete(sourceURL);
                }
            }
        }
        await CSSWorkspaceBinding.instance().updateLocations(header);
    }
    rawLocationToUILocation(rawLocation) {
        const header = rawLocation.header();
        if (!header) {
            return null;
        }
        const sourceMap = this._sourceMapManager.sourceMapForClient(header);
        if (!sourceMap) {
            return null;
        }
        let { lineNumber, columnNumber } = rawLocation;
        // If the source map maps the origin (line:0, column:0) but the CSS header is inline (in a HTML doc),
        // then adjust the line and column numbers.
        if (sourceMap.mapsOrigin() && header.isInline) {
            lineNumber -= header.startLine;
            if (lineNumber === 0) {
                columnNumber -= header.startColumn;
            }
        }
        const entry = sourceMap.findEntry(lineNumber, columnNumber);
        if (!entry || !entry.sourceURL) {
            return null;
        }
        const uiSourceCode = this._project.uiSourceCodeForURL(entry.sourceURL);
        if (!uiSourceCode) {
            return null;
        }
        return uiSourceCode.uiLocation(entry.sourceLineNumber, entry.sourceColumnNumber);
    }
    uiLocationToRawLocations(uiLocation) {
        // TODO(crbug.com/1153123): Revisit the `columnNumber || 0` and also preserve `undefined` for source maps?
        const { uiSourceCode, lineNumber, columnNumber = 0 } = uiLocation;
        const binding = uiSourceCodeToBinding.get(uiSourceCode);
        if (!binding) {
            return [];
        }
        const locations = [];
        for (const sourceMap of binding._referringSourceMaps) {
            const entries = sourceMap.findReverseEntries(uiSourceCode.url(), lineNumber, columnNumber);
            for (const header of this._sourceMapManager.clientsForSourceMap(sourceMap)) {
                locations.push(...entries.map(entry => new SDK.CSSModel.CSSLocation(header, entry.lineNumber, entry.columnNumber)));
            }
        }
        return locations;
    }
    dispose() {
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
        this._project.dispose();
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
        const contentProvider = sourceMap.sourceContentProvider(this._url, Common.ResourceType.resourceTypes.SourceMapStyleSheet);
        const newUISourceCode = this._project.createUISourceCode(this._url, contentProvider.contentType());
        uiSourceCodeToBinding.set(newUISourceCode, this);
        const mimeType = Common.ResourceType.ResourceType.mimeFromURL(this._url) || contentProvider.contentType().canonicalMimeType();
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
//# sourceMappingURL=SASSSourceMapping.js.map