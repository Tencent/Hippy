// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as Diff from '../../third_party/diff/diff.js';
import * as Persistence from '../persistence/persistence.js';
import * as Workspace from '../workspace/workspace.js';
export class WorkspaceDiffImpl extends Common.ObjectWrapper.ObjectWrapper {
    _uiSourceCodeDiffs;
    _loadingUISourceCodes;
    _modifiedUISourceCodes;
    constructor(workspace) {
        super();
        this._uiSourceCodeDiffs = new WeakMap();
        this._loadingUISourceCodes = new Map();
        this._modifiedUISourceCodes = new Set();
        workspace.addEventListener(Workspace.Workspace.Events.WorkingCopyChanged, this._uiSourceCodeChanged, this);
        workspace.addEventListener(Workspace.Workspace.Events.WorkingCopyCommitted, this._uiSourceCodeChanged, this);
        workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, this._uiSourceCodeAdded, this);
        workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeRemoved, this._uiSourceCodeRemoved, this);
        workspace.addEventListener(Workspace.Workspace.Events.ProjectRemoved, this._projectRemoved, this);
        workspace.uiSourceCodes().forEach(this._updateModifiedState.bind(this));
    }
    requestDiff(uiSourceCode) {
        return this._uiSourceCodeDiff(uiSourceCode).requestDiff();
    }
    subscribeToDiffChange(uiSourceCode, callback, thisObj) {
        this._uiSourceCodeDiff(uiSourceCode).addEventListener(Events.DiffChanged, callback, thisObj);
    }
    unsubscribeFromDiffChange(uiSourceCode, callback, thisObj) {
        this._uiSourceCodeDiff(uiSourceCode).removeEventListener(Events.DiffChanged, callback, thisObj);
    }
    modifiedUISourceCodes() {
        return Array.from(this._modifiedUISourceCodes);
    }
    isUISourceCodeModified(uiSourceCode) {
        return this._modifiedUISourceCodes.has(uiSourceCode) || this._loadingUISourceCodes.has(uiSourceCode);
    }
    _uiSourceCodeDiff(uiSourceCode) {
        let diff = this._uiSourceCodeDiffs.get(uiSourceCode);
        if (!diff) {
            diff = new UISourceCodeDiff(uiSourceCode);
            this._uiSourceCodeDiffs.set(uiSourceCode, diff);
        }
        return diff;
    }
    _uiSourceCodeChanged(event) {
        const uiSourceCode = event.data.uiSourceCode;
        this._updateModifiedState(uiSourceCode);
    }
    _uiSourceCodeAdded(event) {
        const uiSourceCode = event.data;
        this._updateModifiedState(uiSourceCode);
    }
    _uiSourceCodeRemoved(event) {
        const uiSourceCode = event.data;
        this._removeUISourceCode(uiSourceCode);
    }
    _projectRemoved(event) {
        const project = event.data;
        for (const uiSourceCode of project.uiSourceCodes()) {
            this._removeUISourceCode(uiSourceCode);
        }
    }
    _removeUISourceCode(uiSourceCode) {
        this._loadingUISourceCodes.delete(uiSourceCode);
        const uiSourceCodeDiff = this._uiSourceCodeDiffs.get(uiSourceCode);
        if (uiSourceCodeDiff) {
            uiSourceCodeDiff._dispose = true;
        }
        this._markAsUnmodified(uiSourceCode);
    }
    _markAsUnmodified(uiSourceCode) {
        this._uiSourceCodeProcessedForTest();
        if (this._modifiedUISourceCodes.delete(uiSourceCode)) {
            this.dispatchEventToListeners(Events.ModifiedStatusChanged, { uiSourceCode, isModified: false });
        }
    }
    _markAsModified(uiSourceCode) {
        this._uiSourceCodeProcessedForTest();
        if (this._modifiedUISourceCodes.has(uiSourceCode)) {
            return;
        }
        this._modifiedUISourceCodes.add(uiSourceCode);
        this.dispatchEventToListeners(Events.ModifiedStatusChanged, { uiSourceCode, isModified: true });
    }
    _uiSourceCodeProcessedForTest() {
    }
    async _updateModifiedState(uiSourceCode) {
        this._loadingUISourceCodes.delete(uiSourceCode);
        if (uiSourceCode.project().type() !== Workspace.Workspace.projectTypes.Network) {
            this._markAsUnmodified(uiSourceCode);
            return;
        }
        if (uiSourceCode.isDirty()) {
            this._markAsModified(uiSourceCode);
            return;
        }
        if (!uiSourceCode.hasCommits()) {
            this._markAsUnmodified(uiSourceCode);
            return;
        }
        const contentsPromise = Promise.all([
            this.requestOriginalContentForUISourceCode(uiSourceCode),
            uiSourceCode.requestContent().then(deferredContent => deferredContent.content),
        ]);
        this._loadingUISourceCodes.set(uiSourceCode, contentsPromise);
        const contents = await contentsPromise;
        if (this._loadingUISourceCodes.get(uiSourceCode) !== contentsPromise) {
            return;
        }
        this._loadingUISourceCodes.delete(uiSourceCode);
        if (contents[0] !== null && contents[1] !== null && contents[0] !== contents[1]) {
            this._markAsModified(uiSourceCode);
        }
        else {
            this._markAsUnmodified(uiSourceCode);
        }
    }
    requestOriginalContentForUISourceCode(uiSourceCode) {
        return this._uiSourceCodeDiff(uiSourceCode)._originalContent();
    }
    revertToOriginal(uiSourceCode) {
        function callback(content) {
            if (typeof content !== 'string') {
                return;
            }
            uiSourceCode.addRevision(content);
        }
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.RevisionApplied);
        return this.requestOriginalContentForUISourceCode(uiSourceCode).then(callback);
    }
}
export class UISourceCodeDiff extends Common.ObjectWrapper.ObjectWrapper {
    _uiSourceCode;
    _requestDiffPromise;
    _pendingChanges;
    _dispose;
    constructor(uiSourceCode) {
        super();
        this._uiSourceCode = uiSourceCode;
        uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._uiSourceCodeChanged, this);
        uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._uiSourceCodeChanged, this);
        this._requestDiffPromise = null;
        this._pendingChanges = null;
        this._dispose = false;
    }
    _uiSourceCodeChanged() {
        if (this._pendingChanges) {
            clearTimeout(this._pendingChanges);
            this._pendingChanges = null;
        }
        this._requestDiffPromise = null;
        const content = this._uiSourceCode.content();
        const delay = (!content || content.length < 65536) ? 0 : UpdateTimeout;
        this._pendingChanges = setTimeout(emitDiffChanged.bind(this), delay);
        function emitDiffChanged() {
            if (this._dispose) {
                return;
            }
            this.dispatchEventToListeners(Events.DiffChanged);
            this._pendingChanges = null;
        }
    }
    requestDiff() {
        if (!this._requestDiffPromise) {
            this._requestDiffPromise = this._innerRequestDiff();
        }
        return this._requestDiffPromise;
    }
    async _originalContent() {
        const originalNetworkContent = Persistence.NetworkPersistenceManager.NetworkPersistenceManager.instance().originalContentForUISourceCode(this._uiSourceCode);
        if (originalNetworkContent) {
            return originalNetworkContent;
        }
        const content = await this._uiSourceCode.project().requestFileContent(this._uiSourceCode);
        return content.content || ('error' in content && content.error) || '';
    }
    async _innerRequestDiff() {
        if (this._dispose) {
            return null;
        }
        const baseline = await this._originalContent();
        if (baseline === null) {
            return null;
        }
        if (baseline.length > 1024 * 1024) {
            return null;
        }
        // ------------ ASYNC ------------
        if (this._dispose) {
            return null;
        }
        let current = this._uiSourceCode.workingCopy();
        if (!current && !this._uiSourceCode.contentLoaded()) {
            current = (await this._uiSourceCode.requestContent()).content;
        }
        if (current.length > 1024 * 1024) {
            return null;
        }
        if (this._dispose) {
            return null;
        }
        if (current === null || baseline === null) {
            return null;
        }
        return Diff.Diff.DiffWrapper.lineDiff(baseline.split(/\r\n|\n|\r/), current.split(/\r\n|\n|\r/));
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["DiffChanged"] = "DiffChanged";
    Events["ModifiedStatusChanged"] = "ModifiedStatusChanged";
})(Events || (Events = {}));
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _instance = null;
export function workspaceDiff() {
    if (!_instance) {
        _instance = new WorkspaceDiffImpl(Workspace.Workspace.WorkspaceImpl.instance());
    }
    return _instance;
}
export class DiffUILocation {
    uiSourceCode;
    constructor(uiSourceCode) {
        this.uiSourceCode = uiSourceCode;
    }
}
export const UpdateTimeout = 200;
//# sourceMappingURL=WorkspaceDiff.js.map