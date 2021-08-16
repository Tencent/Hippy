// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as WorkspaceDiff from '../../models/workspace_diff/workspace_diff.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Snippets from '../snippets/snippets.js';
const UIStrings = {
    /**
    *@description Name of an item from source map
    *@example {compile.html} PH1
    */
    sFromSourceMap: '{PH1} (from source map)',
};
const str_ = i18n.i18n.registerUIStrings('panels/changes/ChangesSidebar.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ChangesSidebar extends UI.Widget.Widget {
    _treeoutline;
    _treeElements;
    _workspaceDiff;
    constructor(workspaceDiff) {
        super();
        this._treeoutline = new UI.TreeOutline.TreeOutlineInShadow();
        this._treeoutline.setFocusable(false);
        this._treeoutline.registerRequiredCSS('panels/changes/changesSidebar.css', { enableLegacyPatching: false });
        this._treeoutline.setComparator((a, b) => Platform.StringUtilities.compare(a.titleAsText(), b.titleAsText()));
        this._treeoutline.addEventListener(UI.TreeOutline.Events.ElementSelected, this._selectionChanged, this);
        UI.ARIAUtils.markAsTablist(this._treeoutline.contentElement);
        this.element.appendChild(this._treeoutline.element);
        this._treeElements = new Map();
        this._workspaceDiff = workspaceDiff;
        this._workspaceDiff.modifiedUISourceCodes().forEach(this._addUISourceCode.bind(this));
        this._workspaceDiff.addEventListener(WorkspaceDiff.WorkspaceDiff.Events.ModifiedStatusChanged, this._uiSourceCodeMofiedStatusChanged, this);
    }
    selectUISourceCode(uiSourceCode, omitFocus) {
        const treeElement = this._treeElements.get(uiSourceCode);
        if (!treeElement) {
            return;
        }
        treeElement.select(omitFocus);
    }
    selectedUISourceCode() {
        // @ts-ignore uiSourceCode seems to be dynamically attached.
        return this._treeoutline.selectedTreeElement ? this._treeoutline.selectedTreeElement.uiSourceCode : null;
    }
    _selectionChanged() {
        this.dispatchEventToListeners("SelectedUISourceCodeChanged" /* SelectedUISourceCodeChanged */);
    }
    _uiSourceCodeMofiedStatusChanged(event) {
        if (event.data.isModified) {
            this._addUISourceCode(event.data.uiSourceCode);
        }
        else {
            this._removeUISourceCode(event.data.uiSourceCode);
        }
    }
    _removeUISourceCode(uiSourceCode) {
        const treeElement = this._treeElements.get(uiSourceCode);
        this._treeElements.delete(uiSourceCode);
        if (this._treeoutline.selectedTreeElement === treeElement) {
            const nextElementToSelect = treeElement.previousSibling || treeElement.nextSibling;
            if (nextElementToSelect) {
                nextElementToSelect.select(true);
            }
            else {
                treeElement.deselect();
                this._selectionChanged();
            }
        }
        if (treeElement) {
            this._treeoutline.removeChild(treeElement);
            treeElement.dispose();
        }
        if (this._treeoutline.rootElement().childCount() === 0) {
            this._treeoutline.setFocusable(false);
        }
    }
    _addUISourceCode(uiSourceCode) {
        const treeElement = new UISourceCodeTreeElement(uiSourceCode);
        this._treeElements.set(uiSourceCode, treeElement);
        this._treeoutline.setFocusable(true);
        this._treeoutline.appendChild(treeElement);
        if (!this._treeoutline.selectedTreeElement) {
            treeElement.select(true);
        }
    }
}
export class UISourceCodeTreeElement extends UI.TreeOutline.TreeElement {
    uiSourceCode;
    _eventListeners;
    constructor(uiSourceCode) {
        super();
        this.uiSourceCode = uiSourceCode;
        this.listItemElement.classList.add('navigator-' + uiSourceCode.contentType().name() + '-tree-item');
        UI.ARIAUtils.markAsTab(this.listItemElement);
        let iconType = 'largeicon-navigator-file';
        if (Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(this.uiSourceCode)) {
            iconType = 'largeicon-navigator-snippet';
        }
        const defaultIcon = UI.Icon.Icon.create(iconType, 'icon');
        this.setLeadingIcons([defaultIcon]);
        this._eventListeners = [
            uiSourceCode.addEventListener(Workspace.UISourceCode.Events.TitleChanged, this._updateTitle, this),
            uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._updateTitle, this),
            uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._updateTitle, this),
        ];
        this._updateTitle();
    }
    _updateTitle() {
        let titleText = this.uiSourceCode.displayName();
        if (this.uiSourceCode.isDirty()) {
            titleText = '*' + titleText;
        }
        this.title = titleText;
        let tooltip = this.uiSourceCode.url();
        if (this.uiSourceCode.contentType().isFromSourceMap()) {
            tooltip = i18nString(UIStrings.sFromSourceMap, { PH1: this.uiSourceCode.displayName() });
        }
        this.tooltip = tooltip;
    }
    dispose() {
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
    }
}
//# sourceMappingURL=ChangesSidebar.js.map