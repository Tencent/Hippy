/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
import * as Platform from '../../core/platform/platform.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Snippets from '../snippets/snippets.js';
import { SourcesView } from './SourcesView.js';
import { UISourceCodeFrame } from './UISourceCodeFrame.js';
const UIStrings = {
    /**
    *@description Text in Tabbed Editor Container of the Sources panel
    *@example {example.file} PH1
    */
    areYouSureYouWantToCloseUnsaved: 'Are you sure you want to close unsaved file: {PH1}?',
    /**
    *@description Error message for tooltip showing that a file in Sources could not be loaded
    */
    unableToLoadThisContent: 'Unable to load this content.',
    /**
    *@description Icon title in Tabbed Editor Container of the Sources panel
    */
    changesToThisFileWereNotSavedTo: 'Changes to this file were not saved to file system.',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/TabbedEditorContainer.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TabbedEditorContainer extends Common.ObjectWrapper.ObjectWrapper {
    _delegate;
    _tabbedPane;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _tabIds;
    _files;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _previouslyViewedFilesSetting;
    _history;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _uriToUISourceCode;
    _currentFile;
    _currentView;
    _scrollTimer;
    constructor(
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delegate, setting, placeholderElement, focusedPlaceholderElement) {
        super();
        this._delegate = delegate;
        this._tabbedPane = new UI.TabbedPane.TabbedPane();
        this._tabbedPane.setPlaceholderElement(placeholderElement, focusedPlaceholderElement);
        this._tabbedPane.setTabDelegate(new EditorContainerTabDelegate(this));
        this._tabbedPane.setCloseableTabs(true);
        this._tabbedPane.setAllowTabReorder(true, true);
        this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabClosed, this._tabClosed, this);
        this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabSelected, this._tabSelected, this);
        Persistence.Persistence.PersistenceImpl.instance().addEventListener(Persistence.Persistence.Events.BindingCreated, this._onBindingCreated, this);
        Persistence.Persistence.PersistenceImpl.instance().addEventListener(Persistence.Persistence.Events.BindingRemoved, this._onBindingRemoved, this);
        this._tabIds = new Map();
        this._files = new Map();
        this._previouslyViewedFilesSetting = setting;
        this._history = History.fromObject(this._previouslyViewedFilesSetting.get());
        this._uriToUISourceCode = new Map();
    }
    _onBindingCreated(event) {
        const binding = event.data;
        this._updateFileTitle(binding.fileSystem);
        const networkTabId = this._tabIds.get(binding.network);
        let fileSystemTabId = this._tabIds.get(binding.fileSystem);
        const wasSelectedInNetwork = this._currentFile === binding.network;
        const currentSelectionRange = this._history.selectionRange(binding.network.url());
        const currentScrollLineNumber = this._history.scrollLineNumber(binding.network.url());
        this._history.remove(binding.network.url());
        if (!networkTabId) {
            return;
        }
        if (!fileSystemTabId) {
            const networkView = this._tabbedPane.tabView(networkTabId);
            const tabIndex = this._tabbedPane.tabIndex(networkTabId);
            if (networkView instanceof UISourceCodeFrame) {
                this._delegate.recycleUISourceCodeFrame(networkView, binding.fileSystem);
                fileSystemTabId = this._appendFileTab(binding.fileSystem, false, tabIndex, networkView);
            }
            else {
                fileSystemTabId = this._appendFileTab(binding.fileSystem, false, tabIndex);
                const fileSystemTabView = this._tabbedPane.tabView(fileSystemTabId);
                this._restoreEditorProperties(fileSystemTabView, currentSelectionRange, currentScrollLineNumber);
            }
        }
        this._closeTabs([networkTabId], true);
        if (wasSelectedInNetwork) {
            this._tabbedPane.selectTab(fileSystemTabId, false);
        }
        this._updateHistory();
    }
    _onBindingRemoved(event) {
        const binding = event.data;
        this._updateFileTitle(binding.fileSystem);
    }
    get view() {
        return this._tabbedPane;
    }
    get visibleView() {
        return this._tabbedPane.visibleView;
    }
    fileViews() {
        return /** @type {!Array.<!UI.Widget.Widget>} */ this._tabbedPane.tabViews();
    }
    leftToolbar() {
        return this._tabbedPane.leftToolbar();
    }
    rightToolbar() {
        return this._tabbedPane.rightToolbar();
    }
    show(parentElement) {
        this._tabbedPane.show(parentElement);
    }
    showFile(uiSourceCode) {
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
        uiSourceCode = binding ? binding.fileSystem : uiSourceCode;
        const frame = UI.Context.Context.instance().flavor(SourcesView);
        // If the content has already been set and the current frame is showing
        // the incoming uiSourceCode, then fire the event that the file has been loaded.
        // Otherwise, this event will fire as soon as the content has been set.
        if (frame?.currentSourceFrame()?.contentSet && this._currentFile === uiSourceCode &&
            frame?.currentUISourceCode() === uiSourceCode) {
            Common.EventTarget.fireEvent('source-file-loaded', uiSourceCode.displayName(true));
        }
        else {
            this._innerShowFile(this._canonicalUISourceCode(uiSourceCode), true);
        }
    }
    closeFile(uiSourceCode) {
        const tabId = this._tabIds.get(uiSourceCode);
        if (!tabId) {
            return;
        }
        this._closeTabs([tabId]);
    }
    closeAllFiles() {
        this._closeTabs(this._tabbedPane.tabIds());
    }
    historyUISourceCodes() {
        const result = [];
        const uris = this._history._urls();
        for (const uri of uris) {
            const uiSourceCode = this._uriToUISourceCode.get(uri);
            if (uiSourceCode) {
                result.push(uiSourceCode);
            }
        }
        return result;
    }
    _addViewListeners() {
        if (!this._currentView || !(this._currentView instanceof SourceFrame.SourceFrame.SourceFrameImpl)) {
            return;
        }
        this._currentView.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.ScrollChanged, this._scrollChanged, this);
        this._currentView.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.SelectionChanged, this._selectionChanged, this);
    }
    _removeViewListeners() {
        if (!this._currentView || !(this._currentView instanceof SourceFrame.SourceFrame.SourceFrameImpl)) {
            return;
        }
        this._currentView.textEditor.removeEventListener(SourceFrame.SourcesTextEditor.Events.ScrollChanged, this._scrollChanged, this);
        this._currentView.textEditor.removeEventListener(SourceFrame.SourcesTextEditor.Events.SelectionChanged, this._selectionChanged, this);
    }
    _scrollChanged(event) {
        if (this._scrollTimer) {
            clearTimeout(this._scrollTimer);
        }
        const lineNumber = event.data;
        this._scrollTimer = window.setTimeout(saveHistory.bind(this), 100);
        if (this._currentFile) {
            this._history.updateScrollLineNumber(this._currentFile.url(), lineNumber);
        }
        function saveHistory() {
            this._history.save(this._previouslyViewedFilesSetting);
        }
    }
    _selectionChanged(event) {
        const range = event.data;
        if (this._currentFile) {
            this._history.updateSelectionRange(this._currentFile.url(), range);
        }
        this._history.save(this._previouslyViewedFilesSetting);
        if (this._currentFile) {
            Extensions.ExtensionServer.ExtensionServer.instance().sourceSelectionChanged(this._currentFile.url(), range);
        }
    }
    _innerShowFile(uiSourceCode, userGesture) {
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
        uiSourceCode = binding ? binding.fileSystem : uiSourceCode;
        if (this._currentFile === uiSourceCode) {
            return;
        }
        this._removeViewListeners();
        this._currentFile = uiSourceCode;
        const tabId = this._tabIds.get(uiSourceCode) || this._appendFileTab(uiSourceCode, userGesture);
        this._tabbedPane.selectTab(tabId, userGesture);
        if (userGesture) {
            this._editorSelectedByUserAction();
        }
        const previousView = this._currentView;
        this._currentView = this.visibleView;
        this._addViewListeners();
        const eventData = {
            currentFile: this._currentFile,
            currentView: this._currentView,
            previousView: previousView,
            userGesture: userGesture,
        };
        this.dispatchEventToListeners(Events.EditorSelected, eventData);
    }
    _titleForFile(uiSourceCode) {
        const maxDisplayNameLength = 30;
        let title = Platform.StringUtilities.trimMiddle(uiSourceCode.displayName(true), maxDisplayNameLength);
        if (uiSourceCode.isDirty()) {
            title += '*';
        }
        return title;
    }
    _maybeCloseTab(id, nextTabId) {
        const uiSourceCode = this._files.get(id);
        if (!uiSourceCode) {
            return false;
        }
        const shouldPrompt = uiSourceCode.isDirty() && uiSourceCode.project().canSetFileContent();
        // FIXME: this should be replaced with common Save/Discard/Cancel dialog.
        if (!shouldPrompt || confirm(i18nString(UIStrings.areYouSureYouWantToCloseUnsaved, { PH1: uiSourceCode.name() }))) {
            uiSourceCode.resetWorkingCopy();
            if (nextTabId) {
                this._tabbedPane.selectTab(nextTabId, true);
            }
            this._tabbedPane.closeTab(id, true);
            return true;
        }
        return false;
    }
    _closeTabs(ids, forceCloseDirtyTabs) {
        const dirtyTabs = [];
        const cleanTabs = [];
        for (let i = 0; i < ids.length; ++i) {
            const id = ids[i];
            const uiSourceCode = this._files.get(id);
            if (uiSourceCode) {
                if (!forceCloseDirtyTabs && uiSourceCode.isDirty()) {
                    dirtyTabs.push(id);
                }
                else {
                    cleanTabs.push(id);
                }
            }
        }
        if (dirtyTabs.length) {
            this._tabbedPane.selectTab(dirtyTabs[0], true);
        }
        this._tabbedPane.closeTabs(cleanTabs, true);
        for (let i = 0; i < dirtyTabs.length; ++i) {
            const nextTabId = i + 1 < dirtyTabs.length ? dirtyTabs[i + 1] : null;
            if (!this._maybeCloseTab(dirtyTabs[i], nextTabId)) {
                break;
            }
        }
    }
    _onContextMenu(tabId, contextMenu) {
        const uiSourceCode = this._files.get(tabId);
        if (uiSourceCode) {
            contextMenu.appendApplicableItems(uiSourceCode);
        }
    }
    _canonicalUISourceCode(uiSourceCode) {
        // Check if we have already a UISourceCode for this url
        if (this._uriToUISourceCode.has(uiSourceCode.url())) {
            // Ignore incoming uiSourceCode, we already have this file.
            return this._uriToUISourceCode.get(uiSourceCode.url());
        }
        this._uriToUISourceCode.set(uiSourceCode.url(), uiSourceCode);
        return uiSourceCode;
    }
    addUISourceCode(uiSourceCode) {
        const canonicalSourceCode = this._canonicalUISourceCode(uiSourceCode);
        const duplicated = canonicalSourceCode !== uiSourceCode;
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(canonicalSourceCode);
        uiSourceCode = binding ? binding.fileSystem : canonicalSourceCode;
        if (duplicated && uiSourceCode.project().type() !== Workspace.Workspace.projectTypes.FileSystem) {
            uiSourceCode.disableEdit();
        }
        if (this._currentFile === uiSourceCode) {
            return;
        }
        const uri = uiSourceCode.url();
        const index = this._history.index(uri);
        if (index === -1) {
            return;
        }
        if (!this._tabIds.has(uiSourceCode)) {
            this._appendFileTab(uiSourceCode, false);
        }
        // Select tab if this file was the last to be shown.
        if (!index) {
            this._innerShowFile(uiSourceCode, false);
            return;
        }
        if (!this._currentFile) {
            return;
        }
        const currentProjectIsSnippets = Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(this._currentFile);
        const addedProjectIsSnippets = Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(uiSourceCode);
        if (this._history.index(this._currentFile.url()) && currentProjectIsSnippets && !addedProjectIsSnippets) {
            this._innerShowFile(uiSourceCode, false);
        }
    }
    removeUISourceCode(uiSourceCode) {
        this.removeUISourceCodes([uiSourceCode]);
    }
    removeUISourceCodes(uiSourceCodes) {
        const tabIds = [];
        for (const uiSourceCode of uiSourceCodes) {
            const tabId = this._tabIds.get(uiSourceCode);
            if (tabId) {
                tabIds.push(tabId);
            }
            if (this._uriToUISourceCode.get(uiSourceCode.url()) === uiSourceCode) {
                this._uriToUISourceCode.delete(uiSourceCode.url());
            }
        }
        this._tabbedPane.closeTabs(tabIds);
    }
    _editorClosedByUserAction(uiSourceCode) {
        this._history.remove(uiSourceCode.url());
        this._updateHistory();
    }
    _editorSelectedByUserAction() {
        this._updateHistory();
    }
    _updateHistory() {
        const tabIds = this._tabbedPane.lastOpenedTabIds(maximalPreviouslyViewedFilesCount);
        function tabIdToURI(tabId) {
            const tab = this._files.get(tabId);
            if (!tab) {
                return '';
            }
            return tab.url();
        }
        this._history.update(tabIds.map(tabIdToURI.bind(this)));
        this._history.save(this._previouslyViewedFilesSetting);
    }
    _tooltipForFile(uiSourceCode) {
        uiSourceCode = Persistence.Persistence.PersistenceImpl.instance().network(uiSourceCode) || uiSourceCode;
        return uiSourceCode.url();
    }
    _appendFileTab(uiSourceCode, userGesture, index, replaceView) {
        const view = replaceView || this._delegate.viewForFile(uiSourceCode);
        const title = this._titleForFile(uiSourceCode);
        const tooltip = this._tooltipForFile(uiSourceCode);
        const tabId = this._generateTabId();
        this._tabIds.set(uiSourceCode, tabId);
        this._files.set(tabId, uiSourceCode);
        if (!replaceView) {
            const savedSelectionRange = this._history.selectionRange(uiSourceCode.url());
            const savedScrollLineNumber = this._history.scrollLineNumber(uiSourceCode.url());
            this._restoreEditorProperties(view, savedSelectionRange, savedScrollLineNumber);
        }
        this._tabbedPane.appendTab(tabId, title, view, tooltip, userGesture, undefined, index);
        this._updateFileTitle(uiSourceCode);
        this._addUISourceCodeListeners(uiSourceCode);
        if (uiSourceCode.loadError()) {
            this._addLoadErrorIcon(tabId);
        }
        else if (!uiSourceCode.contentLoaded()) {
            uiSourceCode.requestContent().then(_content => {
                if (uiSourceCode.loadError()) {
                    this._addLoadErrorIcon(tabId);
                }
            });
        }
        return tabId;
    }
    _addLoadErrorIcon(tabId) {
        const icon = UI.Icon.Icon.create('smallicon-error');
        UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.unableToLoadThisContent));
        if (this._tabbedPane.tabView(tabId)) {
            this._tabbedPane.setTabIcon(tabId, icon);
        }
    }
    _restoreEditorProperties(editorView, selection, firstLineNumber) {
        const sourceFrame = editorView instanceof SourceFrame.SourceFrame.SourceFrameImpl ?
            editorView :
            null;
        if (!sourceFrame) {
            return;
        }
        if (selection) {
            sourceFrame.setSelection(selection);
        }
        if (typeof firstLineNumber === 'number') {
            sourceFrame.scrollToLine(firstLineNumber);
        }
    }
    _tabClosed(event) {
        const tabId = event.data.tabId;
        const userGesture = event.data.isUserGesture;
        const uiSourceCode = this._files.get(tabId);
        if (this._currentFile === uiSourceCode) {
            this._removeViewListeners();
            this._currentView = null;
            this._currentFile = null;
        }
        this._tabIds.delete(uiSourceCode);
        this._files.delete(tabId);
        if (uiSourceCode) {
            this._removeUISourceCodeListeners(uiSourceCode);
            this.dispatchEventToListeners(Events.EditorClosed, uiSourceCode);
            if (userGesture) {
                this._editorClosedByUserAction(uiSourceCode);
            }
        }
    }
    _tabSelected(event) {
        const tabId = event.data.tabId;
        const userGesture = event.data.isUserGesture;
        const uiSourceCode = this._files.get(tabId);
        if (uiSourceCode) {
            this._innerShowFile(uiSourceCode, userGesture);
        }
    }
    _addUISourceCodeListeners(uiSourceCode) {
        uiSourceCode.addEventListener(Workspace.UISourceCode.Events.TitleChanged, this._uiSourceCodeTitleChanged, this);
        uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._uiSourceCodeWorkingCopyChanged, this);
        uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._uiSourceCodeWorkingCopyCommitted, this);
    }
    _removeUISourceCodeListeners(uiSourceCode) {
        uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.TitleChanged, this._uiSourceCodeTitleChanged, this);
        uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._uiSourceCodeWorkingCopyChanged, this);
        uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._uiSourceCodeWorkingCopyCommitted, this);
    }
    _updateFileTitle(uiSourceCode) {
        const tabId = this._tabIds.get(uiSourceCode);
        if (tabId) {
            const title = this._titleForFile(uiSourceCode);
            const tooltip = this._tooltipForFile(uiSourceCode);
            this._tabbedPane.changeTabTitle(tabId, title, tooltip);
            let icon = null;
            if (uiSourceCode.loadError()) {
                icon = UI.Icon.Icon.create('smallicon-error');
                UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.unableToLoadThisContent));
            }
            else if (Persistence.Persistence.PersistenceImpl.instance().hasUnsavedCommittedChanges(uiSourceCode)) {
                icon = UI.Icon.Icon.create('smallicon-warning');
                UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.changesToThisFileWereNotSavedTo));
            }
            else {
                icon = Persistence.PersistenceUtils.PersistenceUtils.iconForUISourceCode(uiSourceCode);
            }
            this._tabbedPane.setTabIcon(tabId, icon);
        }
    }
    _uiSourceCodeTitleChanged(event) {
        const uiSourceCode = event.data;
        this._updateFileTitle(uiSourceCode);
        this._updateHistory();
    }
    _uiSourceCodeWorkingCopyChanged(event) {
        const uiSourceCode = event.data;
        this._updateFileTitle(uiSourceCode);
    }
    _uiSourceCodeWorkingCopyCommitted(event) {
        const uiSourceCode = event.data.uiSourceCode;
        this._updateFileTitle(uiSourceCode);
    }
    _generateTabId() {
        return 'tab_' + (tabId++);
    }
    /** uiSourceCode
       */
    currentFile() {
        return this._currentFile || null;
    }
}
export // TODO(crbug.com/1167717): Make this a const enum again
 var Events;
