// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as DOMExtension from '../../core/dom_extension/dom_extension.js';
import * as Platform from '../../core/platform/platform.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as ARIAUtils from './ARIAUtils.js';
import { SuggestBox } from './SuggestBox.js'; // eslint-disable-line no-unused-vars
import { Tooltip } from './Tooltip.js';
import { ElementFocusRestorer } from './UIUtils.js';
import { appendStyle } from './utils/append-style.js';
export class TextPrompt extends Common.ObjectWrapper.ObjectWrapper {
    _proxyElement;
    _proxyElementDisplay;
    _autocompletionTimeout;
    _title;
    _queryRange;
    _previousText;
    _currentSuggestion;
    _completionRequestId;
    _ghostTextElement;
    _leftParenthesesIndices;
    _loadCompletions;
    _completionStopCharacters;
    _usesSuggestionBuilder;
    _element;
    _boundOnKeyDown;
    _boundOnInput;
    _boundOnMouseWheel;
    _boundClearAutocomplete;
    _contentElement;
    _suggestBox;
    _isEditing;
    _focusRestorer;
    _blurListener;
    _oldTabIndex;
    _completeTimeout;
    _disableDefaultSuggestionForEmptyInput;
    constructor() {
        super();
        this._proxyElementDisplay = 'inline-block';
        this._autocompletionTimeout = DefaultAutocompletionTimeout;
        this._title = '';
        this._queryRange = null;
        this._previousText = '';
        this._currentSuggestion = null;
        this._completionRequestId = 0;
        this._ghostTextElement = document.createElement('span');
        this._ghostTextElement.classList.add('auto-complete-text');
        this._ghostTextElement.setAttribute('contenteditable', 'false');
        this._leftParenthesesIndices = [];
        ARIAUtils.markAsHidden(this._ghostTextElement);
    }
    initialize(completions, stopCharacters, usesSuggestionBuilder) {
        this._loadCompletions = completions;
        this._completionStopCharacters = stopCharacters || ' =:[({;,!+-*/&|^<>.';
        this._usesSuggestionBuilder = usesSuggestionBuilder || false;
    }
    setAutocompletionTimeout(timeout) {
        this._autocompletionTimeout = timeout;
    }
    renderAsBlock() {
        this._proxyElementDisplay = 'block';
    }
    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events.
     */
    attach(element) {
        return this._attachInternal(element);
    }
    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events
     * or the |blurListener| parameter to register a "blur" event listener on the |element|
     * (since the "blur" event does not bubble.)
     */
    attachAndStartEditing(element, blurListener) {
        const proxyElement = this._attachInternal(element);
        this._startEditing(blurListener);
        return proxyElement;
    }
    _attachInternal(element) {
        if (this._proxyElement) {
            throw 'Cannot attach an attached TextPrompt';
        }
        this._element = element;
        this._boundOnKeyDown = this.onKeyDown.bind(this);
        this._boundOnInput = this.onInput.bind(this);
        this._boundOnMouseWheel = this.onMouseWheel.bind(this);
        this._boundClearAutocomplete = this.clearAutocomplete.bind(this);
        this._proxyElement = element.ownerDocument.createElement('span');
        appendStyle(this._proxyElement, 'ui/legacy/textPrompt.css', { enableLegacyPatching: false });
        this._contentElement = this._proxyElement.createChild('div', 'text-prompt-root');
        this._proxyElement.style.display = this._proxyElementDisplay;
        if (element.parentElement) {
            element.parentElement.insertBefore(this._proxyElement, element);
        }
        this._contentElement.appendChild(element);
        this._element.classList.add('text-prompt');
        ARIAUtils.markAsTextBox(this._element);
        ARIAUtils.setAutocomplete(this._element, ARIAUtils.AutocompleteInteractionModel.both);
        ARIAUtils.setHasPopup(this._element, "listbox" /* ListBox */);
        this._element.setAttribute('contenteditable', 'plaintext-only');
        this.element().addEventListener('keydown', this._boundOnKeyDown, false);
        this._element.addEventListener('input', this._boundOnInput, false);
        this._element.addEventListener('wheel', this._boundOnMouseWheel, false);
        this._element.addEventListener('selectstart', this._boundClearAutocomplete, false);
        this._element.addEventListener('blur', this._boundClearAutocomplete, false);
        this._suggestBox = new SuggestBox(this, 20);
        if (this._title) {
            Tooltip.install(this._proxyElement, this._title);
        }
        return this._proxyElement;
    }
    element() {
        if (!this._element) {
            throw new Error('Expected an already attached element!');
        }
        return /** @type {!HTMLElement} */ this._element;
    }
    detach() {
        this._removeFromElement();
        if (this._focusRestorer) {
            this._focusRestorer.restore();
        }
        if (this._proxyElement && this._proxyElement.parentElement) {
            this._proxyElement.parentElement.insertBefore(this.element(), this._proxyElement);
            this._proxyElement.remove();
        }
        delete this._proxyElement;
        this.element().classList.remove('text-prompt');
        this.element().removeAttribute('contenteditable');
        this.element().removeAttribute('role');
        ARIAUtils.clearAutocomplete(this.element());
        ARIAUtils.setHasPopup(this.element(), "false" /* False */);
    }
    textWithCurrentSuggestion() {
        const text = this.text();
        if (!this._queryRange || !this._currentSuggestion) {
            return text;
        }
        const suggestion = this._currentSuggestion.text;
        return text.substring(0, this._queryRange.startColumn) + suggestion + text.substring(this._queryRange.endColumn);
    }
    text() {
        let text = this.element().textContent || '';
        if (this._ghostTextElement.parentNode) {
            const addition = this._ghostTextElement.textContent || '';
            text = text.substring(0, text.length - addition.length);
        }
        return text;
    }
    setText(text) {
        this.clearAutocomplete();
        this.element().textContent = text;
        this._previousText = this.text();
        if (this.element().hasFocus()) {
            this.moveCaretToEndOfPrompt();
            this.element().scrollIntoView();
        }
    }
    setSelectedRange(startIndex, endIndex) {
        if (startIndex < 0) {
            throw new RangeError('Selected range start must be a nonnegative integer');
        }
        const textContent = this.element().textContent;
        const textContentLength = textContent ? textContent.length : 0;
        if (endIndex > textContentLength) {
            endIndex = textContentLength;
        }
        if (endIndex < startIndex) {
            endIndex = startIndex;
        }
        const textNode = this.element().childNodes[0];
        const range = new Range();
        range.setStart(textNode, startIndex);
        range.setEnd(textNode, endIndex);
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    focus() {
        this.element().focus();
    }
    title() {
        return this._title;
    }
    setTitle(title) {
        this._title = title;
        if (this._proxyElement) {
            Tooltip.install(this._proxyElement, title);
        }
    }
    setPlaceholder(placeholder, ariaPlaceholder) {
        if (placeholder) {
            this.element().setAttribute('data-placeholder', placeholder);
            // TODO(https://github.com/nvaccess/nvda/issues/10164): Remove ariaPlaceholder once the NVDA bug is fixed
            // ariaPlaceholder and placeholder may differ, like in case the placeholder contains a '?'
            ARIAUtils.setPlaceholder(this.element(), ariaPlaceholder || placeholder);
        }
        else {
            this.element().removeAttribute('data-placeholder');
            ARIAUtils.setPlaceholder(this.element(), null);
        }
    }
    setEnabled(enabled) {
        if (enabled) {
            this.element().setAttribute('contenteditable', 'plaintext-only');
        }
        else {
            this.element().removeAttribute('contenteditable');
        }
        this.element().classList.toggle('disabled', !enabled);
    }
    _removeFromElement() {
        this.clearAutocomplete();
        this.element().removeEventListener('keydown', this._boundOnKeyDown, false);
        this.element().removeEventListener('input', this._boundOnInput, false);
        this.element().removeEventListener('selectstart', this._boundClearAutocomplete, false);
        this.element().removeEventListener('blur', this._boundClearAutocomplete, false);
        if (this._isEditing) {
            this._stopEditing();
        }
        if (this._suggestBox) {
            this._suggestBox.hide();
        }
    }
    _startEditing(blurListener) {
        this._isEditing = true;
        if (this._contentElement) {
            this._contentElement.classList.add('text-prompt-editing');
        }
        this._focusRestorer = new ElementFocusRestorer(this.element());
        if (blurListener) {
            this._blurListener = blurListener;
            this.element().addEventListener('blur', this._blurListener, false);
        }
        this._oldTabIndex = this.element().tabIndex;
        if (this.element().tabIndex < 0) {
            this.element().tabIndex = 0;
        }
        if (!this.text()) {
            this.autoCompleteSoon();
        }
    }
    _stopEditing() {
        this.element().tabIndex = this._oldTabIndex;
        if (this._blurListener) {
            this.element().removeEventListener('blur', this._blurListener, false);
        }
        if (this._contentElement) {
            this._contentElement.classList.remove('text-prompt-editing');
        }
        delete this._isEditing;
    }
    onMouseWheel(_event) {
        // Subclasses can implement.
    }
    onKeyDown(ev) {
        let handled = false;
        const event = ev;
        if (this.isSuggestBoxVisible() && this._suggestBox && this._suggestBox.keyPressed(event)) {
            event.consume(true);
            return;
        }
        switch (event.key) {
            case 'Tab':
                handled = this.tabKeyPressed(event);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
            case 'Home':
                this.clearAutocomplete();
                break;
            case 'PageDown':
            case 'ArrowRight':
            case 'ArrowDown':
            case 'End':
                if (this._isCaretAtEndOfPrompt()) {
                    handled = this.acceptAutoComplete();
                }
                else {
                    this.clearAutocomplete();
                }
                break;
            case 'Escape':
                if (this.isSuggestBoxVisible()) {
                    this.clearAutocomplete();
                    handled = true;
                }
                break;
            case ' ': // Space
                if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
                    this.autoCompleteSoon(true);
                    handled = true;
                }
                break;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
        }
        if (handled) {
            event.consume(true);
        }
    }
    _acceptSuggestionOnStopCharacters(key) {
        if (!this._currentSuggestion || !this._queryRange || key.length !== 1 || !this._completionStopCharacters ||
            !this._completionStopCharacters.includes(key)) {
            return false;
        }
        const query = this.text().substring(this._queryRange.startColumn, this._queryRange.endColumn);
        if (query && this._currentSuggestion.text.startsWith(query + key)) {
            this._queryRange.endColumn += 1;
            return this.acceptAutoComplete();
        }
        return false;
    }
    onInput(ev) {
        const event = ev;
        let text = this.text();
        const currentEntry = event.data;
        if (event.inputType === 'insertFromPaste' && text.includes('\n')) {
            /* Ensure that we remove any linebreaks from copied/pasted content
             * to avoid breaking the rendering of the filter bar.
             * See crbug.com/849563.
             * We don't let users enter linebreaks when
             * typing manually, so we should escape them if copying text in.
             */
            text = Platform.StringUtilities.stripLineBreaks(text);
            this.setText(text);
        }
        // Skip the current ')' entry if the caret is right before a ')' and there's an unmatched '('.
        const caretPosition = this._getCaretPosition();
        if (currentEntry === ')' && caretPosition >= 0 && this._leftParenthesesIndices.length > 0) {
            const nextCharAtCaret = text[caretPosition];
            if (nextCharAtCaret === ')' && this._tryMatchingLeftParenthesis(caretPosition)) {
                text = text.substring(0, caretPosition) + text.substring(caretPosition + 1);
                this.setText(text);
                return;
            }
        }
        if (currentEntry && !this._acceptSuggestionOnStopCharacters(currentEntry)) {
            const hasCommonPrefix = text.startsWith(this._previousText) || this._previousText.startsWith(text);
            if (this._queryRange && hasCommonPrefix) {
                this._queryRange.endColumn += text.length - this._previousText.length;
            }
        }
        this._refreshGhostText();
        this._previousText = text;
        this.dispatchEventToListeners(Events.TextChanged);
        this.autoCompleteSoon();
    }
    acceptAutoComplete() {
        let result = false;
        if (this.isSuggestBoxVisible() && this._suggestBox) {
            result = this._suggestBox.acceptSuggestion();
        }
        if (!result) {
            result = this._acceptSuggestionInternal();
        }
        if (this._usesSuggestionBuilder && result) {
            // Trigger autocompletions for text prompts using suggestion builders
            this.autoCompleteSoon();
        }
        return result;
    }
    clearAutocomplete() {
        const beforeText = this.textWithCurrentSuggestion();
        if (this.isSuggestBoxVisible() && this._suggestBox) {
            this._suggestBox.hide();
        }
        this._clearAutocompleteTimeout();
        this._queryRange = null;
        this._refreshGhostText();
        if (beforeText !== this.textWithCurrentSuggestion()) {
            this.dispatchEventToListeners(Events.TextChanged);
        }
    }
    _refreshGhostText() {
        if (this._currentSuggestion && this._currentSuggestion.hideGhostText) {
            this._ghostTextElement.remove();
            return;
        }
        if (this._queryRange && this._currentSuggestion && this._isCaretAtEndOfPrompt() &&
            this._currentSuggestion.text.startsWith(this.text().substring(this._queryRange.startColumn))) {
            this._ghostTextElement.textContent =
                this._currentSuggestion.text.substring(this._queryRange.endColumn - this._queryRange.startColumn);
            this.element().appendChild(this._ghostTextElement);
        }
        else {
            this._ghostTextElement.remove();
        }
    }
    _clearAutocompleteTimeout() {
        if (this._completeTimeout) {
            clearTimeout(this._completeTimeout);
            delete this._completeTimeout;
        }
        this._completionRequestId++;
    }
    autoCompleteSoon(force) {
        const immediately = this.isSuggestBoxVisible() || force;
        if (!this._completeTimeout) {
            this._completeTimeout =
                setTimeout(this.complete.bind(this, force), immediately ? 0 : this._autocompletionTimeout);
        }
    }
    async complete(force) {
        this._clearAutocompleteTimeout();
        const selection = this.element().getComponentSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }
        const selectionRange = selection.getRangeAt(0);
        let shouldExit;
        if (!force && !this._isCaretAtEndOfPrompt() && !this.isSuggestBoxVisible()) {
            shouldExit = true;
        }
        else if (!selection.isCollapsed) {
            shouldExit = true;
        }
        if (shouldExit) {
            this.clearAutocomplete();
            return;
        }
        const wordQueryRange = DOMExtension.DOMExtension.rangeOfWord(selectionRange.startContainer, selectionRange.startOffset, this._completionStopCharacters, this.element(), 'backward');
        const expressionRange = wordQueryRange.cloneRange();
        expressionRange.collapse(true);
        expressionRange.setStartBefore(this.element());
        const completionRequestId = ++this._completionRequestId;
        const completions = await this._loadCompletions.call(null, expressionRange.toString(), wordQueryRange.toString(), Boolean(force));
        this._completionsReady(completionRequestId, selection, wordQueryRange, Boolean(force), completions);
    }
    disableDefaultSuggestionForEmptyInput() {
        this._disableDefaultSuggestionForEmptyInput = true;
    }
    _boxForAnchorAtStart(selection, textRange) {
        const rangeCopy = selection.getRangeAt(0).cloneRange();
        const anchorElement = document.createElement('span');
        anchorElement.textContent = '\u200B';
        textRange.insertNode(anchorElement);
        const box = anchorElement.boxInWindow(window);
        anchorElement.remove();
        selection.removeAllRanges();
        selection.addRange(rangeCopy);
        return box;
    }
    additionalCompletions(_query) {
        return [];
    }
    _completionsReady(completionRequestId, selection, originalWordQueryRange, force, completions) {
        if (this._completionRequestId !== completionRequestId) {
            return;
        }
        const query = originalWordQueryRange.toString();
        // Filter out dupes.
        const store = new Set();
        completions = completions.filter(item => !store.has(item.text) && Boolean(store.add(item.text)));
        if (query || force) {
            if (query) {
                completions = completions.concat(this.additionalCompletions(query));
            }
            else {
                completions = this.additionalCompletions(query).concat(completions);
            }
        }
        if (!completions.length) {
            this.clearAutocomplete();
            return;
        }
        const selectionRange = selection.getRangeAt(0);
        const fullWordRange = document.createRange();
        fullWordRange.setStart(originalWordQueryRange.startContainer, originalWordQueryRange.startOffset);
        fullWordRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
        if (query + selectionRange.toString() !== fullWordRange.toString()) {
            return;
        }
        const beforeRange = document.createRange();
        beforeRange.setStart(this.element(), 0);
        beforeRange.setEnd(fullWordRange.startContainer, fullWordRange.startOffset);
        this._queryRange = new TextUtils.TextRange.TextRange(0, beforeRange.toString().length, 0, beforeRange.toString().length + fullWordRange.toString().length);
        const shouldSelect = !this._disableDefaultSuggestionForEmptyInput || Boolean(this.text());
        if (this._suggestBox) {
            this._suggestBox.updateSuggestions(this._boxForAnchorAtStart(selection, fullWordRange), completions, shouldSelect, !this._isCaretAtEndOfPrompt(), this.text());
        }
    }
    applySuggestion(suggestion, isIntermediateSuggestion) {
        this._currentSuggestion = suggestion;
        this._refreshGhostText();
        if (isIntermediateSuggestion) {
            this.dispatchEventToListeners(Events.TextChanged);
        }
    }
    acceptSuggestion() {
        this._acceptSuggestionInternal();
    }
    _acceptSuggestionInternal() {
        if (!this._queryRange) {
            return false;
        }
        const suggestionLength = this._currentSuggestion ? this._currentSuggestion.text.length : 0;
        const selectionRange = this._currentSuggestion ? this._currentSuggestion.selectionRange : null;
        const endColumn = selectionRange ? selectionRange.endColumn : suggestionLength;
        const startColumn = selectionRange ? selectionRange.startColumn : suggestionLength;
        this.element().textContent = this.textWithCurrentSuggestion();
        this.setDOMSelection(this._queryRange.startColumn + startColumn, this._queryRange.startColumn + endColumn);
        this._updateLeftParenthesesIndices();
        this.clearAutocomplete();
        this.dispatchEventToListeners(Events.TextChanged);
        return true;
    }
    ariaControlledBy() {
        return this.element();
    }
    setDOMSelection(startColumn, endColumn) {
        this.element().normalize();
        const node = this.element().childNodes[0];
        if (!node || node === this._ghostTextElement) {
            return;
        }
        const range = document.createRange();
        range.setStart(node, startColumn);
        range.setEnd(node, endColumn);
        const selection = this.element().getComponentSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    isSuggestBoxVisible() {
        return this._suggestBox !== undefined && this._suggestBox.visible();
    }
    isCaretInsidePrompt() {
        const selection = this.element().getComponentSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
            return false;
        }
        // @see crbug.com/602541
        const selectionRange = selection.getRangeAt(0);
        return selectionRange.startContainer.isSelfOrDescendant(this.element());
    }
    _isCaretAtEndOfPrompt() {
        const selection = this.element().getComponentSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
            return false;
        }
        const selectionRange = selection.getRangeAt(0);
        let node = selectionRange.startContainer;
        if (!node.isSelfOrDescendant(this.element())) {
            return false;
        }
        if (this._ghostTextElement.isAncestor(node)) {
            return true;
        }
        if (node.nodeType === Node.TEXT_NODE && selectionRange.startOffset < (node.nodeValue || '').length) {
            return false;
        }
        let foundNextText = false;
        while (node) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.length) {
                if (foundNextText && !this._ghostTextElement.isAncestor(node)) {
                    return false;
                }
                foundNextText = true;
            }
            node = node.traverseNextNode(this._element);
        }
        return true;
    }
    moveCaretToEndOfPrompt() {
        const selection = this.element().getComponentSelection();
        const selectionRange = document.createRange();
        let container = this.element();
        while (container.lastChild) {
            container = container.lastChild;
        }
        let offset = 0;
        if (container.nodeType === Node.TEXT_NODE) {
            const textNode = container;
            offset = (textNode.textContent || '').length;
        }
        selectionRange.setStart(container, offset);
        selectionRange.setEnd(container, offset);
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(selectionRange);
        }
    }
    /** -1 if no caret can be found in text prompt
       */
    _getCaretPosition() {
        if (!this.element().hasFocus()) {
            return -1;
        }
        const selection = this.element().getComponentSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
            return -1;
        }
        const selectionRange = selection.getRangeAt(0);
        if (selectionRange.startOffset !== selectionRange.endOffset) {
            return -1;
        }
        return selectionRange.startOffset;
    }
    tabKeyPressed(_event) {
        return this.acceptAutoComplete();
    }
    proxyElementForTests() {
        return this._proxyElement || null;
    }
    /**
     * Try matching the most recent open parenthesis with the given right
     * parenthesis, and closes the matched left parenthesis if found.
     * Return the result of the matching.
     */
    _tryMatchingLeftParenthesis(rightParenthesisIndex) {
        const leftParenthesesIndices = this._leftParenthesesIndices;
        if (leftParenthesesIndices.length === 0 || rightParenthesisIndex < 0) {
            return false;
        }
        for (let i = leftParenthesesIndices.length - 1; i >= 0; --i) {
            if (leftParenthesesIndices[i] < rightParenthesisIndex) {
                leftParenthesesIndices.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    _updateLeftParenthesesIndices() {
        const text = this.text();
        const leftParenthesesIndices = this._leftParenthesesIndices = [];
        for (let i = 0; i < text.length; ++i) {
            if (text[i] === '(') {
                leftParenthesesIndices.push(i);
            }
        }
    }
}
const DefaultAutocompletionTimeout = 250;
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["TextChanged"] = "TextChanged";
})(Events || (Events = {}));
//# sourceMappingURL=TextPrompt.js.map