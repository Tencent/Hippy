/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events, IsolatedFileSystemManager } from './IsolatedFileSystemManager.js';
const UIStrings = {
    /**
    *@description Text in Edit File System View of the Workspace settings in Settings
    */
    excludedFolders: 'Excluded folders',
    /**
    *@description Text to add something
    */
    add: 'Add',
    /**
    * @description Placeholder text for an area of the UI that shows which folders have been excluded
    * from being show in DevTools. When the user has not yet chosen any folders to exclude, this text
    * is shown.
    */
    none: 'None',
    /**
    *@description Text in Edit File System View of the Workspace settings in Settings
    *@example {file/path/} PH1
    */
    sViaDevtools: '{PH1} (via .devtools)',
    /**
    *@description Text in Edit File System View of the Workspace settings in Settings
    */
    folderPath: 'Folder path',
    /**
    *@description Error message when a file system path is an empty string.
    */
    enterAPath: 'Enter a path',
    /**
    *@description Error message when a file system path is identical to an existing path.
    */
    enterAUniquePath: 'Enter a unique path',
};
const str_ = i18n.i18n.registerUIStrings('models/persistence/EditFileSystemView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class EditFileSystemView extends UI.Widget.VBox {
    _fileSystemPath;
    _excludedFolders;
    _eventListeners;
    _excludedFoldersList;
    _muteUpdate;
    _excludedFolderEditor;
    constructor(fileSystemPath) {
        super(true);
        this.registerRequiredCSS('models/persistence/editFileSystemView.css', { enableLegacyPatching: false });
        this._fileSystemPath = fileSystemPath;
        this._excludedFolders = [];
        this._eventListeners = [
            IsolatedFileSystemManager.instance().addEventListener(Events.ExcludedFolderAdded, this._update, this),
            IsolatedFileSystemManager.instance().addEventListener(Events.ExcludedFolderRemoved, this._update, this),
        ];
        const excludedFoldersHeader = this.contentElement.createChild('div', 'file-system-header');
        excludedFoldersHeader.createChild('div', 'file-system-header-text').textContent =
            i18nString(UIStrings.excludedFolders);
        excludedFoldersHeader.appendChild(UI.UIUtils.createTextButton(i18nString(UIStrings.add), this._addExcludedFolderButtonClicked.bind(this), 'add-button'));
        this._excludedFoldersList = new UI.ListWidget.ListWidget(this);
        this._excludedFoldersList.element.classList.add('file-system-list');
        this._excludedFoldersList.registerRequiredCSS('models/persistence/editFileSystemView.css', { enableLegacyPatching: false });
        const excludedFoldersPlaceholder = document.createElement('div');
        excludedFoldersPlaceholder.classList.add('file-system-list-empty');
        excludedFoldersPlaceholder.textContent = i18nString(UIStrings.none);
        this._excludedFoldersList.setEmptyPlaceholder(excludedFoldersPlaceholder);
        this._excludedFoldersList.show(this.contentElement);
        this._update();
    }
    dispose() {
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
    }
    _getFileSystem() {
        return IsolatedFileSystemManager.instance().fileSystem(this._fileSystemPath);
    }
    _update() {
        if (this._muteUpdate) {
            return;
        }
        this._excludedFoldersList.clear();
        this._excludedFolders = [];
        for (const folder of this._getFileSystem().excludedFolders().values()) {
            this._excludedFolders.push(folder);
            this._excludedFoldersList.appendItem(folder, true);
        }
    }
    _addExcludedFolderButtonClicked() {
        this._excludedFoldersList.addNewItem(0, '');
    }
    renderItem(item, editable) {
        const element = document.createElement('div');
        element.classList.add('file-system-list-item');
        const pathPrefix = editable ? item : i18nString(UIStrings.sViaDevtools, { PH1: item });
        const pathPrefixElement = element.createChild('div', 'file-system-value');
        pathPrefixElement.textContent = pathPrefix;
        UI.Tooltip.Tooltip.install(pathPrefixElement, pathPrefix);
        return element;
    }
    removeItemRequested(_item, index) {
        this._getFileSystem().removeExcludedFolder(this._excludedFolders[index]);
    }
    commitEdit(item, editor, isNew) {
        this._muteUpdate = true;
        if (!isNew) {
            this._getFileSystem().removeExcludedFolder(item);
        }
        this._getFileSystem().addExcludedFolder(this._normalizePrefix(editor.control('pathPrefix').value));
        this._muteUpdate = false;
        this._update();
    }
    beginEdit(item) {
        const editor = this._createExcludedFolderEditor();
        editor.control('pathPrefix').value = item;
        return editor;
    }
    _createExcludedFolderEditor() {
        if (this._excludedFolderEditor) {
            return this._excludedFolderEditor;
        }
        const editor = new UI.ListWidget.Editor();
        this._excludedFolderEditor = editor;
        const content = editor.contentElement();
        const titles = content.createChild('div', 'file-system-edit-row');
        titles.createChild('div', 'file-system-value').textContent = i18nString(UIStrings.folderPath);
        const fields = content.createChild('div', 'file-system-edit-row');
        fields.createChild('div', 'file-system-value')
            .appendChild(editor.createInput('pathPrefix', 'text', '/path/to/folder/', pathPrefixValidator.bind(this)));
        return editor;
        function pathPrefixValidator(_item, index, input) {
            const prefix = this._normalizePrefix(input.value.trim());
            if (!prefix) {
                return { valid: false, errorMessage: i18nString(UIStrings.enterAPath) };
            }
            const configurableCount = this._getFileSystem().excludedFolders().size;
            for (let i = 0; i < configurableCount; ++i) {
                if (i !== index && this._excludedFolders[i] === prefix) {
                    return { valid: false, errorMessage: i18nString(UIStrings.enterAUniquePath) };
                }
            }
            return { valid: true, errorMessage: undefined };
        }
    }
    _normalizePrefix(prefix) {
        if (!prefix) {
            return '';
        }
        return prefix + (prefix[prefix.length - 1] === '/' ? '' : '/');
    }
}
//# sourceMappingURL=EditFileSystemView.js.map