(function (Events) {
    Events["EditorSelected"] = "EditorSelected";
    Events["EditorClosed"] = "EditorClosed";
})(Events || (Events = {}));
export let tabId = 0;
export const maximalPreviouslyViewedFilesCount = 30;
export class HistoryItem {
    url;
    _isSerializable;
    selectionRange;
    scrollLineNumber;
    constructor(url, selectionRange, scrollLineNumber) {
        this.url = url;
        this._isSerializable = url.length < HistoryItem.serializableUrlLengthLimit;
        this.selectionRange = selectionRange;
        this.scrollLineNumber = scrollLineNumber;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromObject(serializedHistoryItem) {
        const selectionRange = 'selectionRange' in serializedHistoryItem ?
            TextUtils.TextRange.TextRange.fromObject(serializedHistoryItem.selectionRange) :
            undefined;
        return new HistoryItem(serializedHistoryItem.url, selectionRange, serializedHistoryItem.scrollLineNumber);
    }
    serializeToObject() {
        if (!this._isSerializable) {
            return null;
        }
        const serializedHistoryItem = {
            url: this.url,
            selectionRange: this.selectionRange,
            scrollLineNumber: this.scrollLineNumber,
        };
        return serializedHistoryItem;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static serializableUrlLengthLimit = 4096;
}
export class History {
    _items;
    _itemsIndex;
    constructor(items) {
        this._items = items;
        this._itemsIndex = new Map();
        this._rebuildItemIndex();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromObject(serializedHistory) {
        const items = [];
        for (let i = 0; i < serializedHistory.length; ++i) {
            // crbug.com/876265 Old versions of DevTools don't have urls set in their localStorage
            if ('url' in serializedHistory[i] && serializedHistory[i].url) {
                items.push(HistoryItem.fromObject(serializedHistory[i]));
            }
        }
        return new History(items);
    }
    index(url) {
        const index = this._itemsIndex.get(url);
        if (index !== undefined) {
            return index;
        }
        return -1;
    }
    _rebuildItemIndex() {
        this._itemsIndex = new Map();
        for (let i = 0; i < this._items.length; ++i) {
            console.assert(!this._itemsIndex.has(this._items[i].url));
            this._itemsIndex.set(this._items[i].url, i);
        }
    }
    selectionRange(url) {
        const index = this.index(url);
        return index !== -1 ? this._items[index].selectionRange : undefined;
    }
    updateSelectionRange(url, selectionRange) {
        if (!selectionRange) {
            return;
        }
        const index = this.index(url);
        if (index === -1) {
            return;
        }
        this._items[index].selectionRange = selectionRange;
    }
    scrollLineNumber(url) {
        const index = this.index(url);
        return index !== -1 ? this._items[index].scrollLineNumber : undefined;
    }
    updateScrollLineNumber(url, scrollLineNumber) {
        const index = this.index(url);
        if (index === -1) {
            return;
        }
        this._items[index].scrollLineNumber = scrollLineNumber;
    }
    update(urls) {
        for (let i = urls.length - 1; i >= 0; --i) {
            const index = this.index(urls[i]);
            let item;
            if (index !== -1) {
                item = this._items[index];
                this._items.splice(index, 1);
            }
            else {
                item = new HistoryItem(urls[i]);
            }
            this._items.unshift(item);
            this._rebuildItemIndex();
        }
    }
    remove(url) {
        const index = this.index(url);
        if (index !== -1) {
            this._items.splice(index, 1);
            this._rebuildItemIndex();
        }
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    save(setting) {
        setting.set(this._serializeToObject());
    }
    _serializeToObject() {
        const serializedHistory = [];
        for (let i = 0; i < this._items.length; ++i) {
            const serializedItem = this._items[i].serializeToObject();
            if (serializedItem) {
                serializedHistory.push(serializedItem);
            }
            if (serializedHistory.length === maximalPreviouslyViewedFilesCount) {
                break;
            }
        }
        return serializedHistory;
    }
    _urls() {
        const result = [];
        for (let i = 0; i < this._items.length; ++i) {
            result.push(this._items[i].url);
        }
        return result;
    }
}
export class EditorContainerTabDelegate {
    _editorContainer;
    constructor(editorContainer) {
        this._editorContainer = editorContainer;
    }
    closeTabs(_tabbedPane, ids) {
        this._editorContainer._closeTabs(ids);
    }
    onContextMenu(tabId, contextMenu) {
        this._editorContainer._onContextMenu(tabId, contextMenu);
    }
}
//# sourceMappingURL=TabbedEditorContainer.js.map