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
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as Formatter from '../../../../models/formatter/formatter.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
import { Events, SourcesTextEditor } from './SourcesTextEditor.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Text for the source of something
    */
    source: 'Source',
    /**
    *@description Text to pretty print a file
    */
    prettyPrint: 'Pretty print',
    /**
    *@description Text when something is loading
    */
    loading: 'Loading…',
    /**
    * @description Shown at the bottom of the Sources panel when the user has made multiple
    * simultaneous text selections in the text editor.
    * @example {2} PH1
    */
    dSelectionRegions: '{PH1} selection regions',
    /**
    * @description Position indicator in Source Frame of the Sources panel. The placeholder is a
    * hexadecimal number value, which is why it is prefixed with '0x'.
    * @example {abc} PH1
    */
    bytecodePositionXs: 'Bytecode position `0x`{PH1}',
    /**
    *@description Text in Source Frame of the Sources panel
    *@example {2} PH1
    *@example {2} PH2
    */
    lineSColumnS: 'Line {PH1}, Column {PH2}',
    /**
    *@description Text in Source Frame of the Sources panel
    *@example {2} PH1
    */
    dCharactersSelected: '{PH1} characters selected',
    /**
    *@description Text in Source Frame of the Sources panel
    *@example {2} PH1
    *@example {2} PH2
    */
    dLinesDCharactersSelected: '{PH1} lines, {PH2} characters selected',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/source_frame/SourceFrame.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SourceFrameImpl extends UI.View.SimpleView {
    _lazyContent;
    _pretty;
    _rawContent;
    _formattedContentPromise;
    _formattedMap;
    _prettyToggle;
    _shouldAutoPrettyPrint;
    _progressToolbarItem;
    _textEditor;
    _prettyCleanGeneration;
    _cleanGeneration;
    _searchConfig;
    _delayedFindSearchMatches;
    _currentSearchResultIndex;
    _searchResults;
    _searchRegex;
    _loadError;
    _muteChangeEventsForSetContent;
    _sourcePosition;
    _searchableView;
    _editable;
    _positionToReveal;
    _lineToScrollTo;
    _selectionToSet;
    _loaded;
    _contentRequested;
    _highlighterType;
    _wasmDisassembly;
    contentSet;
    constructor(lazyContent, codeMirrorOptions) {
        super(i18nString(UIStrings.source));
        this._lazyContent = lazyContent;
        this._pretty = false;
        this._rawContent = null;
        this._formattedContentPromise = null;
        this._formattedMap = null;
        this._prettyToggle = new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.prettyPrint), 'largeicon-pretty-print');
        this._prettyToggle.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => {
            this._setPretty(!this._prettyToggle.toggled());
        });
        this._shouldAutoPrettyPrint = false;
        this._prettyToggle.setVisible(false);
        this._progressToolbarItem = new UI.Toolbar.ToolbarItem(document.createElement('div'));
        this._textEditor = new SourcesTextEditor(this, codeMirrorOptions);
        this._textEditor.show(this.element);
        this._prettyCleanGeneration = null;
        this._cleanGeneration = 0;
        this._searchConfig = null;
        this._delayedFindSearchMatches = null;
        this._currentSearchResultIndex = -1;
        this._searchResults = [];
        this._searchRegex = null;
        this._loadError = false;
        this._textEditor.addEventListener(Events.EditorFocused, this._resetCurrentSearchResultIndex, this);
        this._textEditor.addEventListener(Events.SelectionChanged, this._updateSourcePosition, this);
        this._textEditor.addEventListener(UI.TextEditor.Events.TextChanged, event => {
            if (!this._muteChangeEventsForSetContent) {
                this.onTextChanged(event.data.oldRange, event.data.newRange);
            }
        });
        this._muteChangeEventsForSetContent = false;
        this._sourcePosition = new UI.Toolbar.ToolbarText();
        this._searchableView = null;
        this._editable = false;
        this._textEditor.setReadOnly(true);
        this._positionToReveal = null;
        this._lineToScrollTo = null;
        this._selectionToSet = null;
        this._loaded = false;
        this._contentRequested = false;
        this._highlighterType = '';
        this._wasmDisassembly = null;
        this.contentSet = false;
    }
    get wasmDisassembly() {
        return this._wasmDisassembly;
    }
    editorLocationToUILocation(lineNumber, columnNumber) {
        if (this._wasmDisassembly) {
            columnNumber = this._wasmDisassembly.lineNumberToBytecodeOffset(lineNumber);
            lineNumber = 0;
        }
        else if (this._pretty) {
            [lineNumber, columnNumber] = this._prettyToRawLocation(lineNumber, columnNumber);
        }
        return { lineNumber, columnNumber };
    }
    uiLocationToEditorLocation(lineNumber, columnNumber = 0) {
        if (this._wasmDisassembly) {
            lineNumber = this._wasmDisassembly.bytecodeOffsetToLineNumber(columnNumber);
            columnNumber = 0;
        }
        else if (this._pretty) {
            [lineNumber, columnNumber] = this._rawToPrettyLocation(lineNumber, columnNumber);
        }
        return { lineNumber, columnNumber };
    }
    setCanPrettyPrint(canPrettyPrint, autoPrettyPrint) {
        this._shouldAutoPrettyPrint = canPrettyPrint && Boolean(autoPrettyPrint);
        this._prettyToggle.setVisible(canPrettyPrint);
    }
    async _setPretty(value) {
        this._pretty = value;
        this._prettyToggle.setEnabled(false);
        const wasLoaded = this.loaded;
        const selection = this.selection();
        let newSelection;
        if (this._pretty) {
            const formatInfo = await this._requestFormattedContent();
            this._formattedMap = formatInfo.map;
            this.setContent(formatInfo.content, null);
            this._prettyCleanGeneration = this._textEditor.markClean();
            const start = this._rawToPrettyLocation(selection.startLine, selection.startColumn);
            const end = this._rawToPrettyLocation(selection.endLine, selection.endColumn);
            newSelection = new TextUtils.TextRange.TextRange(start[0], start[1], end[0], end[1]);
        }
        else {
            this.setContent(this._rawContent, null);
            this._cleanGeneration = this._textEditor.markClean();
            const start = this._prettyToRawLocation(selection.startLine, selection.startColumn);
            const end = this._prettyToRawLocation(selection.endLine, selection.endColumn);
            newSelection = new TextUtils.TextRange.TextRange(start[0], start[1], end[0], end[1]);
        }
        if (wasLoaded) {
            this.textEditor.revealPosition(newSelection.endLine, newSelection.endColumn, this._editable);
            this.textEditor.setSelection(newSelection);
        }
        this._prettyToggle.setEnabled(true);
        this._updatePrettyPrintState();
    }
    _updateLineNumberFormatter() {
        if (this._wasmDisassembly) {
            const disassembly = this._wasmDisassembly;
            const lastBytecodeOffset = disassembly.lineNumberToBytecodeOffset(disassembly.lineNumbers - 1);
            const bytecodeOffsetDigits = lastBytecodeOffset.toString(16).length + 1;
            this._textEditor.setLineNumberFormatter(lineNumber => {
                const bytecodeOffset = disassembly.lineNumberToBytecodeOffset(lineNumber - 1);
                return `0x${bytecodeOffset.toString(16).padStart(bytecodeOffsetDigits, '0')}`;
            });
        }
        else if (this._pretty) {
            this._textEditor.setLineNumberFormatter(lineNumber => {
                const line = this._prettyToRawLocation(lineNumber - 1, 0)[0] + 1;
                if (lineNumber === 1) {
                    return String(line);
                }
                if (line !== this._prettyToRawLocation(lineNumber - 2, 0)[0] + 1) {
                    return String(line);
                }
                return '-';
            });
        }
        else {
            this._textEditor.setLineNumberFormatter(lineNumber => {
                return String(lineNumber);
            });
        }
    }
    _updatePrettyPrintState() {
        this._prettyToggle.setToggled(this._pretty);
        this._textEditor.element.classList.toggle('pretty-printed', this._pretty);
        this._updateLineNumberFormatter();
    }
    _prettyToRawLocation(line, column = 0) {
        if (!this._formattedMap) {
            return [line, column];
        }
        return this._formattedMap.formattedToOriginal(line, column);
    }
    _rawToPrettyLocation(line, column) {
        if (!this._formattedMap) {
            return [line, column];
        }
        return this._formattedMap.originalToFormatted(line, column);
    }
    setEditable(editable) {
        this._editable = editable;
        if (this._loaded) {
            this._textEditor.setReadOnly(!editable);
        }
    }
    hasLoadError() {
        return this._loadError;
    }
    wasShown() {
        this._ensureContentLoaded();
        this._wasShownOrLoaded();
    }
    willHide() {
        super.willHide();
        this._clearPositionToReveal();
    }
    async toolbarItems() {
        return [this._prettyToggle, this._sourcePosition, this._progressToolbarItem];
    }
    get loaded() {
        return this._loaded;
    }
    get textEditor() {
        return this._textEditor;
    }
    get pretty() {
        return this._pretty;
    }
    async _ensureContentLoaded() {
        if (!this._contentRequested) {
            this._contentRequested = true;
            const progressIndicator = new UI.ProgressIndicator.ProgressIndicator();
            progressIndicator.setTitle(i18nString(UIStrings.loading));
            progressIndicator.setTotalWork(100);
            this._progressToolbarItem.element.appendChild(progressIndicator.element);
            const deferredContent = await this._lazyContent();
            let error, content;
            if (deferredContent.content === null) {
                error = deferredContent.error;
                this._rawContent = deferredContent.error;
            }
            else {
                content = deferredContent.content;
                this._rawContent = deferredContent.isEncoded ? window.atob(deferredContent.content) : deferredContent.content;
            }
            progressIndicator.setWorked(1);
            if (!error && this._highlighterType === 'application/wasm') {
                const worker = Common.Worker.WorkerWrapper.fromURL(new URL('../../../../entrypoints/wasmparser_worker/wasmparser_worker-entrypoint.js', import.meta.url));
                const promise = new Promise((resolve, reject) => {
                    worker.onmessage =
                        /** @type {{event:string, params:{percentage:number}}} */
                        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ({ data }) => {
                            if ('event' in data) {
                                switch (data.event) {
                                    case 'progress':
                                        progressIndicator.setWorked(data.params.percentage);
                                        break;
                                }
                            }
                            else if ('method' in data) {
                                switch (data.method) {
                                    case 'disassemble':
                                        if ('error' in data) {
                                            reject(data.error);
                                        }
                                        else if ('result' in data) {
                                            resolve(data.result);
                                        }
                                        break;
                                }
                            }
                        };
                    worker.onerror = reject;
                });
                worker.postMessage({ method: 'disassemble', params: { content } });
                try {
                    const { source, offsets, functionBodyOffsets } = await promise;
                    this._rawContent = content = source;
                    this._wasmDisassembly = new Common.WasmDisassembly.WasmDisassembly(offsets, functionBodyOffsets);
                }
                catch (e) {
                    this._rawContent = content = error = e.message;
                }
                finally {
                    worker.terminate();
                }
            }
            progressIndicator.setWorked(100);
            progressIndicator.done();
            this._formattedContentPromise = null;
            this._formattedMap = null;
            this._prettyToggle.setEnabled(true);
            if (error) {
                this.setContent(null, error);
                this._prettyToggle.setEnabled(false);
                // Occasionally on load, there can be a race in which it appears the CodeMirror plugin
                // runs the highlighter type assignment out of order. In case of an error then, set
                // the highlighter type after a short delay. This appears to only occur the first
                // time that CodeMirror is initialized, likely because the highlighter type was first
                // initialized based on the file type, and the syntax highlighting is in a race
                // with the new highlighter assignment. As the option is just an option and is not
                // observable, we can't handle waiting for it here.
                // https://github.com/codemirror/CodeMirror/issues/6019
                // CRBug 1011445
                setTimeout(() => this.setHighlighterType('text/plain'), 50);
            }
            else {
                if (this._shouldAutoPrettyPrint && TextUtils.TextUtils.isMinified(content)) {
                    await this._setPretty(true);
                }
                else {
                    this.setContent(this._rawContent, null);
                }
            }
            this.contentSet = true;
        }
    }
    _requestFormattedContent() {
        if (this._formattedContentPromise) {
            return this._formattedContentPromise;
        }
        let fulfill;
        this._formattedContentPromise = new Promise(x => {
            fulfill = x;
        });
        new Formatter.ScriptFormatter.ScriptFormatter(this._highlighterType, this._rawContent || '', async (content, map) => {
            fulfill({ content, map });
        });
        return this._formattedContentPromise;
    }
    revealPosition(line, column, shouldHighlight) {
        this._lineToScrollTo = null;
        this._selectionToSet = null;
        this._positionToReveal = { line: line, column: column, shouldHighlight: shouldHighlight };
        this._innerRevealPositionIfNeeded();
    }
    _innerRevealPositionIfNeeded() {
        if (!this._positionToReveal) {
            return;
        }
        if (!this.loaded || !this.isShowing()) {
            return;
        }
        const { lineNumber, columnNumber } = this.uiLocationToEditorLocation(this._positionToReveal.line, this._positionToReveal.column);
        this._textEditor.revealPosition(lineNumber, columnNumber, this._positionToReveal.shouldHighlight);
        this._positionToReveal = null;
    }
    _clearPositionToReveal() {
        this._textEditor.clearPositionHighlight();
        this._positionToReveal = null;
    }
    scrollToLine(line) {
        this._clearPositionToReveal();
        this._lineToScrollTo = line;
        this._innerScrollToLineIfNeeded();
    }
    _innerScrollToLineIfNeeded() {
        if (this._lineToScrollTo !== null) {
            if (this.loaded && this.isShowing()) {
                this._textEditor.scrollToLine(this._lineToScrollTo);
                this._lineToScrollTo = null;
            }
        }
    }
    selection() {
        return this.textEditor.selection();
    }
    setSelection(textRange) {
        this._selectionToSet = textRange;
        this._innerSetSelectionIfNeeded();
    }
    _innerSetSelectionIfNeeded() {
        if (this._selectionToSet && this.loaded && this.isShowing()) {
            this._textEditor.setSelection(this._selectionToSet, true);
            this._selectionToSet = null;
        }
    }
    _wasShownOrLoaded() {
        this._innerRevealPositionIfNeeded();
        this._innerSetSelectionIfNeeded();
        this._innerScrollToLineIfNeeded();
    }
    onTextChanged(_oldRange, _newRange) {
        const wasPretty = this.pretty;
        this._pretty = this._prettyCleanGeneration !== null && this.textEditor.isClean(this._prettyCleanGeneration);
        if (this._pretty !== wasPretty) {
            this._updatePrettyPrintState();
        }
        this._prettyToggle.setEnabled(this.isClean());
        if (this._searchConfig && this._searchableView) {
            this.performSearch(this._searchConfig, false, false);
        }
    }
    isClean() {
        return this.textEditor.isClean(this._cleanGeneration) ||
            (this._prettyCleanGeneration !== null && this.textEditor.isClean(this._prettyCleanGeneration));
    }
    contentCommitted() {
        this._cleanGeneration = this._textEditor.markClean();
        this._prettyCleanGeneration = null;
        this._rawContent = this.textEditor.text();
        this._formattedMap = null;
        this._formattedContentPromise = null;
        if (this._pretty) {
            this._pretty = false;
            this._updatePrettyPrintState();
        }
        this._prettyToggle.setEnabled(true);
    }
    _simplifyMimeType(content, mimeType) {
        if (!mimeType) {
            return '';
        }
        // There are plenty of instances where TSX/JSX files are served with out the trailing x, i.e. JSX with a 'js' suffix
        // which breaks the formatting. Therefore, if the mime type is TypeScript or JavaScript, we switch to the TSX/JSX
        // superset so that we don't break formatting.
        if (mimeType.indexOf('typescript') >= 0) {
            return 'text/typescript-jsx';
        }
        if (mimeType.indexOf('javascript') >= 0 || mimeType.indexOf('jscript') >= 0 ||
            mimeType.indexOf('ecmascript') >= 0) {
            return 'text/jsx';
        }
        // A hack around the fact that files with "php" extension might be either standalone or html embedded php scripts.
        if (mimeType === 'text/x-php' && content.match(/\<\?.*\?\>/g)) {
            return 'application/x-httpd-php';
        }
        if (mimeType === 'application/wasm') {
            // text/webassembly is not a proper MIME type, but CodeMirror uses it for WAT syntax highlighting.
            // We generally use application/wasm, which is the correct MIME type for Wasm binary data.
            return 'text/webassembly';
        }
        return mimeType;
    }
    setHighlighterType(highlighterType) {
        this._highlighterType = highlighterType;
        this._updateHighlighterType('');
    }
    highlighterType() {
        return this._highlighterType;
    }
    _updateHighlighterType(content) {
        this._textEditor.setMimeType(this._simplifyMimeType(content, this._highlighterType));
    }
    setContent(content, loadError) {
        this._muteChangeEventsForSetContent = true;
        if (!this._loaded) {
            this._loaded = true;
            if (!loadError) {
                this._textEditor.setText(content || '');
                this._cleanGeneration = this._textEditor.markClean();
                this._textEditor.setReadOnly(!this._editable);
                this._loadError = false;
            }
            else {
                this._textEditor.setText(loadError || '');
                this._highlighterType = 'text/plain';
                this._textEditor.setReadOnly(true);
                this._loadError = true;
            }
        }
        else {
            const scrollTop = this._textEditor.scrollTop();
            const selection = this._textEditor.selection();
            this._textEditor.setText(content || '');
            this._textEditor.setScrollTop(scrollTop);
            this._textEditor.setSelection(selection);
        }
        // Mark non-breakable lines in the Wasm disassembly after setting
        // up the content for the text editor (which creates the gutter).
        if (this._wasmDisassembly) {
            for (const lineNumber of this._wasmDisassembly.nonBreakableLineNumbers()) {
                this._textEditor.toggleLineClass(lineNumber, 'cm-non-breakable-line', true);
            }
        }
        this._updateLineNumberFormatter();
        this._updateHighlighterType(content || '');
        this._wasShownOrLoaded();
        if (this._delayedFindSearchMatches) {
            this._delayedFindSearchMatches();
            this._delayedFindSearchMatches = null;
        }
        this._muteChangeEventsForSetContent = false;
    }
    setSearchableView(view) {
        this._searchableView = view;
    }
    _doFindSearchMatches(searchConfig, shouldJump, jumpBackwards) {
        this._currentSearchResultIndex = -1;
        this._searchResults = [];
        const regex = searchConfig.toSearchRegex();
        this._searchRegex = regex;
        this._searchResults = this._collectRegexMatches(regex);
        if (this._searchableView) {
            this._searchableView.updateSearchMatchesCount(this._searchResults.length);
        }
        if (!this._searchResults.length) {
            this._textEditor.cancelSearchResultsHighlight();
        }
        else if (shouldJump && jumpBackwards) {
            this.jumpToPreviousSearchResult();
        }
        else if (shouldJump) {
            this.jumpToNextSearchResult();
        }
        else {
            this._textEditor.highlightSearchResults(regex, null);
        }
    }
    performSearch(searchConfig, shouldJump, jumpBackwards) {
        if (this._searchableView) {
            this._searchableView.updateSearchMatchesCount(0);
        }
        this._resetSearch();
        this._searchConfig = searchConfig;
        if (this.loaded) {
            this._doFindSearchMatches(searchConfig, shouldJump, Boolean(jumpBackwards));
        }
        else {
            this._delayedFindSearchMatches =
                this._doFindSearchMatches.bind(this, searchConfig, shouldJump, Boolean(jumpBackwards));
        }
        this._ensureContentLoaded();
    }
    _resetCurrentSearchResultIndex() {
        if (!this._searchResults.length) {
            return;
        }
        this._currentSearchResultIndex = -1;
        if (this._searchableView) {
            this._searchableView.updateCurrentMatchIndex(this._currentSearchResultIndex);
        }
        this._textEditor.highlightSearchResults(this._searchRegex, null);
    }
    _resetSearch() {
        this._searchConfig = null;
        this._delayedFindSearchMatches = null;
        this._currentSearchResultIndex = -1;
        this._searchResults = [];
        this._searchRegex = null;
    }
    searchCanceled() {
        const range = this._currentSearchResultIndex !== -1 ? this._searchResults[this._currentSearchResultIndex] : null;
        this._resetSearch();
        if (!this.loaded) {
            return;
        }
        this._textEditor.cancelSearchResultsHighlight();
        if (range) {
            this.setSelection(range);
        }
    }
    jumpToLastSearchResult() {
        this.jumpToSearchResult(this._searchResults.length - 1);
    }
    _searchResultIndexForCurrentSelection() {
        return Platform.ArrayUtilities.lowerBound(this._searchResults, this._textEditor.selection().collapseToEnd(), TextUtils.TextRange.TextRange.comparator);
    }
    jumpToNextSearchResult() {
        const currentIndex = this._searchResultIndexForCurrentSelection();
        const nextIndex = this._currentSearchResultIndex === -1 ? currentIndex : currentIndex + 1;
        this.jumpToSearchResult(nextIndex);
    }
    jumpToPreviousSearchResult() {
        const currentIndex = this._searchResultIndexForCurrentSelection();
        this.jumpToSearchResult(currentIndex - 1);
    }
    supportsCaseSensitiveSearch() {
        return true;
    }
    supportsRegexSearch() {
        return true;
    }
    jumpToSearchResult(index) {
        if (!this.loaded || !this._searchResults.length) {
            return;
        }
        this._currentSearchResultIndex = (index + this._searchResults.length) % this._searchResults.length;
        if (this._searchableView) {
            this._searchableView.updateCurrentMatchIndex(this._currentSearchResultIndex);
        }
        this._textEditor.highlightSearchResults(this._searchRegex, this._searchResults[this._currentSearchResultIndex]);
    }
    replaceSelectionWith(searchConfig, replacement) {
        const range = this._searchResults[this._currentSearchResultIndex];
        if (!range) {
            return;
        }
        this._textEditor.highlightSearchResults(this._searchRegex, null);
        const oldText = this._textEditor.text(range);
        const regex = searchConfig.toSearchRegex();
        let text;
        if (regex.__fromRegExpQuery) {
            text = oldText.replace(regex, replacement);
        }
        else {
            text = oldText.replace(regex, function () {
                return replacement;
            });
        }
        const newRange = this._textEditor.editRange(range, text);
        this._textEditor.setSelection(newRange.collapseToEnd());
    }
    replaceAllWith(searchConfig, replacement) {
        this._resetCurrentSearchResultIndex();
        let text = this._textEditor.text();
        const range = this._textEditor.fullRange();
        const regex = searchConfig.toSearchRegex(true);
        if (regex.__fromRegExpQuery) {
            text = text.replace(regex, replacement);
        }
        else {
            text = text.replace(regex, function () {
                return replacement;
            });
        }
        const ranges = this._collectRegexMatches(regex);
        if (!ranges.length) {
            return;
        }
        // Calculate the position of the end of the last range to be edited.
        const currentRangeIndex = Platform.ArrayUtilities.lowerBound(ranges, this._textEditor.selection(), TextUtils.TextRange.TextRange.comparator);
        const lastRangeIndex = Platform.NumberUtilities.mod(currentRangeIndex - 1, ranges.length);
        const lastRange = ranges[lastRangeIndex];
        const replacementLineEndings = Platform.StringUtilities.findLineEndingIndexes(replacement);
        const replacementLineCount = replacementLineEndings.length;
        const lastLineNumber = lastRange.startLine + replacementLineEndings.length - 1;
        let lastColumnNumber = lastRange.startColumn;
        if (replacementLineEndings.length > 1) {
            lastColumnNumber =
                replacementLineEndings[replacementLineCount - 1] - replacementLineEndings[replacementLineCount - 2] - 1;
        }
        this._textEditor.editRange(range, text);
        this._textEditor.revealPosition(lastLineNumber, lastColumnNumber);
        this._textEditor.setSelection(TextUtils.TextRange.TextRange.createFromLocation(lastLineNumber, lastColumnNumber));
    }
    _collectRegexMatches(regexObject) {
        const ranges = [];
        for (let i = 0; i < this._textEditor.linesCount; ++i) {
            let line = this._textEditor.line(i);
            let offset = 0;
            let match;
            do {
                match = regexObject.exec(line);
                if (match) {
                    const matchEndIndex = match.index + Math.max(match[0].length, 1);
                    if (match[0].length) {
                        ranges.push(new TextUtils.TextRange.TextRange(i, offset + match.index, i, offset + matchEndIndex));
                    }
                    offset += matchEndIndex;
                    line = line.substring(matchEndIndex);
                }
            } while (match && line);
        }
        return ranges;
    }
    populateLineGutterContextMenu(_contextMenu, _editorLineNumber) {
        return Promise.resolve();
    }
    populateTextAreaContextMenu(_contextMenu, _editorLineNumber, _editorColumnNumber) {
        return Promise.resolve();
    }
    canEditSource() {
        return this._editable;
    }
    _updateSourcePosition() {
        const selections = this._textEditor.selections();
        if (!selections.length) {
            return;
        }
        if (selections.length > 1) {
            this._sourcePosition.setText(i18nString(UIStrings.dSelectionRegions, { PH1: selections.length }));
            return;
        }
        let textRange = selections[0];
        if (textRange.isEmpty()) {
            const location = this._prettyToRawLocation(textRange.endLine, textRange.endColumn);
            if (this._wasmDisassembly) {
                const disassembly = this._wasmDisassembly;
                const lastBytecodeOffset = disassembly.lineNumberToBytecodeOffset(disassembly.lineNumbers - 1);
                const bytecodeOffsetDigits = lastBytecodeOffset.toString(16).length;
                const bytecodeOffset = disassembly.lineNumberToBytecodeOffset(location[0]);
                this._sourcePosition.setText(i18nString(UIStrings.bytecodePositionXs, { PH1: bytecodeOffset.toString(16).padStart(bytecodeOffsetDigits, '0') }));
            }
            else {
                if (!this.canEditSource()) {
                    this._textEditor.revealPosition(textRange.endLine, textRange.endColumn, true);
                }
                this._sourcePosition.setText(i18nString(UIStrings.lineSColumnS, { PH1: location[0] + 1, PH2: location[1] + 1 }));
            }
            return;
        }
        textRange = textRange.normalize();
        const selectedText = this._textEditor.text(textRange);
        if (textRange.startLine === textRange.endLine) {
            this._sourcePosition.setText(i18nString(UIStrings.dCharactersSelected, { PH1: selectedText.length }));
        }
        else {
            this._sourcePosition.setText(i18nString(UIStrings.dLinesDCharactersSelected, { PH1: textRange.endLine - textRange.startLine + 1, PH2: selectedText.length }));
        }
    }
}
const registeredLineDecorators = [];
export function registerLineDecorator(registration) {
    registeredLineDecorators.push(registration);
}
export function getRegisteredLineDecorators() {
    return registeredLineDecorators;
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var DecoratorType;
(function (DecoratorType) {
    DecoratorType["PERFORMANCE"] = "performance";
    DecoratorType["MEMORY"] = "memory";
    DecoratorType["COVERAGE"] = "coverage";
})(DecoratorType || (DecoratorType = {}));
//# sourceMappingURL=SourceFrame.js.map