/*
 * Copyright (C) 2014 Google Inc. All rights reserved.
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
import * as Common from '../../core/common/common.js'; // eslint-disable-line no-unused-vars
import * as Workspace from '../../models/workspace/workspace.js'; // eslint-disable-line no-unused-vars
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
export class EditingLocationHistoryManager {
    _sourcesView;
    _historyManager;
    _currentSourceFrameCallback;
    constructor(sourcesView, currentSourceFrameCallback) {
        this._sourcesView = sourcesView;
        this._historyManager = new Common.SimpleHistoryManager.SimpleHistoryManager(HistoryDepth);
        this._currentSourceFrameCallback = currentSourceFrameCallback;
    }
    trackSourceFrameCursorJumps(sourceFrame) {
        sourceFrame.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.JumpHappened, this._onJumpHappened.bind(this));
    }
    _onJumpHappened(event) {
        if (event.data.from) {
            this._updateActiveState(event.data.from);
        }
        if (event.data.to) {
            this._pushActiveState(event.data.to);
        }
    }
    rollback() {
        this._historyManager.rollback();
    }
    rollover() {
        this._historyManager.rollover();
    }
    updateCurrentState() {
        const sourceFrame = this._currentSourceFrameCallback();
        if (!sourceFrame) {
            return;
        }
        this._updateActiveState(sourceFrame.textEditor.selection());
    }
    pushNewState() {
        const sourceFrame = this._currentSourceFrameCallback();
        if (!sourceFrame) {
            return;
        }
        this._pushActiveState(sourceFrame.textEditor.selection());
    }
    _updateActiveState(selection) {
        const active = this._historyManager.active();
        if (!active) {
            return;
        }
        const sourceFrame = this._currentSourceFrameCallback();
        if (!sourceFrame) {
            return;
        }
        const entry = new EditingLocationHistoryEntry(this._sourcesView, this, sourceFrame, selection);
        active.merge(entry);
    }
    _pushActiveState(selection) {
        const sourceFrame = this._currentSourceFrameCallback();
        if (!sourceFrame) {
            return;
        }
        const entry = new EditingLocationHistoryEntry(this._sourcesView, this, sourceFrame, selection);
        this._historyManager.push(entry);
    }
    removeHistoryForSourceCode(uiSourceCode) {
        this._historyManager.filterOut(entry => {
            const historyEntry = entry;
            return historyEntry._projectId === uiSourceCode.project().id() && historyEntry._url === uiSourceCode.url();
        });
    }
}
export const HistoryDepth = 20;
export class EditingLocationHistoryEntry {
    _sourcesView;
    _editingLocationManager;
    _projectId;
    _url;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _positionHandle;
    constructor(sourcesView, editingLocationManager, sourceFrame, selection) {
        this._sourcesView = sourcesView;
        this._editingLocationManager = editingLocationManager;
        const uiSourceCode = sourceFrame.uiSourceCode();
        this._projectId = uiSourceCode.project().id();
        this._url = uiSourceCode.url();
        const position = this._positionFromSelection(selection);
        this._positionHandle = sourceFrame.textEditor.textEditorPositionHandle(position.lineNumber, position.columnNumber);
    }
    merge(entry) {
        if (this._projectId !== entry._projectId || this._url !== entry._url) {
            return;
        }
        this._positionHandle = entry._positionHandle;
    }
    _positionFromSelection(selection) {
        return { lineNumber: selection.endLine, columnNumber: selection.endColumn };
    }
    valid() {
        const position = this._positionHandle.resolve();
        const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCode(this._projectId, this._url);
        return Boolean(position && uiSourceCode);
    }
    reveal() {
        const position = this._positionHandle.resolve();
        const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCode(this._projectId, this._url);
        if (!position || !uiSourceCode) {
            return;
        }
        this._editingLocationManager.updateCurrentState();
        this._sourcesView.showSourceLocation(uiSourceCode, position.lineNumber, position.columnNumber);
    }
}
//# sourceMappingURL=EditingLocationHistoryManager.js.map