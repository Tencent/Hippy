// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as QuickOpen from '../../ui/legacy/components/quick_open/quick_open.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { EditingLocationHistoryManager } from './EditingLocationHistoryManager.js';
import { Events as TabbedEditorContainerEvents, TabbedEditorContainer } from './TabbedEditorContainer.js'; // eslint-disable-line no-unused-vars
import { Events as UISourceCodeFrameEvents, UISourceCodeFrame } from './UISourceCodeFrame.js';
const UIStrings = {
    /**
    *@description Text to open a file
    */
    openFile: 'Open file',
    /**
    *@description Text to run commands
    */
    runCommand: 'Run command',
    /**
    *@description Text in Sources View of the Sources panel
    */
    dropInAFolderToAddToWorkspace: 'Drop in a folder to add to workspace',
    /**
    *@description Accessible label for Sources placeholder view actions list
    */
    sourceViewActions: 'Source View Actions',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/SourcesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SourcesView extends UI.Widget.VBox {
    _placeholderOptionArray;
    _selectedIndex;
    _searchableView;
    _sourceViewByUISourceCode;
    _editorContainer;
    _historyManager;
    _toolbarContainerElement;
    _scriptViewToolbar;
    _bottomToolbar;
    _toolbarChangedListener;
    _shortcuts;
    _focusedPlaceholderElement;
    _searchView;
    _searchConfig;
    constructor() {
        super();
        this.registerRequiredCSS('panels/sources/sourcesView.css', { enableLegacyPatching: false });
        this.element.id = 'sources-panel-sources-view';
        this.setMinimumAndPreferredSizes(88, 52, 150, 100);
        this._placeholderOptionArray = [];
        this._selectedIndex = 0;
        const workspace = Workspace.Workspace.WorkspaceImpl.instance();
        this._searchableView = new UI.SearchableView.SearchableView(this, this, 'sourcesViewSearchConfig');
        this._searchableView.setMinimalSearchQuerySize(0);
        this._searchableView.show(this.element);
        this._sourceViewByUISourceCode = new Map();
        this._editorContainer = new TabbedEditorContainer(this, Common.Settings.Settings.instance().createLocalSetting('previouslyViewedFiles', []), this._placeholderElement(), this._focusedPlaceholderElement);
        this._editorContainer.show(this._searchableView.element);
        this._editorContainer.addEventListener(TabbedEditorContainerEvents.EditorSelected, this._editorSelected, this);
        this._editorContainer.addEventListener(TabbedEditorContainerEvents.EditorClosed, this._editorClosed, this);
        this._historyManager = new EditingLocationHistoryManager(this, this.currentSourceFrame.bind(this));
        this._toolbarContainerElement = this.element.createChild('div', 'sources-toolbar');
        if (!Root.Runtime.experiments.isEnabled('sourcesPrettyPrint')) {
            const toolbarEditorActions = new UI.Toolbar.Toolbar('', this._toolbarContainerElement);
            for (const action of getRegisteredEditorActions()) {
                toolbarEditorActions.appendToolbarItem(action.button(this));
            }
        }
        this._scriptViewToolbar = new UI.Toolbar.Toolbar('', this._toolbarContainerElement);
        this._scriptViewToolbar.element.style.flex = 'auto';
        this._bottomToolbar = new UI.Toolbar.Toolbar('', this._toolbarContainerElement);
        this._toolbarChangedListener = null;
        UI.UIUtils.startBatchUpdate();
        workspace.uiSourceCodes().forEach(this._addUISourceCode.bind(this));
        UI.UIUtils.endBatchUpdate();
        workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, this._uiSourceCodeAdded, this);
        workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeRemoved, this._uiSourceCodeRemoved, this);
        workspace.addEventListener(Workspace.Workspace.Events.ProjectRemoved, this._projectRemoved.bind(this), this);
        function handleBeforeUnload(event) {
            if (event.returnValue) {
                return;
            }
            const unsavedSourceCodes = [];
            const projects = Workspace.Workspace.WorkspaceImpl.instance().projectsForType(Workspace.Workspace.projectTypes.FileSystem);
            for (const project of projects) {
                unsavedSourceCodes.push(...project.uiSourceCodes().filter(sourceCode => sourceCode.isDirty()));
            }
            if (!unsavedSourceCodes.length) {
                return;
            }
            event.returnValue = true;
            UI.ViewManager.ViewManager.instance().showView('sources');
            for (const sourceCode of unsavedSourceCodes) {
                Common.Revealer.reveal(sourceCode);
            }
        }
        if (!window.opener) {
            window.addEventListener('beforeunload', handleBeforeUnload, true);
        }
        this._shortcuts = new Map();
        this.element.addEventListener('keydown', this._handleKeyDown.bind(this), false);
    }
    _placeholderElement() {
        this._placeholderOptionArray = [];
        const shortcuts = [
            { actionId: 'quickOpen.show', description: i18nString(UIStrings.openFile) },
            { actionId: 'commandMenu.show', description: i18nString(UIStrings.runCommand) },
            { actionId: 'sources.add-folder-to-workspace', description: i18nString(UIStrings.dropInAFolderToAddToWorkspace) },
        ];
        const element = document.createElement('div');
        const list = element.createChild('div', 'tabbed-pane-placeholder');
        list.addEventListener('keydown', this._placeholderOnKeyDown.bind(this), false);
        UI.ARIAUtils.markAsList(list);
        UI.ARIAUtils.setAccessibleName(list, i18nString(UIStrings.sourceViewActions));
        for (let i = 0; i < shortcuts.length; i++) {
            const shortcut = shortcuts[i];
            const shortcutKeyText = UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutTitleForAction(shortcut.actionId);
            const listItemElement = list.createChild('div');
            UI.ARIAUtils.markAsListitem(listItemElement);
            const row = listItemElement.createChild('div', 'tabbed-pane-placeholder-row');
            row.tabIndex = -1;
            UI.ARIAUtils.markAsButton(row);
            if (shortcutKeyText) {
                row.createChild('div', 'tabbed-pane-placeholder-key').textContent = shortcutKeyText;
                row.createChild('div', 'tabbed-pane-placeholder-value').textContent = shortcut.description;
            }
            else {
                row.createChild('div', 'tabbed-pane-no-shortcut').textContent = shortcut.description;
            }
            const action = UI.ActionRegistry.ActionRegistry.instance().action(shortcut.actionId);
            if (action) {
                this._placeholderOptionArray.push({
                    element: row,
                    handler() {
                        action.execute();
                    },
                });
            }
        }
        element.appendChild(UI.XLink.XLink.create('https://developer.chrome.com/docs/devtools/panels/sources/?utm_source=devtools&utm_campaign=2018Q1', 'Learn more about Workspaces'));
        return element;
    }
    _placeholderOnKeyDown(event) {
        const keyboardEvent = event;
        if (isEnterOrSpaceKey(keyboardEvent)) {
            this._placeholderOptionArray[this._selectedIndex].handler();
            return;
        }
        let offset = 0;
        if (keyboardEvent.key === 'ArrowDown') {
            offset = 1;
        }
        else if (keyboardEvent.key === 'ArrowUp') {
            offset = -1;
        }
        const newIndex = Math.max(Math.min(this._placeholderOptionArray.length - 1, this._selectedIndex + offset), 0);
        const newElement = this._placeholderOptionArray[newIndex].element;
        const oldElement = this._placeholderOptionArray[this._selectedIndex].element;
        if (newElement !== oldElement) {
            oldElement.tabIndex = -1;
            newElement.tabIndex = 0;
            UI.ARIAUtils.setSelected(oldElement, false);
            UI.ARIAUtils.setSelected(newElement, true);
            this._selectedIndex = newIndex;
            newElement.focus();
        }
    }
    static defaultUISourceCodeScores() {
        const defaultScores = new Map();
        const sourcesView = UI.Context.Context.instance().flavor(SourcesView);
        if (sourcesView) {
            const uiSourceCodes = sourcesView._editorContainer.historyUISourceCodes();
            for (let i = 1; i < uiSourceCodes.length; ++i) // Skip current element
             {
                defaultScores.set(uiSourceCodes[i], uiSourceCodes.length - i);
            }
        }
        return defaultScores;
    }
    leftToolbar() {
        return this._editorContainer.leftToolbar();
    }
    rightToolbar() {
        return this._editorContainer.rightToolbar();
    }
    bottomToolbar() {
        return this._bottomToolbar;
    }
    _registerShortcuts(keys, handler) {
        for (let i = 0; i < keys.length; ++i) {
            this._shortcuts.set(keys[i].key, handler);
        }
    }
    _handleKeyDown(event) {
        const shortcutKey = UI.KeyboardShortcut.KeyboardShortcut.makeKeyFromEvent(event);
        const handler = this._shortcuts.get(shortcutKey);
        if (handler && handler()) {
            event.consume(true);
        }
    }
    wasShown() {
        super.wasShown();
        UI.Context.Context.instance().setFlavor(SourcesView, this);
    }
    willHide() {
        UI.Context.Context.instance().setFlavor(SourcesView, null);
        super.willHide();
    }
    toolbarContainerElement() {
        return this._toolbarContainerElement;
    }
    searchableView() {
        return this._searchableView;
    }
    visibleView() {
        return this._editorContainer.visibleView;
    }
    currentSourceFrame() {
        const view = this.visibleView();
        if (!(view instanceof UISourceCodeFrame)) {
            return null;
        }
        return view;
    }
    currentUISourceCode() {
        return this._editorContainer.currentFile();
    }
    _onCloseEditorTab() {
        const uiSourceCode = this._editorContainer.currentFile();
        if (!uiSourceCode) {
            return false;
        }
        this._editorContainer.closeFile(uiSourceCode);
        return true;
    }
    _onJumpToPreviousLocation() {
        this._historyManager.rollback();
    }
    _onJumpToNextLocation() {
        this._historyManager.rollover();
    }
    _uiSourceCodeAdded(event) {
        const uiSourceCode = event.data;
        this._addUISourceCode(uiSourceCode);
    }
    _addUISourceCode(uiSourceCode) {
        if (uiSourceCode.project().isServiceProject()) {
            return;
        }
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.FileSystem &&
            Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemType(uiSourceCode.project()) ===
                'overrides') {
            return;
        }
        this._editorContainer.addUISourceCode(uiSourceCode);
    }
    _uiSourceCodeRemoved(event) {
        const uiSourceCode = event.data;
        this._removeUISourceCodes([uiSourceCode]);
    }
    _removeUISourceCodes(uiSourceCodes) {
        this._editorContainer.removeUISourceCodes(uiSourceCodes);
        for (let i = 0; i < uiSourceCodes.length; ++i) {
            this._removeSourceFrame(uiSourceCodes[i]);
            this._historyManager.removeHistoryForSourceCode(uiSourceCodes[i]);
        }
    }
    _projectRemoved(event) {
        const project = event.data;
        const uiSourceCodes = project.uiSourceCodes();
        this._removeUISourceCodes(uiSourceCodes);
    }
    _updateScriptViewToolbarItems() {
        const view = this.visibleView();
        if (view instanceof UI.View.SimpleView) {
            view.toolbarItems().then(items => {
                this._scriptViewToolbar.removeToolbarItems();
                items.map(item => this._scriptViewToolbar.appendToolbarItem(item));
            });
        }
    }
    showSourceLocation(uiSourceCode, lineNumber, columnNumber, omitFocus, omitHighlight) {
        this._historyManager.updateCurrentState();
        this._editorContainer.showFile(uiSourceCode);
        const currentSourceFrame = this.currentSourceFrame();
        if (currentSourceFrame && typeof lineNumber === 'number') {
            currentSourceFrame.revealPosition(lineNumber, columnNumber, !omitHighlight);
        }
        this._historyManager.pushNewState();
        const visibleView = this.visibleView();
        if (!omitFocus && visibleView) {
            visibleView.focus();
        }
    }
    _createSourceView(uiSourceCode) {
        let sourceFrame;
        let sourceView;
        const contentType = uiSourceCode.contentType();
        if (contentType === Common.ResourceType.resourceTypes.Image) {
            sourceView = new SourceFrame.ImageView.ImageView(uiSourceCode.mimeType(), uiSourceCode);
        }
        else if (contentType === Common.ResourceType.resourceTypes.Font) {
            sourceView = new SourceFrame.FontView.FontView(uiSourceCode.mimeType(), uiSourceCode);
        }
        else {
            sourceFrame = new UISourceCodeFrame(uiSourceCode);
        }
        if (sourceFrame) {
            this._historyManager.trackSourceFrameCursorJumps(sourceFrame);
        }
        const widget = (sourceFrame || sourceView);
        this._sourceViewByUISourceCode.set(uiSourceCode, widget);
        return widget;
    }
    _getOrCreateSourceView(uiSourceCode) {
        return this._sourceViewByUISourceCode.get(uiSourceCode) || this._createSourceView(uiSourceCode);
    }
    recycleUISourceCodeFrame(sourceFrame, uiSourceCode) {
        this._sourceViewByUISourceCode.delete(sourceFrame.uiSourceCode());
        sourceFrame.setUISourceCode(uiSourceCode);
        this._sourceViewByUISourceCode.set(uiSourceCode, sourceFrame);
    }
    viewForFile(uiSourceCode) {
        return this._getOrCreateSourceView(uiSourceCode);
    }
    _removeSourceFrame(uiSourceCode) {
        const sourceView = this._sourceViewByUISourceCode.get(uiSourceCode);
        this._sourceViewByUISourceCode.delete(uiSourceCode);
        if (sourceView && sourceView instanceof UISourceCodeFrame) {
            sourceView.dispose();
        }
    }
    _editorClosed(event) {
        const uiSourceCode = event.data;
        this._historyManager.removeHistoryForSourceCode(uiSourceCode);
        let wasSelected = false;
        if (!this._editorContainer.currentFile()) {
            wasSelected = true;
        }
        // SourcesNavigator does not need to update on EditorClosed.
        this._removeToolbarChangedListener();
        this._updateScriptViewToolbarItems();
        this._searchableView.resetSearch();
        const data = {
            uiSourceCode: uiSourceCode,
            wasSelected: wasSelected,
        };
        this.dispatchEventToListeners(Events.EditorClosed, data);
    }
    _editorSelected(event) {
        const previousSourceFrame = event.data.previousView instanceof UISourceCodeFrame ? event.data.previousView : null;
        if (previousSourceFrame) {
            previousSourceFrame.setSearchableView(null);
        }
        const currentSourceFrame = event.data.currentView instanceof UISourceCodeFrame ? event.data.currentView : null;
        if (currentSourceFrame) {
            currentSourceFrame.setSearchableView(this._searchableView);
        }
        this._searchableView.setReplaceable(Boolean(currentSourceFrame) && currentSourceFrame.canEditSource());
        this._searchableView.refreshSearch();
        this._updateToolbarChangedListener();
        this._updateScriptViewToolbarItems();
        this.dispatchEventToListeners(Events.EditorSelected, this._editorContainer.currentFile());
    }
    _removeToolbarChangedListener() {
        if (this._toolbarChangedListener) {
            Common.EventTarget.EventTarget.removeEventListeners([this._toolbarChangedListener]);
        }
        this._toolbarChangedListener = null;
    }
    _updateToolbarChangedListener() {
        this._removeToolbarChangedListener();
        const sourceFrame = this.currentSourceFrame();
        if (!sourceFrame) {
            return;
        }
        this._toolbarChangedListener = sourceFrame.addEventListener(UISourceCodeFrameEvents.ToolbarItemsChanged, this._updateScriptViewToolbarItems, this);
    }
    searchCanceled() {
        if (this._searchView) {
            this._searchView.searchCanceled();
        }
        delete this._searchView;
        delete this._searchConfig;
    }
    performSearch(searchConfig, shouldJump, jumpBackwards) {
        const sourceFrame = this.currentSourceFrame();
        if (!sourceFrame) {
            return;
        }
        this._searchView = sourceFrame;
        this._searchConfig = searchConfig;
        this._searchView.performSearch(this._searchConfig, shouldJump, jumpBackwards);
    }
    jumpToNextSearchResult() {
        if (!this._searchView) {
            return;
        }
        if (this._searchConfig && this._searchView !== this.currentSourceFrame()) {
            this.performSearch(this._searchConfig, true);
            return;
        }
        this._searchView.jumpToNextSearchResult();
    }
    jumpToPreviousSearchResult() {
        if (!this._searchView) {
            return;
        }
        if (this._searchConfig && this._searchView !== this.currentSourceFrame()) {
            this.performSearch(this._searchConfig, true);
            if (this._searchView) {
                this._searchView.jumpToLastSearchResult();
            }
            return;
        }
        this._searchView.jumpToPreviousSearchResult();
    }
    supportsCaseSensitiveSearch() {
        return true;
    }
    supportsRegexSearch() {
        return true;
    }
    replaceSelectionWith(searchConfig, replacement) {
        const sourceFrame = this.currentSourceFrame();
        if (!sourceFrame) {
            console.assert(Boolean(sourceFrame));
            return;
        }
        sourceFrame.replaceSelectionWith(searchConfig, replacement);
    }
    replaceAllWith(searchConfig, replacement) {
        const sourceFrame = this.currentSourceFrame();
        if (!sourceFrame) {
            console.assert(Boolean(sourceFrame));
            return;
        }
        sourceFrame.replaceAllWith(searchConfig, replacement);
    }
    _showOutlineQuickOpen() {
        QuickOpen.QuickOpen.QuickOpenImpl.show('@');
    }
    _showGoToLineQuickOpen() {
        if (this._editorContainer.currentFile()) {
            QuickOpen.QuickOpen.QuickOpenImpl.show(':');
        }
    }
    _save() {
        this._saveSourceFrame(this.currentSourceFrame());
    }
    _saveAll() {
        const sourceFrames = this._editorContainer.fileViews();
        sourceFrames.forEach(this._saveSourceFrame.bind(this));
    }
    _saveSourceFrame(sourceFrame) {
        if (!(sourceFrame instanceof UISourceCodeFrame)) {
            return;
        }
        const uiSourceCodeFrame = sourceFrame;
        uiSourceCodeFrame.commitEditing();
    }
    toggleBreakpointsActiveState(active) {
        this._editorContainer.view.element.classList.toggle('breakpoints-deactivated', !active);
    }
}
export // TODO(crbug.com/1167717): Make this a const enum again
 var Events;
