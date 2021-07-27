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
import { NetworkProject } from './NetworkProject.js';
import { metadataForURL } from './ResourceUtils.js';
const uiSourceCodeToStyleMap = new WeakMap();
export class StylesSourceMapping {
    _cssModel;
    _project;
    _styleFiles;
    _eventListeners;
    constructor(cssModel, workspace) {
        this._cssModel = cssModel;
        const target = this._cssModel.target();
        this._project = new ContentProviderBasedProject(workspace, 'css:' + target.id(), Workspace.Workspace.projectTypes.Network, '', false /* isServiceProject */);
        NetworkProject.setTargetForProject(this._project, target);
        this._styleFiles = new Map();
        this._eventListeners = [
            this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded, this._styleSheetAdded, this),
            this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetRemoved, this._styleSheetRemoved, this),
            this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetChanged, this._styleSheetChanged, this),
        ];
    }
    rawLocationToUILocation(rawLocation) {
        const header = rawLocation.header();
        if (!header || !this._acceptsHeader(header)) {
            return null;
        }
        const styleFile = this._styleFiles.get(header.resourceURL());
        if (!styleFile) {
            return null;
        }
        let lineNumber = rawLocation.lineNumber;
        let columnNumber = rawLocation.columnNumber;
        if (header.isInline && header.hasSourceURL) {
            lineNumber -= header.lineNumberInSource(0);
            const headerColumnNumber = header.columnNumberInSource(lineNumber, 0);
            if (typeof headerColumnNumber === 'undefined') {
                columnNumber = headerColumnNumber;
            }
            else {
                columnNumber -= headerColumnNumber;
            }
        }
        return styleFile._uiSourceCode.uiLocation(lineNumber, columnNumber);
    }
    uiLocationToRawLocations(uiLocation) {
        const styleFile = uiSourceCodeToStyleMap.get(uiLocation.uiSourceCode);
        if (!styleFile) {
            return [];
        }
        const rawLocations = [];
        for (const header of styleFile._headers) {
            let lineNumber = uiLocation.lineNumber;
            let columnNumber = uiLocation.columnNumber;
            if (header.isInline && header.hasSourceURL) {
                // TODO(crbug.com/1153123): Revisit the `columnNumber || 0` and also preserve `undefined` for source maps?
                columnNumber = header.columnNumberInSource(lineNumber, uiLocation.columnNumber || 0);
                lineNumber = header.lineNumberInSource(lineNumber);
            }
            rawLocations.push(new SDK.CSSModel.CSSLocation(header, lineNumber, columnNumber));
        }
        return rawLocations;
    }
    _acceptsHeader(header) {
        if (header.isConstructed) {
            return false;
        }
        if (header.isInline && !header.hasSourceURL && header.origin !== 'inspector') {
            return false;
        }
        if (!header.resourceURL()) {
            return false;
        }
        return true;
    }
    _styleSheetAdded(event) {
        const header = event.data;
        if (!this._acceptsHeader(header)) {
            return;
        }
        const url = header.resourceURL();
        let styleFile = this._styleFiles.get(url);
        if (!styleFile) {
            styleFile = new StyleFile(this._cssModel, this._project, header);
            this._styleFiles.set(url, styleFile);
        }
        else {
            styleFile.addHeader(header);
        }
    }
    _styleSheetRemoved(event) {
        const header = event.data;
        if (!this._acceptsHeader(header)) {
            return;
        }
        const url = header.resourceURL();
        const styleFile = this._styleFiles.get(url);
        if (styleFile) {
            if (styleFile._headers.size === 1) {
                styleFile.dispose();
                this._styleFiles.delete(url);
            }
            else {
                styleFile.removeHeader(header);
            }
        }
    }
    _styleSheetChanged(event) {
        const header = this._cssModel.styleSheetHeaderForId(event.data.styleSheetId);
        if (!header || !this._acceptsHeader(header)) {
            return;
        }
        const styleFile = this._styleFiles.get(header.resourceURL());
        if (styleFile) {
            styleFile._styleSheetChanged(header);
        }
    }
    dispose() {
        for (const styleFile of this._styleFiles.values()) {
            styleFile.dispose();
        }
        this._styleFiles.clear();
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
        this._project.removeProject();
    }
}
export class StyleFile {
    _cssModel;
    _project;
    _headers;
    _uiSourceCode;
    _eventListeners;
    _throttler;
    _terminated;
    _isAddingRevision;
    _isUpdatingHeaders;
    constructor(cssModel, project, header) {
        this._cssModel = cssModel;
        this._project = project;
        this._headers = new Set([header]);
        const target = cssModel.target();
        const url = header.resourceURL();
        const metadata = metadataForURL(target, header.frameId, url);
        this._uiSourceCode = this._project.createUISourceCode(url, header.contentType());
        uiSourceCodeToStyleMap.set(this._uiSourceCode, this);
        NetworkProject.setInitialFrameAttribution(this._uiSourceCode, header.frameId);
        this._project.addUISourceCodeWithProvider(this._uiSourceCode, this, metadata, 'text/css');
        this._eventListeners = [
            this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._workingCopyChanged, this),
            this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._workingCopyCommitted, this),
        ];
        this._throttler = new Common.Throttler.Throttler(StyleFile.updateTimeout);
        this._terminated = false;
    }
    addHeader(header) {
        this._headers.add(header);
        NetworkProject.addFrameAttribution(this._uiSourceCode, header.frameId);
    }
    removeHeader(header) {
        this._headers.delete(header);
        NetworkProject.removeFrameAttribution(this._uiSourceCode, header.frameId);
    }
    _styleSheetChanged(header) {
        console.assert(this._headers.has(header));
        if (this._isUpdatingHeaders || !this._headers.has(header)) {
            return;
        }
        const mirrorContentBound = this._mirrorContent.bind(this, header, true /* majorChange */);
        this._throttler.schedule(mirrorContentBound, false /* asSoonAsPossible */);
    }
    _workingCopyCommitted(_event) {
        if (this._isAddingRevision) {
            return;
        }
        const mirrorContentBound = this._mirrorContent.bind(this, this._uiSourceCode, true /* majorChange */);
        this._throttler.schedule(mirrorContentBound, true /* asSoonAsPossible */);
    }
    _workingCopyChanged(_event) {
        if (this._isAddingRevision) {
            return;
        }
        const mirrorContentBound = this._mirrorContent.bind(this, this._uiSourceCode, false /* majorChange */);
        this._throttler.schedule(mirrorContentBound, false /* asSoonAsPossible */);
    }
    async _mirrorContent(fromProvider, majorChange) {
        if (this._terminated) {
            this._styleFileSyncedForTest();
            return;
        }
        let newContent = null;
        if (fromProvider === this._uiSourceCode) {
            newContent = this._uiSourceCode.workingCopy();
        }
        else {
            const deferredContent = await fromProvider.requestContent();
            newContent = deferredContent.content;
        }
        if (newContent === null || this._terminated) {
            this._styleFileSyncedForTest();
            return;
        }
        if (fromProvider !== this._uiSourceCode) {
            this._isAddingRevision = true;
            this._uiSourceCode.addRevision(newContent);
            this._isAddingRevision = false;
        }
        this._isUpdatingHeaders = true;
        const promises = [];
        for (const header of this._headers) {
            if (header === fromProvider) {
                continue;
            }
            promises.push(this._cssModel.setStyleSheetText(header.id, newContent, majorChange));
        }
        // ------ ASYNC ------
        await Promise.all(promises);
        this._isUpdatingHeaders = false;
        this._styleFileSyncedForTest();
    }
    _styleFileSyncedForTest() {
    }
    dispose() {
        if (this._terminated) {
            return;
        }
        this._terminated = true;
        this._project.removeFile(this._uiSourceCode.url());
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
    }
    contentURL() {
        console.assert(this._headers.size > 0);
        return this._headers.values().next().value.originalContentProvider().contentURL();
    }
    contentType() {
        console.assert(this._headers.size > 0);
        return this._headers.values().next().value.originalContentProvider().contentType();
    }
    contentEncoded() {
        console.assert(this._headers.size > 0);
        return this._headers.values().next().value.originalContentProvider().contentEncoded();
    }
    requestContent() {
        console.assert(this._headers.size > 0);
        return this._headers.values().next().value.originalContentProvider().requestContent();
    }
    searchInContent(query, caseSensitive, isRegex) {
        console.assert(this._headers.size > 0);
        return this._headers.values().next().value.originalContentProvider().searchInContent(query, caseSensitive, isRegex);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static updateTimeout = 200;
}
//# sourceMappingURL=StylesSourceMapping.js.map