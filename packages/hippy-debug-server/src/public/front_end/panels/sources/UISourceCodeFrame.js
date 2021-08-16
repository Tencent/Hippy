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
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as Persistence from '../../models/persistence/persistence.js'; // eslint-disable-line no-unused-vars
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as IssueCounter from '../../ui/components/issue_counter/issue_counter.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { CoveragePlugin } from './CoveragePlugin.js';
import { CSSPlugin } from './CSSPlugin.js';
import { DebuggerPlugin } from './DebuggerPlugin.js';
import { GutterDiffPlugin } from './GutterDiffPlugin.js';
import { JavaScriptCompilerPlugin } from './JavaScriptCompilerPlugin.js';
import { RecorderPlugin } from './RecorderPlugin.js';
import { ScriptOriginPlugin } from './ScriptOriginPlugin.js';
import { SnippetsPlugin } from './SnippetsPlugin.js';
import { SourcesPanel } from './SourcesPanel.js';
export class UISourceCodeFrame extends SourceFrame.SourceFrame.SourceFrameImpl {
    _uiSourceCode;
    _diff;
    _muteSourceCodeEvents;
    _isSettingContent;
    _persistenceBinding;
    _rowMessageBuckets;
    _typeDecorationsPending;
    _uiSourceCodeEventListeners;
    _messageAndDecorationListeners;
    _boundOnBindingChanged;
    _errorPopoverHelper;
    _plugins;
    constructor(uiSourceCode) {
        super(workingCopy);
        this._uiSourceCode = uiSourceCode;
        if (Root.Runtime.experiments.isEnabled('sourceDiff')) {
            this._diff = new SourceFrame.SourceCodeDiff.SourceCodeDiff(this.textEditor);
        }
        this._muteSourceCodeEvents = false;
        this._isSettingContent = false;
        this._persistenceBinding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
        this._rowMessageBuckets = new Map();
        this._typeDecorationsPending = new Set();
        this._uiSourceCodeEventListeners = [];
        this._messageAndDecorationListeners = [];
        this._boundOnBindingChanged = this._onBindingChanged.bind(this);
        this.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.EditorBlurred, () => UI.Context.Context.instance().setFlavor(UISourceCodeFrame, null));
        this.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.EditorFocused, () => UI.Context.Context.instance().setFlavor(UISourceCodeFrame, this));
        Common.Settings.Settings.instance()
            .moduleSetting('persistenceNetworkOverridesEnabled')
            .addChangeListener(this._onNetworkPersistenceChanged, this);
        this._errorPopoverHelper =
            new UI.PopoverHelper.PopoverHelper(this.element, this._getErrorPopoverContent.bind(this));
        this._errorPopoverHelper.setHasPadding(true);
        this._errorPopoverHelper.setTimeout(100, 100);
        this._plugins = [];
        this._initializeUISourceCode();
        function workingCopy() {
            if (uiSourceCode.isDirty()) {
                return Promise.resolve({ content: uiSourceCode.workingCopy(), isEncoded: false });
            }
            return uiSourceCode.requestContent();
        }
    }
    _installMessageAndDecorationListeners() {
        if (this._persistenceBinding) {
            const networkSourceCode = this._persistenceBinding.network;
            const fileSystemSourceCode = this._persistenceBinding.fileSystem;
            this._messageAndDecorationListeners = [
                networkSourceCode.addEventListener(Workspace.UISourceCode.Events.MessageAdded, this._onMessageAdded, this),
                networkSourceCode.addEventListener(Workspace.UISourceCode.Events.MessageRemoved, this._onMessageRemoved, this),
                networkSourceCode.addEventListener(Workspace.UISourceCode.Events.LineDecorationAdded, this._onLineDecorationAdded, this),
                networkSourceCode.addEventListener(Workspace.UISourceCode.Events.LineDecorationRemoved, this._onLineDecorationRemoved, this),
                fileSystemSourceCode.addEventListener(Workspace.UISourceCode.Events.MessageAdded, this._onMessageAdded, this),
                fileSystemSourceCode.addEventListener(Workspace.UISourceCode.Events.MessageRemoved, this._onMessageRemoved, this),
            ];
        }
        else {
            this._messageAndDecorationListeners = [
                this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.MessageAdded, this._onMessageAdded, this),
                this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.MessageRemoved, this._onMessageRemoved, this),
                this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.LineDecorationAdded, this._onLineDecorationAdded, this),
                this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.LineDecorationRemoved, this._onLineDecorationRemoved, this),
            ];
        }
    }
    uiSourceCode() {
        return this._uiSourceCode;
    }
    setUISourceCode(uiSourceCode) {
        this._unloadUISourceCode();
        this._uiSourceCode = uiSourceCode;
        if (uiSourceCode.contentLoaded()) {
            if (uiSourceCode.workingCopy() !== this.textEditor.text()) {
                this._innerSetContent(uiSourceCode.workingCopy());
            }
        }
        else {
            uiSourceCode.requestContent().then(() => {
                if (this._uiSourceCode !== uiSourceCode) {
                    return;
                }
                if (uiSourceCode.workingCopy() !== this.textEditor.text()) {
                    this._innerSetContent(uiSourceCode.workingCopy());
                }
            });
        }
        this._initializeUISourceCode();
    }
    _unloadUISourceCode() {
        this._disposePlugins();
        for (const message of this._allMessages()) {
            this._removeMessageFromSource(message);
        }
        Common.EventTarget.EventTarget.removeEventListeners(this._messageAndDecorationListeners);
        Common.EventTarget.EventTarget.removeEventListeners(this._uiSourceCodeEventListeners);
        this._uiSourceCode.removeWorkingCopyGetter();
        Persistence.Persistence.PersistenceImpl.instance().unsubscribeFromBindingEvent(this._uiSourceCode, this._boundOnBindingChanged);
    }
    _initializeUISourceCode() {
        this._uiSourceCodeEventListeners = [
            this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._onWorkingCopyChanged, this),
            this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._onWorkingCopyCommitted, this),
            this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.TitleChanged, this._refreshHighlighterType, this),
        ];
        Persistence.Persistence.PersistenceImpl.instance().subscribeForBindingEvent(this._uiSourceCode, this._boundOnBindingChanged);
        for (const message of this._allMessages()) {
            this._addMessageToSource(message);
        }
        this._installMessageAndDecorationListeners();
        this._updateStyle();
        this._decorateAllTypes();
        this._refreshHighlighterType();
        if (Root.Runtime.experiments.isEnabled('sourcesPrettyPrint')) {
            const supportedPrettyTypes = new Set(['text/html', 'text/css', 'text/javascript']);
            this.setCanPrettyPrint(supportedPrettyTypes.has(this.highlighterType()), true);
        }
        this._ensurePluginsLoaded();
    }
    wasShown() {
        super.wasShown();
        // We need CodeMirrorTextEditor to be initialized prior to this call as it calls |cursorPositionToCoordinates| internally. @see crbug.com/506566
        window.setTimeout(() => this._updateBucketDecorations(), 0);
        this.setEditable(this._canEditSource());
        for (const plugin of this._plugins) {
            plugin.wasShown();
        }
    }
    willHide() {
        for (const plugin of this._plugins) {
            plugin.willHide();
        }
        super.willHide();
        UI.Context.Context.instance().setFlavor(UISourceCodeFrame, null);
        this._uiSourceCode.removeWorkingCopyGetter();
    }
    _refreshHighlighterType() {
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(this._uiSourceCode);
        const highlighterType = binding ? binding.network.mimeType() : this._uiSourceCode.mimeType();
        if (this.highlighterType() === highlighterType) {
            return;
        }
        this._disposePlugins();
        this.setHighlighterType(highlighterType);
        this._ensurePluginsLoaded();
    }
    _canEditSource() {
        if (this.hasLoadError()) {
            return false;
        }
        if (this._uiSourceCode.editDisabled()) {
            return false;
        }
        if (this._uiSourceCode.mimeType() === 'application/wasm') {
            return false;
        }
        if (Persistence.Persistence.PersistenceImpl.instance().binding(this._uiSourceCode)) {
            return true;
        }
        if (this._uiSourceCode.project().canSetFileContent()) {
            return true;
        }
        if (this._uiSourceCode.project().isServiceProject()) {
            return false;
        }
        if (this._uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Network &&
            Persistence.NetworkPersistenceManager.NetworkPersistenceManager.instance().active()) {
            return true;
        }
        // Because live edit fails on large whitespace changes, pretty printed scripts are not editable.
        if (this.pretty && this._uiSourceCode.contentType().hasScripts()) {
            return false;
        }
        return this._uiSourceCode.contentType() !== Common.ResourceType.resourceTypes.Document;
    }
    _onNetworkPersistenceChanged() {
        this.setEditable(this._canEditSource());
    }
    commitEditing() {
        if (!this._uiSourceCode.isDirty()) {
            return;
        }
        this._muteSourceCodeEvents = true;
        this._uiSourceCode.commitWorkingCopy();
        this._muteSourceCodeEvents = false;
    }
    setContent(content, loadError) {
        this._disposePlugins();
        this._rowMessageBuckets.clear();
        super.setContent(content, loadError);
        for (const message of this._allMessages()) {
            this._addMessageToSource(message);
        }
        this._decorateAllTypes();
        this._ensurePluginsLoaded();
        Common.EventTarget.fireEvent('source-file-loaded', this._uiSourceCode.displayName(true));
    }
    _allMessages() {
        if (this._persistenceBinding) {
            const combinedSet = this._persistenceBinding.network.messages();
            Platform.SetUtilities.addAll(combinedSet, this._persistenceBinding.fileSystem.messages());
            return combinedSet;
        }
        return this._uiSourceCode.messages();
    }
    onTextChanged(oldRange, newRange) {
        const wasPretty = this.pretty;
        super.onTextChanged(oldRange, newRange);
        this._errorPopoverHelper.hidePopover();
        if (this._isSettingContent) {
            return;
        }
        SourcesPanel.instance().updateLastModificationTime();
        this._muteSourceCodeEvents = true;
        if (this.isClean()) {
            this._uiSourceCode.resetWorkingCopy();
        }
        else {
            this._uiSourceCode.setWorkingCopyGetter(this.textEditor.text.bind(this.textEditor));
        }
        this._muteSourceCodeEvents = false;
        if (wasPretty !== this.pretty) {
            this._updateStyle();
            this._disposePlugins();
            this._ensurePluginsLoaded();
        }
    }
    _onWorkingCopyChanged(_event) {
        if (this._muteSourceCodeEvents) {
            return;
        }
        this._innerSetContent(this._uiSourceCode.workingCopy());
    }
    _onWorkingCopyCommitted(_event) {
        if (!this._muteSourceCodeEvents) {
            this._innerSetContent(this._uiSourceCode.workingCopy());
        }
        this.contentCommitted();
        this._updateStyle();
    }
    _ensurePluginsLoaded() {
        if (!this.loaded || this._plugins.length) {
            return;
        }
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(this._uiSourceCode);
        const pluginUISourceCode = binding ? binding.network : this._uiSourceCode;
        // The order of these plugins matters for toolbar items
        if (DebuggerPlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new DebuggerPlugin(this.textEditor, pluginUISourceCode, this));
        }
        if (CSSPlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new CSSPlugin(this.textEditor));
        }
        if (!this.pretty && JavaScriptCompilerPlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new JavaScriptCompilerPlugin(this.textEditor, pluginUISourceCode));
        }
        if (SnippetsPlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new SnippetsPlugin(this.textEditor, pluginUISourceCode));
        }
        if (Root.Runtime.experiments.isEnabled('recorder') && RecorderPlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new RecorderPlugin(this.textEditor, pluginUISourceCode));
        }
        if (ScriptOriginPlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new ScriptOriginPlugin(this.textEditor, pluginUISourceCode));
        }
        if (!this.pretty && Root.Runtime.experiments.isEnabled('sourceDiff') &&
            GutterDiffPlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new GutterDiffPlugin(this.textEditor, pluginUISourceCode));
        }
        if (CoveragePlugin.accepts(pluginUISourceCode)) {
            this._plugins.push(new CoveragePlugin(this.textEditor, pluginUISourceCode));
        }
        this.dispatchEventToListeners(Events.ToolbarItemsChanged);
        for (const plugin of this._plugins) {
            plugin.wasShown();
        }
    }
    _disposePlugins() {
        this.textEditor.operation(() => {
            for (const plugin of this._plugins) {
                plugin.dispose();
            }
        });
        this._plugins = [];
    }
    _onBindingChanged() {
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(this._uiSourceCode);
        if (binding === this._persistenceBinding) {
            return;
        }
        this._unloadUISourceCode();
        this._persistenceBinding = binding;
        this._initializeUISourceCode();
    }
    _updateStyle() {
        this.setEditable(this._canEditSource());
    }
    _innerSetContent(content) {
        this._isSettingContent = true;
        const oldContent = this.textEditor.text();
        if (this._diff) {
            this._diff.highlightModifiedLines(oldContent, content);
        }
        if (oldContent !== content) {
            this.setContent(content, null);
        }
        this._isSettingContent = false;
    }
    async populateTextAreaContextMenu(contextMenu, editorLineNumber, editorColumnNumber) {
        await super.populateTextAreaContextMenu(contextMenu, editorLineNumber, editorColumnNumber);
        contextMenu.appendApplicableItems(this._uiSourceCode);
        const location = this.editorLocationToUILocation(editorLineNumber, editorColumnNumber);
        contextMenu.appendApplicableItems(new Workspace.UISourceCode.UILocation(this._uiSourceCode, location.lineNumber, location.columnNumber));
        contextMenu.appendApplicableItems(this);
        for (const plugin of this._plugins) {
            await plugin.populateTextAreaContextMenu(contextMenu, editorLineNumber, editorColumnNumber);
        }
    }
    dispose() {
        this._errorPopoverHelper.dispose();
        this._unloadUISourceCode();
        this.textEditor.dispose();
        this.detach();
        Common.Settings.Settings.instance()
            .moduleSetting('persistenceNetworkOverridesEnabled')
            .removeChangeListener(this._onNetworkPersistenceChanged, this);
    }
    _onMessageAdded(event) {
        const message = event.data;
        this._addMessageToSource(message);
    }
    _getClampedEditorLineNumberForMessage(message) {
        let { lineNumber } = this.uiLocationToEditorLocation(message.lineNumber(), message.columnNumber());
        if (lineNumber >= this.textEditor.linesCount) {
            lineNumber = this.textEditor.linesCount - 1;
        }
        if (lineNumber < 0) {
            lineNumber = 0;
        }
        return lineNumber;
    }
    _addMessageToSource(message) {
        if (!this.loaded) {
            return;
        }
        const editorLineNumber = this._getClampedEditorLineNumberForMessage(message);
        let messageBucket = this._rowMessageBuckets.get(editorLineNumber);
        if (!messageBucket) {
            messageBucket = new RowMessageBucket(this, this.textEditor, editorLineNumber);
            this._rowMessageBuckets.set(editorLineNumber, messageBucket);
        }
        messageBucket.addMessage(message);
    }
    _onMessageRemoved(event) {
        const message = event.data;
        this._removeMessageFromSource(message);
    }
    _removeMessageFromSource(message) {
        if (!this.loaded) {
            return;
        }
        const editorLineNumber = this._getClampedEditorLineNumberForMessage(message);
        const messageBucket = this._rowMessageBuckets.get(editorLineNumber);
        if (!messageBucket) {
            return;
        }
        messageBucket.removeMessage(message);
        if (!messageBucket.uniqueMessagesCount()) {
            messageBucket.detachFromEditor();
            this._rowMessageBuckets.delete(editorLineNumber);
        }
    }
    _getErrorPopoverContent(event) {
        const mouseEvent = event;
        const eventTarget = mouseEvent.target;
        return RowMessageBucket.getPopover(eventTarget, mouseEvent);
    }
    _updateBucketDecorations() {
        for (const bucket of this._rowMessageBuckets.values()) {
            bucket._updateDecoration();
        }
    }
    _onLineDecorationAdded(event) {
        const marker = event.data;
        this._decorateTypeThrottled(marker.type());
    }
    _onLineDecorationRemoved(event) {
        const marker = event.data;
        this._decorateTypeThrottled(marker.type());
    }
    _decorateTypeThrottled(type) {
        if (this._typeDecorationsPending.has(type)) {
            return;
        }
        this._typeDecorationsPending.add(type);
        const extension = SourceFrame.SourceFrame.getRegisteredLineDecorators().find(extension => extension.decoratorType === type);
        const decorator = extension && extension.lineDecorator();
        if (!decorator) {
            return;
        }
        this._typeDecorationsPending.delete(type);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.textEditor.codeMirror().operation(() => {
            decorator.decorate(this._persistenceBinding ? this._persistenceBinding.network : this.uiSourceCode(), this.textEditor, type);
        });
    }
    _decorateAllTypes() {
        if (!this.loaded) {
            return;
        }
        for (const extension of SourceFrame.SourceFrame.getRegisteredLineDecorators()) {
            const type = extension.decoratorType;
            if (type !== null && this._uiSourceCode.decorationsForType(type)) {
                this._decorateTypeThrottled(type);
            }
        }
    }
    async toolbarItems() {
        const leftToolbarItems = await super.toolbarItems();
        const rightToolbarItems = [];
        for (const plugin of this._plugins) {
            leftToolbarItems.push(...plugin.leftToolbarItems());
            rightToolbarItems.push(...await plugin.rightToolbarItems());
        }
        if (!rightToolbarItems.length) {
            return leftToolbarItems;
        }
        return [...leftToolbarItems, new UI.Toolbar.ToolbarSeparator(true), ...rightToolbarItems];
    }
    async populateLineGutterContextMenu(contextMenu, lineNumber) {
        await super.populateLineGutterContextMenu(contextMenu, lineNumber);
        for (const plugin of this._plugins) {
            await plugin.populateLineGutterContextMenu(contextMenu, lineNumber);
        }
    }
}
function getIconDataForLevel(level) {
    if (level === Workspace.UISourceCode.Message.Level.Error) {
        return { color: '', width: '12px', height: '12px', iconName: 'error_icon' };
    }
    if (level === Workspace.UISourceCode.Message.Level.Warning) {
        return { color: '', width: '12px', height: '12px', iconName: 'warning_icon' };
    }
    if (level === Workspace.UISourceCode.Message.Level.Issue) {
        return { color: 'var(--issue-color-yellow)', width: '12px', height: '12px', iconName: 'issue-exclamation-icon' };
    }
    return { color: '', width: '12px', height: '12px', iconName: 'error_icon' };
}
function getBubbleTypePerLevel(level) {
    switch (level) {
        case Workspace.UISourceCode.Message.Level.Error:
            return 'error';
        case Workspace.UISourceCode.Message.Level.Warning:
            return 'warning';
        case Workspace.UISourceCode.Message.Level.Issue:
            return 'warning';
    }
}
function getLineClassPerLevel(level) {
    switch (level) {
        case Workspace.UISourceCode.Message.Level.Error:
            return 'text-editor-line-with-error';
        case Workspace.UISourceCode.Message.Level.Warning:
            return 'text-editor-line-with-warning';
        case Workspace.UISourceCode.Message.Level.Issue:
            return 'text-editor-line-with-warning';
    }
}
function getIconDataForMessage(message) {
    if (message instanceof IssuesManager.SourceFrameIssuesManager.IssueMessage) {
        return {
            ...IssueCounter.IssueCounter.getIssueKindIconData(message.getIssueKind()),
            width: '12px',
            height: '12px',
        };
    }
    return getIconDataForLevel(message.level());
}
export class RowMessage {
    message;
    repeatCount;
    element;
    icon;
    repeatCountElement;
    constructor(message) {
        this.message = message;
        this.repeatCount = 1;
        this.element = document.createElement('div');
        this.element.classList.add('text-editor-row-message');
        this.icon = new IconButton.Icon.Icon();
        this.icon.data = getIconDataForMessage(message);
        this.icon.classList.add('text-editor-row-message-icon');
        this.icon.addEventListener('click', () => this.callClickHandler());
        this.element.append(this.icon);
        this.repeatCountElement = document.createElement('span', { is: 'dt-small-bubble' });
        this.repeatCountElement.classList.add('text-editor-row-message-repeat-count', 'hidden');
        this.element.appendChild(this.repeatCountElement);
        this.repeatCountElement.type = getBubbleTypePerLevel(message.level());
        const linesContainer = this.element.createChild('div');
        const lines = this.message.text().split('\n');
        for (let i = 0; i < lines.length; ++i) {
            const messageLine = linesContainer.createChild('div');
            messageLine.textContent = lines[i];
        }
    }
    getMessage() {
        return this.message;
    }
    callClickHandler() {
        const handler = this.message.clickHandler();
        if (handler) {
            handler();
        }
    }
    getRepeatCount() {
        return this.repeatCount;
    }
    setRepeatCount(repeatCount) {
        if (this.repeatCount === repeatCount) {
            return;
        }
        this.repeatCount = repeatCount;
        this._updateMessageRepeatCount();
    }
    _updateMessageRepeatCount() {
        this.repeatCountElement.textContent = String(this.repeatCount);
        const showRepeatCount = this.repeatCount > 1;
        this.repeatCountElement.classList.toggle('hidden', !showRepeatCount);
        this.icon.classList.toggle('hidden', showRepeatCount);
    }
}
const elementToMessageBucket = new WeakMap();
const bookmarkTypeRowBucket = Symbol('bookmarkTypeRowBucket');
export class RowMessageBucket {
    _sourceFrame;
    textEditor;
    _lineHandle;
    _decoration;
    _wave;
    _errorIcon;
    _issueIcon;
    _decorationStartColumn;
    _messagesDescriptionElement;
    _messages;
    _level;
    bookmark;
    iconsElement;
    constructor(sourceFrame, textEditor, editorLineNumber) {
        this._sourceFrame = sourceFrame;
        this.textEditor = textEditor;
        this._lineHandle = textEditor.textEditorPositionHandle(editorLineNumber, 0);
        this._decoration = document.createElement('div');
        this._decoration.classList.add('text-editor-line-decoration');
        elementToMessageBucket.set(this._decoration, this);
        this._wave = this._decoration.createChild('div', 'text-editor-line-decoration-wave');
        this._errorIcon = new IconButton.Icon.Icon();
        this._errorIcon.data = getIconDataForLevel(Workspace.UISourceCode.Message.Level.Warning);
        this._errorIcon.classList.add('text-editor-line-decoration-icon-error');
        this._issueIcon = new IconButton.Icon.Icon();
        this._issueIcon.data = getIconDataForLevel(Workspace.UISourceCode.Message.Level.Issue);
        this._issueIcon.classList.add('text-editor-line-decoration-icon-issue');
        this._issueIcon.addEventListener('click', () => this._issueClickHandler());
        this.iconsElement = document.createElement('span');
        this.iconsElement.append(this._errorIcon);
        this.iconsElement.append(this._issueIcon);
        this.iconsElement.classList.add('text-editor-line-decoration-icon');
        elementToMessageBucket.set(this.iconsElement, this);
        this._decorationStartColumn = null;
        this._messagesDescriptionElement = document.createElement('div');
        this._messagesDescriptionElement.classList.add('text-editor-messages-description-container');
        this._messages = [];
        this._level = null;
    }
    _updateWavePosition(editorLineNumber, columnNumber) {
        editorLineNumber = Math.min(editorLineNumber, this.textEditor.linesCount - 1);
        const lineText = this.textEditor.line(editorLineNumber);
        columnNumber = Math.min(columnNumber, lineText.length);
        const lineIndent = TextUtils.TextUtils.Utils.lineIndent(lineText).length;
        const startColumn = Math.max(columnNumber, lineIndent);
        if (this._decorationStartColumn === startColumn) {
            return;
        }
        if (this._decorationStartColumn !== null) {
            this.textEditor.removeDecoration(this._decoration, editorLineNumber);
        }
        this.textEditor.addDecoration(this._decoration, editorLineNumber, startColumn);
        this._decorationStartColumn = startColumn;
    }
    _messageDescription(levels) {
        this._messagesDescriptionElement.removeChildren();
        UI.Utils.appendStyle(this._messagesDescriptionElement, 'ui/legacy/components/source_frame/messagesPopover.css', { enableLegacyPatching: false });
        for (const message of this._messages.filter(m => levels.has(m.getMessage().level()))) {
            this._messagesDescriptionElement.append(message.element);
        }
        return this._messagesDescriptionElement;
    }
    detachFromEditor() {
        const position = this._lineHandle.resolve();
        if (!position) {
            return;
        }
        const editorLineNumber = position.lineNumber;
        if (this._level) {
            this.textEditor.toggleLineClass(editorLineNumber, getLineClassPerLevel(this._level), false);
        }
        if (this._decorationStartColumn !== null) {
            this.textEditor.removeDecoration(this._decoration, editorLineNumber);
            this._decorationStartColumn = null;
        }
        if (this.bookmark) {
            this.bookmark.clear();
        }
    }
    uniqueMessagesCount() {
        return this._messages.length;
    }
    _issueClickHandler() {
        const firstIssue = this._messages.find(m => m.getMessage().level() === Workspace.UISourceCode.Message.Level.Issue);
        if (firstIssue) {
            firstIssue.callClickHandler();
        }
    }
    addMessage(message) {
        for (let i = 0; i < this._messages.length; ++i) {
            const rowMessage = this._messages[i];
            if (rowMessage.getMessage().isEqual(message)) {
                rowMessage.setRepeatCount(rowMessage.getRepeatCount() + 1);
                return;
            }
        }
        const rowMessage = new RowMessage(message);
        this._messages.push(rowMessage);
        this._updateDecoration();
    }
    removeMessage(message) {
        for (let i = 0; i < this._messages.length; ++i) {
            const rowMessage = this._messages[i];
            if (!rowMessage.getMessage().isEqual(message)) {
                continue;
            }
            rowMessage.setRepeatCount(rowMessage.getRepeatCount() - 1);
            if (!rowMessage.getRepeatCount()) {
                this._messages.splice(i, 1);
            }
            this._updateDecoration();
            return;
        }
    }
    _updateDecoration() {
        if (!this._sourceFrame.isShowing()) {
            return;
        }
        if (this.bookmark) {
            this.bookmark.clear();
        }
        if (!this._messages.length) {
            return;
        }
        const position = this._lineHandle.resolve();
        if (!position) {
            return;
        }
        const editorLineNumber = position.lineNumber;
        let columnNumber = Number.MAX_VALUE;
        let maxMessage = null;
        let maxIssueKind = IssuesManager.Issue.IssueKind.Improvement;
        let showIssues = false;
        let showErrors = false;
        for (let i = 0; i < this._messages.length; ++i) {
            const message = this._messages[i].getMessage();
            const { columnNumber: editorColumnNumber } = this._sourceFrame.uiLocationToEditorLocation(editorLineNumber, message.columnNumber());
            columnNumber = Math.min(columnNumber, editorColumnNumber);
            if (!maxMessage || messageLevelComparator(maxMessage, message) < 0) {
                maxMessage = message;
            }
            if (message instanceof IssuesManager.SourceFrameIssuesManager.IssueMessage) {
                maxIssueKind = IssuesManager.Issue.unionIssueKind(maxIssueKind, message.getIssueKind());
            }
            showIssues = showIssues || message.level() === Workspace.UISourceCode.Message.Level.Issue;
            showErrors = showErrors || message.level() !== Workspace.UISourceCode.Message.Level.Issue;
        }
        this._updateWavePosition(editorLineNumber, columnNumber);
        if (!maxMessage) {
            return;
        }
        if (this._level) {
            this.textEditor.toggleLineClass(editorLineNumber, getLineClassPerLevel(this._level), false);
        }
        this._level = maxMessage.level();
        if (!this._level) {
            return;
        }
        this.textEditor.toggleLineClass(editorLineNumber, getLineClassPerLevel(this._level), true);
        this._errorIcon.data = getIconDataForLevel(this._level);
        this._issueIcon
            .data = { ...IssueCounter.IssueCounter.getIssueKindIconData(maxIssueKind), width: '12px', height: '12px' };
        this._issueIcon.classList.toggle('hidden', !showIssues);
        this._errorIcon.classList.toggle('hidden', !showErrors);
        if (showIssues || showErrors) {
            this.bookmark = this.textEditor.addBookmark(editorLineNumber, Number.MAX_SAFE_INTEGER, this.iconsElement, bookmarkTypeRowBucket);
        }
    }
    getPopoverMessages(eventTarget) {
        let messagesOutline = null;
        if (eventTarget.classList.contains('text-editor-line-decoration-icon-error')) {
            messagesOutline = this._messageDescription(new Set([Workspace.UISourceCode.Message.Level.Error, Workspace.UISourceCode.Message.Level.Warning]));
        }
        else if (eventTarget.classList.contains('text-editor-line-decoration-icon-issue')) {
            messagesOutline = this._messageDescription(new Set([Workspace.UISourceCode.Message.Level.Issue]));
        }
        else if (eventTarget.classList.contains('text-editor-line-decoration-wave') &&
            !eventTarget.classList.contains('text-editor-line-decoration-icon')) {
            messagesOutline = this._messageDescription(new Set([Workspace.UISourceCode.Message.Level.Error, Workspace.UISourceCode.Message.Level.Warning]));
        }
        return messagesOutline;
    }
    static getPopover(eventTarget, mouseEvent) {
        const enclosingNode = eventTarget.enclosingNodeOrSelfWithClass('text-editor-line-decoration') ||
            eventTarget.enclosingNodeOrSelfWithClass('text-editor-line-decoration-icon');
        const messageBucket = elementToMessageBucket.get(enclosingNode);
        if (!messageBucket) {
            return null;
        }
        const anchorElement = eventTarget.enclosingNodeOrSelfWithClass('text-editor-line-decoration-icon-error') ||
            eventTarget.enclosingNodeOrSelfWithClass('text-editor-line-decoration-icon-issue');
        const anchor = anchorElement ? anchorElement.boxInWindow() : new AnchorBox(mouseEvent.clientX, mouseEvent.clientY, 1, 1);
        const messagesOutline = messageBucket.getPopoverMessages(eventTarget);
        if (!messagesOutline) {
            return null;
        }
        return {
            box: anchor,
            hide() { },
            show: (popover) => {
                popover.contentElement.append(messagesOutline);
                return Promise.resolve(true);
            },
        };
    }
}
function messageLevelComparator(a, b) {
    const messageLevelPriority = {
        [Workspace.UISourceCode.Message.Level.Issue]: 2,
        [Workspace.UISourceCode.Message.Level.Warning]: 3,
        [Workspace.UISourceCode.Message.Level.Error]: 4,
    };
    return messageLevelPriority[a.level()] - messageLevelPriority[b.level()];
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ToolbarItemsChanged"] = "ToolbarItemsChanged";
})(Events || (Events = {}));
//# sourceMappingURL=UISourceCodeFrame.js.map