(function (Events) {
    Events["EditorClosed"] = "EditorClosed";
    Events["EditorSelected"] = "EditorSelected";
})(Events || (Events = {}));
const registeredEditorActions = [];
export function registerEditorAction(editorAction) {
    registeredEditorActions.push(editorAction);
}
export function getRegisteredEditorActions() {
    return registeredEditorActions.map(editorAction => editorAction());
}
let switchFileActionDelegateInstance;
export class SwitchFileActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!switchFileActionDelegateInstance || forceNew) {
            switchFileActionDelegateInstance = new SwitchFileActionDelegate();
        }
        return switchFileActionDelegateInstance;
    }
    static _nextFile(currentUISourceCode) {
        function fileNamePrefix(name) {
            const lastDotIndex = name.lastIndexOf('.');
            const namePrefix = name.substr(0, lastDotIndex !== -1 ? lastDotIndex : name.length);
            return namePrefix.toLowerCase();
        }
        const uiSourceCodes = currentUISourceCode.project().uiSourceCodes();
        const candidates = [];
        const url = currentUISourceCode.parentURL();
        const name = currentUISourceCode.name();
        const namePrefix = fileNamePrefix(name);
        for (let i = 0; i < uiSourceCodes.length; ++i) {
            const uiSourceCode = uiSourceCodes[i];
            if (url !== uiSourceCode.parentURL()) {
                continue;
            }
            if (fileNamePrefix(uiSourceCode.name()) === namePrefix) {
                candidates.push(uiSourceCode.name());
            }
        }
        candidates.sort(Platform.StringUtilities.naturalOrderComparator);
        const index = Platform.NumberUtilities.mod(candidates.indexOf(name) + 1, candidates.length);
        const fullURL = (url ? url + '/' : '') + candidates[index];
        const nextUISourceCode = currentUISourceCode.project().uiSourceCodeForURL(fullURL);
        return nextUISourceCode !== currentUISourceCode ? nextUISourceCode : null;
    }
    handleAction(_context, _actionId) {
        const sourcesView = UI.Context.Context.instance().flavor(SourcesView);
        if (!sourcesView) {
            return false;
        }
        const currentUISourceCode = sourcesView.currentUISourceCode();
        if (!currentUISourceCode) {
            return false;
        }
        const nextUISourceCode = SwitchFileActionDelegate._nextFile(currentUISourceCode);
        if (!nextUISourceCode) {
            return false;
        }
        sourcesView.showSourceLocation(nextUISourceCode);
        return true;
    }
}
let actionDelegateInstance;
export class ActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!actionDelegateInstance || forceNew) {
            actionDelegateInstance = new ActionDelegate();
        }
        return actionDelegateInstance;
    }
    handleAction(context, actionId) {
        const sourcesView = UI.Context.Context.instance().flavor(SourcesView);
        if (!sourcesView) {
            return false;
        }
        switch (actionId) {
            case 'sources.close-all':
                sourcesView._editorContainer.closeAllFiles();
                return true;
            case 'sources.jump-to-previous-location':
                sourcesView._onJumpToPreviousLocation();
                return true;
            case 'sources.jump-to-next-location':
                sourcesView._onJumpToNextLocation();
                return true;
            case 'sources.close-editor-tab':
                return sourcesView._onCloseEditorTab();
            case 'sources.go-to-line':
                sourcesView._showGoToLineQuickOpen();
                return true;
            case 'sources.go-to-member':
                sourcesView._showOutlineQuickOpen();
                return true;
            case 'sources.save':
                sourcesView._save();
                return true;
            case 'sources.save-all':
                sourcesView._saveAll();
                return true;
        }
        return false;
    }
}
//# sourceMappingURL=SourcesView.js.map