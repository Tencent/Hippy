// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as WorkspaceDiff from '../../models/workspace_diff/workspace_diff.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import { Plugin } from './Plugin.js';
const UIStrings = {
    /**
    *@description A context menu item in the Gutter Diff Plugin of the Sources panel
    */
    localModifications: 'Local Modifications...',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/GutterDiffPlugin.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class GutterDiffPlugin extends Plugin {
    _textEditor;
    _uiSourceCode;
    _decorations;
    _workspaceDiff;
    constructor(textEditor, uiSourceCode) {
        super();
        this._textEditor = textEditor;
        this._uiSourceCode = uiSourceCode;
        this._decorations = [];
        this._textEditor.installGutter(DiffGutterType, true);
        this._workspaceDiff = WorkspaceDiff.WorkspaceDiff.workspaceDiff();
        this._workspaceDiff.subscribeToDiffChange(this._uiSourceCode, this._update, this);
        this._update();
    }
    static accepts(uiSourceCode) {
        return uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Network;
    }
    _updateDecorations(removed, added) {
        this._textEditor.operation(operation);
        function operation() {
            for (const decoration of removed) {
                decoration.remove();
            }
            for (const decoration of added) {
                decoration.install();
            }
        }
    }
    _update() {
        if (this._uiSourceCode) {
            this._workspaceDiff.requestDiff(this._uiSourceCode).then(this._innerUpdate.bind(this));
        }
        else {
            this._innerUpdate(null);
        }
    }
    _innerUpdate(lineDiff) {
        if (!lineDiff) {
            this._updateDecorations(this._decorations, []);
            this._decorations = [];
            return;
        }
        const diff = SourceFrame.SourceCodeDiff.SourceCodeDiff.computeDiff(lineDiff);
        const newDecorations = new Map();
        for (let i = 0; i < diff.length; ++i) {
            const diffEntry = diff[i];
            for (let lineNumber = diffEntry.from; lineNumber < diffEntry.to; ++lineNumber) {
                newDecorations.set(lineNumber, { lineNumber: lineNumber, type: diffEntry.type });
            }
        }
        const decorationDiff = this._calculateDecorationsDiff(newDecorations);
        const addedDecorations = decorationDiff.added.map(entry => new GutterDecoration(this._textEditor, entry.lineNumber, entry.type));
        this._decorations = decorationDiff.equal.concat(addedDecorations);
        this._updateDecorations(decorationDiff.removed, addedDecorations);
        this._decorationsSetForTest(newDecorations);
    }
    _decorationsByLine() {
        const decorations = new Map();
        for (const decoration of this._decorations) {
            const lineNumber = decoration.lineNumber();
            if (lineNumber !== -1) {
                decorations.set(lineNumber, decoration);
            }
        }
        return decorations;
    }
    _calculateDecorationsDiff(decorations) {
        const oldDecorations = this._decorationsByLine();
        const leftKeys = [...oldDecorations.keys()];
        const rightKeys = [...decorations.keys()];
        leftKeys.sort((a, b) => a - b);
        rightKeys.sort((a, b) => a - b);
        const removed = [];
        const added = [];
        const equal = [];
        let leftIndex = 0;
        let rightIndex = 0;
        while (leftIndex < leftKeys.length && rightIndex < rightKeys.length) {
            const leftKey = leftKeys[leftIndex];
            const rightKey = rightKeys[rightIndex];
            const left = oldDecorations.get(leftKey);
            const right = decorations.get(rightKey);
            if (!left) {
                throw new Error(`No decoration with key ${leftKey}`);
            }
            if (!right) {
                throw new Error(`No decoration with key ${rightKey}`);
            }
            if (leftKey === rightKey && left.type === right.type) {
                equal.push(left);
                ++leftIndex;
                ++rightIndex;
            }
            else if (leftKey <= rightKey) {
                removed.push(left);
                ++leftIndex;
            }
            else {
                added.push(right);
                ++rightIndex;
            }
        }
        while (leftIndex < leftKeys.length) {
            const leftKey = leftKeys[leftIndex++];
            const left = oldDecorations.get(leftKey);
            if (!left) {
                throw new Error(`No decoration with key ${leftKey}`);
            }
            removed.push(left);
        }
        while (rightIndex < rightKeys.length) {
            const rightKey = rightKeys[rightIndex++];
            const right = decorations.get(rightKey);
            if (!right) {
                throw new Error(`No decoration with key ${rightKey}`);
            }
            added.push(right);
        }
        return { added: added, removed: removed, equal: equal };
    }
    _decorationsSetForTest(_decorations) {
    }
    async populateLineGutterContextMenu(contextMenu, _lineNumber) {
        GutterDiffPlugin._appendRevealDiffContextMenu(contextMenu, this._uiSourceCode);
    }
    async populateTextAreaContextMenu(contextMenu, _lineNumber, _columnNumber) {
        GutterDiffPlugin._appendRevealDiffContextMenu(contextMenu, this._uiSourceCode);
    }
    static _appendRevealDiffContextMenu(contextMenu, uiSourceCode) {
        if (!WorkspaceDiff.WorkspaceDiff.workspaceDiff().isUISourceCodeModified(uiSourceCode)) {
            return;
        }
        contextMenu.revealSection().appendItem(i18nString(UIStrings.localModifications), () => {
            Common.Revealer.reveal(new WorkspaceDiff.WorkspaceDiff.DiffUILocation(uiSourceCode));
        });
    }
    dispose() {
        for (const decoration of this._decorations) {
            decoration.remove();
        }
        WorkspaceDiff.WorkspaceDiff.workspaceDiff().unsubscribeFromDiffChange(this._uiSourceCode, this._update, this);
    }
}
export class GutterDecoration {
    _textEditor;
    _position;
    _className;
    type;
    constructor(textEditor, lineNumber, type) {
        this._textEditor = textEditor;
        this._position = this._textEditor.textEditorPositionHandle(lineNumber, 0);
        this._className = '';
        if (type === SourceFrame.SourceCodeDiff.EditType.Insert) {
            this._className = 'diff-entry-insert';
        }
        else if (type === SourceFrame.SourceCodeDiff.EditType.Delete) {
            this._className = 'diff-entry-delete';
        }
        else if (type === SourceFrame.SourceCodeDiff.EditType.Modify) {
            this._className = 'diff-entry-modify';
        }
        this.type = type;
    }
    lineNumber() {
        const location = this._position.resolve();
        if (!location) {
            return -1;
        }
        return location.lineNumber;
    }
    install() {
        const location = this._position.resolve();
        if (!location) {
            return;
        }
        const element = document.createElement('div');
        element.classList.add('diff-marker');
        element.textContent = '\xA0';
        this._textEditor.setGutterDecoration(location.lineNumber, DiffGutterType, element);
        this._textEditor.toggleLineClass(location.lineNumber, this._className, true);
    }
    remove() {
        const location = this._position.resolve();
        if (!location) {
            return;
        }
        this._textEditor.setGutterDecoration(location.lineNumber, DiffGutterType, null);
        this._textEditor.toggleLineClass(location.lineNumber, this._className, false);
    }
}
export const DiffGutterType = 'CodeMirror-gutter-diff';
let contextMenuProviderInstance;
export class ContextMenuProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!contextMenuProviderInstance || forceNew) {
            contextMenuProviderInstance = new ContextMenuProvider();
        }
        return contextMenuProviderInstance;
    }
    appendApplicableItems(_event, contextMenu, target) {
        let uiSourceCode = target;
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
        if (binding) {
            uiSourceCode = binding.network;
        }
        GutterDiffPlugin._appendRevealDiffContextMenu(contextMenu, uiSourceCode);
    }
}
//# sourceMappingURL=GutterDiffPlugin.js.map