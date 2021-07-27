// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as TextEditor from '../../ui/legacy/components/text_editor/text_editor.js'; // eslint-disable-line no-unused-vars
import * as UI from '../../ui/legacy/legacy.js';
import { ConsolePanel } from './ConsolePanel.js';
const UIStrings = {
    /**
    *@description Text in Console Prompt of the Console panel
    */
    consolePrompt: 'Console prompt',
};
const str_ = i18n.i18n.registerUIStrings('panels/console/ConsolePrompt.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ConsolePrompt extends UI.Widget.Widget {
    _addCompletionsFromHistory;
    _history;
    _initialText;
    _editor;
    _eagerPreviewElement;
    _textChangeThrottler;
    _formatter;
    _requestPreviewBound;
    _innerPreviewElement;
    _promptIcon;
    _iconThrottler;
    _eagerEvalSetting;
    _previewRequestForTest;
    _defaultAutocompleteConfig;
    _highlightingNode;
    constructor() {
        super();
        this.registerRequiredCSS('panels/console/consolePrompt.css', { enableLegacyPatching: false });
        this._addCompletionsFromHistory = true;
        this._history = new ConsoleHistoryManager();
        this._initialText = '';
        this._editor = null;
        this._eagerPreviewElement = document.createElement('div');
        this._eagerPreviewElement.classList.add('console-eager-preview');
        this._textChangeThrottler = new Common.Throttler.Throttler(150);
        this._formatter = new ObjectUI.RemoteObjectPreviewFormatter.RemoteObjectPreviewFormatter();
        this._requestPreviewBound = this._requestPreview.bind(this);
        this._innerPreviewElement = this._eagerPreviewElement.createChild('div', 'console-eager-inner-preview');
        this._eagerPreviewElement.appendChild(UI.Icon.Icon.create('smallicon-command-result', 'preview-result-icon'));
        const editorContainerElement = this.element.createChild('div', 'console-prompt-editor-container');
        this.element.appendChild(this._eagerPreviewElement);
        this._promptIcon = UI.Icon.Icon.create('smallicon-text-prompt', 'console-prompt-icon');
        this.element.appendChild(this._promptIcon);
        this._iconThrottler = new Common.Throttler.Throttler(0);
        this._eagerEvalSetting = Common.Settings.Settings.instance().moduleSetting('consoleEagerEval');
        this._eagerEvalSetting.addChangeListener(this._eagerSettingChanged.bind(this));
        this._eagerPreviewElement.classList.toggle('hidden', !this._eagerEvalSetting.get());
        this.element.tabIndex = 0;
        this._previewRequestForTest = null;
        this._defaultAutocompleteConfig = null;
        this._highlightingNode = false;
        const factory = TextEditor.CodeMirrorTextEditor.CodeMirrorTextEditorFactory.instance();
        const options = {
            devtoolsAccessibleName: i18nString(UIStrings.consolePrompt),
            lineNumbers: false,
            lineWrapping: true,
            mimeType: 'javascript',
            autoHeight: true,
        };
        this._editor = factory.createEditor(options);
        this._defaultAutocompleteConfig =
            ObjectUI.JavaScriptAutocomplete.JavaScriptAutocompleteConfig.createConfigForEditor(this._editor);
        this._editor.configureAutocomplete(Object.assign({}, this._defaultAutocompleteConfig, {
            suggestionsCallback: this._wordsWithQuery.bind(this),
            anchorBehavior: UI.GlassPane.AnchorBehavior.PreferTop,
        }));
        this._editor.widget().element.addEventListener('keydown', this._editorKeyDown.bind(this), true);
        this._editor.widget().show(editorContainerElement);
        this._editor.addEventListener(UI.TextEditor.Events.CursorChanged, this._updatePromptIcon, this);
        this._editor.addEventListener(UI.TextEditor.Events.TextChanged, this._onTextChanged, this);
        this._editor.addEventListener(UI.TextEditor.Events.SuggestionChanged, this._onTextChanged, this);
        this.setText(this._initialText);
        this._initialText = '';
        if (this.hasFocus()) {
            this.focus();
        }
        this.element.removeAttribute('tabindex');
        this._editor.widget().element.tabIndex = -1;
        this._editorSetForTest();
        // Record the console tool load time after the console prompt constructor is complete.
        Host.userMetrics.panelLoaded('console', 'DevTools.Launch.Console');
    }
    _eagerSettingChanged() {
        const enabled = this._eagerEvalSetting.get();
        this._eagerPreviewElement.classList.toggle('hidden', !enabled);
        if (enabled) {
            this._requestPreview();
        }
    }
    belowEditorElement() {
        return this._eagerPreviewElement;
    }
    _onTextChanged() {
        // ConsoleView and prompt both use a throttler, so we clear the preview
        // ASAP to avoid inconsistency between a fresh viewport and stale preview.
        if (this._eagerEvalSetting.get()) {
            const asSoonAsPossible = !this._editor || !this._editor.textWithCurrentSuggestion();
            this._previewRequestForTest = this._textChangeThrottler.schedule(this._requestPreviewBound, asSoonAsPossible);
        }
        this._updatePromptIcon();
        this.dispatchEventToListeners("TextChanged" /* TextChanged */);
    }
    async _requestPreview() {
        if (!this._editor) {
            return;
        }
        const text = this._editor.textWithCurrentSuggestion().trim();
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        const { preview, result } = await ObjectUI.JavaScriptREPL.JavaScriptREPL.evaluateAndBuildPreview(text, true /* throwOnSideEffect */, 500);
        this._innerPreviewElement.removeChildren();
        if (preview.deepTextContent() !== this._editor.textWithCurrentSuggestion().trim()) {
            this._innerPreviewElement.appendChild(preview);
        }
        if (result && 'object' in result && result.object && result.object.subtype === 'node') {
            this._highlightingNode = true;
            SDK.OverlayModel.OverlayModel.highlightObjectAsDOMNode(result.object);
        }
        else if (this._highlightingNode) {
            this._highlightingNode = false;
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        }
        if (result && executionContext) {
            executionContext.runtimeModel.releaseEvaluationResult(result);
        }
    }
    willHide() {
        if (this._highlightingNode) {
            this._highlightingNode = false;
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        }
    }
    history() {
        return this._history;
    }
    clearAutocomplete() {
        if (this._editor) {
            this._editor.clearAutocomplete();
        }
    }
    _isCaretAtEndOfPrompt() {
        return this._editor !== null &&
            this._editor.selection().collapseToEnd().equal(this._editor.fullRange().collapseToEnd());
    }
    moveCaretToEndOfPrompt() {
        if (this._editor) {
            this._editor.setSelection(TextUtils.TextRange.TextRange.createFromLocation(Infinity, Infinity));
        }
    }
    setText(text) {
        if (this._editor) {
            this._editor.setText(text);
        }
        else {
            this._initialText = text;
        }
        this.dispatchEventToListeners("TextChanged" /* TextChanged */);
    }
    text() {
        return this._editor ? this._editor.text() : this._initialText;
    }
    setAddCompletionsFromHistory(value) {
        this._addCompletionsFromHistory = value;
    }
    _editorKeyDown(event) {
        if (!this._editor) {
            return;
        }
        const keyboardEvent = event;
        let newText;
        let isPrevious;
        // Check against visual coordinates in case lines wrap.
        const selection = this._editor.selection();
        const cursorY = this._editor.visualCoordinates(selection.endLine, selection.endColumn).y;
        switch (keyboardEvent.keyCode) {
            case UI.KeyboardShortcut.Keys.Up.code: {
                const startY = this._editor.visualCoordinates(0, 0).y;
                if (keyboardEvent.shiftKey || !selection.isEmpty() || cursorY !== startY) {
                    break;
                }
                newText = this._history.previous(this.text());
                isPrevious = true;
                break;
            }
            case UI.KeyboardShortcut.Keys.Down.code: {
                const fullRange = this._editor.fullRange();
                const endY = this._editor.visualCoordinates(fullRange.endLine, fullRange.endColumn).y;
                if (keyboardEvent.shiftKey || !selection.isEmpty() || cursorY !== endY) {
                    break;
                }
                newText = this._history.next();
                break;
            }
            case UI.KeyboardShortcut.Keys.P.code: { // Ctrl+P = Previous
                if (Host.Platform.isMac() && keyboardEvent.ctrlKey && !keyboardEvent.metaKey && !keyboardEvent.altKey &&
                    !keyboardEvent.shiftKey) {
                    newText = this._history.previous(this.text());
                    isPrevious = true;
                }
                break;
            }
            case UI.KeyboardShortcut.Keys.N.code: { // Ctrl+N = Next
                if (Host.Platform.isMac() && keyboardEvent.ctrlKey && !keyboardEvent.metaKey && !keyboardEvent.altKey &&
                    !keyboardEvent.shiftKey) {
                    newText = this._history.next();
                }
                break;
            }
            case UI.KeyboardShortcut.Keys.Enter.code: {
                this._enterKeyPressed(keyboardEvent);
                break;
            }
            case UI.KeyboardShortcut.Keys.Tab.code: {
                if (!this.text()) {
                    keyboardEvent.consume();
                }
                break;
            }
        }
        if (newText === undefined) {
            return;
        }
        keyboardEvent.consume(true);
        this.setText(newText);
        if (isPrevious) {
            this._editor.setSelection(TextUtils.TextRange.TextRange.createFromLocation(0, Infinity));
        }
        else {
            this.moveCaretToEndOfPrompt();
        }
    }
    async _enterWillEvaluate() {
        if (!this._isCaretAtEndOfPrompt()) {
            return true;
        }
        return await ObjectUI.JavaScriptAutocomplete.JavaScriptAutocomplete.isExpressionComplete(this.text());
    }
    _updatePromptIcon() {
        this._iconThrottler.schedule(async () => {
            const canComplete = await this._enterWillEvaluate();
            this._promptIcon.classList.toggle('console-prompt-incomplete', !canComplete);
        });
    }
    async _enterKeyPressed(event) {
        if (event.altKey || event.ctrlKey || event.shiftKey) {
            return;
        }
        event.consume(true);
        // Since we prevent default, manually emulate the native "scroll on key input" behavior.
        this.element.scrollIntoView();
        this.clearAutocomplete();
        const str = this.text();
        if (!str.length) {
            return;
        }
        if (await this._enterWillEvaluate()) {
            await this._appendCommand(str, true);
        }
        else if (this._editor) {
            this._editor.newlineAndIndent();
        }
        this._enterProcessedForTest();
    }
    async _appendCommand(text, useCommandLineAPI) {
        this.setText('');
        const currentExecutionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        if (currentExecutionContext) {
            const executionContext = currentExecutionContext;
            const message = SDK.ConsoleModel.ConsoleModel.instance().addCommandMessage(executionContext, text);
            const expression = ObjectUI.JavaScriptREPL.JavaScriptREPL.preprocessExpression(text);
            SDK.ConsoleModel.ConsoleModel.instance().evaluateCommandInConsole(executionContext, message, expression, useCommandLineAPI);
            if (ConsolePanel.instance().isShowing()) {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.CommandEvaluatedInConsolePanel);
            }
        }
    }
    _enterProcessedForTest() {
    }
    _historyCompletions(prefix, force) {
        const text = this.text();
        if (!this._addCompletionsFromHistory || !this._isCaretAtEndOfPrompt() || (!text && !force)) {
            return [];
        }
        const result = [];
        const set = new Set();
        const data = this._history.historyData();
        for (let i = data.length - 1; i >= 0 && result.length < 50; --i) {
            const item = data[i];
            if (!item.startsWith(text)) {
                continue;
            }
            if (set.has(item)) {
                continue;
            }
            set.add(item);
            result.push({ text: item.substring(text.length - prefix.length), iconType: 'smallicon-text-prompt', isSecondary: true });
        }
        return result;
    }
    focus() {
        if (this._editor) {
            this._editor.widget().focus();
        }
        else {
            this.element.focus();
        }
    }
    async _wordsWithQuery(queryRange, substituteRange, force) {
        if (!this._editor || !this._defaultAutocompleteConfig || !this._defaultAutocompleteConfig.suggestionsCallback) {
            return [];
        }
        const query = this._editor.text(queryRange);
        const words = await this._defaultAutocompleteConfig.suggestionsCallback(queryRange, substituteRange, force);
        const historyWords = this._historyCompletions(query, force);
        return words ? words.concat(historyWords) : historyWords;
    }
    _editorSetForTest() {
    }
}
export class ConsoleHistoryManager {
    _data;
    _historyOffset;
    _uncommittedIsTop;
    constructor() {
        this._data = [];
        /**
         * 1-based entry in the history stack.
         */
        this._historyOffset = 1;
    }
    historyData() {
        return this._data;
    }
    setHistoryData(data) {
        this._data = data.slice();
        this._historyOffset = 1;
    }
    /**
     * Pushes a committed text into the history.
     */
    pushHistoryItem(text) {
        if (this._uncommittedIsTop) {
            this._data.pop();
            delete this._uncommittedIsTop;
        }
        this._historyOffset = 1;
        if (text === this._currentHistoryItem()) {
            return;
        }
        this._data.push(text);
    }
    /**
     * Pushes the current (uncommitted) text into the history.
     */
    _pushCurrentText(currentText) {
        if (this._uncommittedIsTop) {
            this._data.pop();
        } // Throw away obsolete uncommitted text.
        this._uncommittedIsTop = true;
        this._data.push(currentText);
    }
    previous(currentText) {
        if (this._historyOffset > this._data.length) {
            return undefined;
        }
        if (this._historyOffset === 1) {
            this._pushCurrentText(currentText);
        }
        ++this._historyOffset;
        return this._currentHistoryItem();
    }
    next() {
        if (this._historyOffset === 1) {
            return undefined;
        }
        --this._historyOffset;
        return this._currentHistoryItem();
    }
    _currentHistoryItem() {
        return this._data[this._data.length - this._historyOffset];
    }
}
//# sourceMappingURL=ConsolePrompt.js.map