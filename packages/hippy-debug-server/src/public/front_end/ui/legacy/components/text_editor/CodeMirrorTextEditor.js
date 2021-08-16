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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import * as Common from '../../../../core/common/common.js';
import * as Host from '../../../../core/host/host.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
import { TextEditorAutocompleteController } from './TextEditorAutocompleteController.js';
const UIStrings = {
    /**
    *@description Text in Code Mirror Text Editor of the CodeMirror text editor
    */
    codeEditor: 'Code editor',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/text_editor/CodeMirrorTextEditor.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// https://crbug.com/1151919 * = CodeMirror.Editor
const editorToDevtoolsWrapper = new WeakMap();
export class CodeMirrorTextEditor extends UI.Widget.VBox {
    _options;
    // https://crbug.com/1151919 * = CodeMirror.Editor
    _codeMirror;
    _codeMirrorElement;
    _shouldClearHistory;
    _lineSeparator;
    _hasOneLine;
    // https://crbug.com/1151919 * = CodeMirror.TextMarker
    _bookmarkForMarker;
    _selectNextOccurrenceController;
    _decorations;
    _needsRefresh;
    _readOnly;
    _mimeType;
    _placeholderElement;
    _autocompleteController;
    _highlightedLine;
    _clearHighlightTimeout;
    _editorSizeInSync;
    _lastSelection;
    _selectionSetScheduled;
    constructor(options) {
        super();
        this._options = options;
        this.registerRequiredCSS('third_party/codemirror/codemirror.css', { enableLegacyPatching: false });
        this.registerRequiredCSS('ui/legacy/components/text_editor/cmdevtools.css', { enableLegacyPatching: false });
        this.registerRequiredCSS('ui/legacy/components/text_editor/cmdevtools.darkmode.css', { enableLegacyPatching: false });
        const { indentWithTabs, indentUnit } = CodeMirrorTextEditor._getIndentation(Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get());
        // @ts-ignore TODO(crbug.com/1172300) Properly type this after jsdoc to ts migration
        this._codeMirror = new CodeMirror(this.element, {
            screenReaderLabel: options.devtoolsAccessibleName || i18nString(UIStrings.codeEditor),
            lineNumbers: options.lineNumbers,
            smartIndent: true,
            electricChars: true,
            indentUnit,
            indentWithTabs,
            lineWrapping: options.lineWrapping,
            lineWiseCopyCut: options.lineWiseCopyCut || false,
            pollInterval: Math.pow(2, 31) - 1,
            matchBrackets: true,
            inputStyle: (options.inputStyle || 'devToolsAccessibleTextArea'),
            styleSelectedText: true,
            styleActiveLine: true,
            tabIndex: 0,
        });
        this._codeMirrorElement = this.element.lastElementChild;
        editorToDevtoolsWrapper.set(this._codeMirror, this);
        Common.Settings.Settings.instance()
            .moduleSetting('textEditorIndent')
            .addChangeListener(this._updateIndentSize.bind(this));
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        CodeMirror.keyMap['devtools-common'] = {
            'Left': 'goCharLeft',
            'Right': 'goCharRight',
            'Up': 'goLineUp',
            'Down': 'goLineDown',
            'End': 'goLineEnd',
            'Home': 'goLineStartSmart',
            'PageUp': 'goSmartPageUp',
            'PageDown': 'goSmartPageDown',
            'Delete': 'delCharAfter',
            'Backspace': 'delCharBefore',
            'Tab': 'UserIndent',
            'Shift-Tab': 'indentLessOrPass',
            'Enter': 'newlineAndIndent',
            'Ctrl-Space': 'autocomplete',
            'Esc': 'dismiss',
            'Ctrl-M': 'gotoMatchingBracket',
        };
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        CodeMirror.keyMap['devtools-pc'] = {
            'Ctrl-A': 'selectAll',
            'Ctrl-Z': 'undoAndReveal',
            'Shift-Ctrl-Z': 'redoAndReveal',
            'Ctrl-Y': 'redo',
            'Ctrl-Home': 'goDocStart',
            'Ctrl-Up': 'goDocStart',
            'Ctrl-End': 'goDocEnd',
            'Ctrl-Down': 'goDocEnd',
            'Ctrl-Left': 'goGroupLeft',
            'Ctrl-Right': 'goGroupRight',
            'Alt-Left': 'moveCamelLeft',
            'Alt-Right': 'moveCamelRight',
            'Shift-Alt-Left': 'selectCamelLeft',
            'Shift-Alt-Right': 'selectCamelRight',
            'Ctrl-Backspace': 'delGroupBefore',
            'Ctrl-Delete': 'delGroupAfter',
            'Ctrl-/': 'toggleComment',
            'Ctrl-D': 'selectNextOccurrence',
            'Ctrl-U': 'undoLastSelection',
            fallthrough: 'devtools-common',
        };
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        CodeMirror.keyMap['devtools-mac'] = {
            'Cmd-A': 'selectAll',
            'Cmd-Z': 'undoAndReveal',
            'Shift-Cmd-Z': 'redoAndReveal',
            'Cmd-Up': 'goDocStart',
            'Cmd-Down': 'goDocEnd',
            'Alt-Left': 'goGroupLeft',
            'Alt-Right': 'goGroupRight',
            'Ctrl-Left': 'moveCamelLeft',
            'Ctrl-Right': 'moveCamelRight',
            'Ctrl-A': 'goLineLeft',
            'Ctrl-E': 'goLineRight',
            'Ctrl-B': 'goCharLeft',
            'Ctrl-F': 'goCharRight',
            'Ctrl-Alt-B': 'goGroupLeft',
            'Ctrl-Alt-F': 'goGroupRight',
            'Ctrl-H': 'delCharBefore',
            'Ctrl-D': 'delCharAfter',
            'Ctrl-K': 'killLine',
            'Ctrl-T': 'transposeChars',
            'Ctrl-P': 'goLineUp',
            'Ctrl-N': 'goLineDown',
            'Shift-Ctrl-Left': 'selectCamelLeft',
            'Shift-Ctrl-Right': 'selectCamelRight',
            'Cmd-Left': 'goLineStartSmart',
            'Cmd-Right': 'goLineEnd',
            'Cmd-Backspace': 'delLineLeft',
            'Alt-Backspace': 'delGroupBefore',
            'Alt-Delete': 'delGroupAfter',
            'Cmd-/': 'toggleComment',
            'Cmd-D': 'selectNextOccurrence',
            'Cmd-U': 'undoLastSelection',
            fallthrough: 'devtools-common',
        };
        if (options.bracketMatchingSetting) {
            options.bracketMatchingSetting.addChangeListener(this._enableBracketMatchingIfNeeded, this);
        }
        this._enableBracketMatchingIfNeeded();
        this._codeMirror.setOption('keyMap', Host.Platform.isMac() ? 'devtools-mac' : 'devtools-pc');
        this._codeMirror.setOption('flattenSpans', false);
        let maxHighlightLength = options.maxHighlightLength;
        if (typeof maxHighlightLength !== 'number') {
            maxHighlightLength = CodeMirrorTextEditor.maxHighlightLength;
        }
        this._codeMirror.setOption('maxHighlightLength', maxHighlightLength);
        this._codeMirror.setOption('mode', null);
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        this._codeMirror.setOption('crudeMeasuringFrom', 1000);
        this._shouldClearHistory = true;
        this._lineSeparator = '\n';
        this._bookmarkForMarker = new WeakMap();
        CodeMirrorTextEditor._fixWordMovement(this._codeMirror);
        this._selectNextOccurrenceController = new SelectNextOccurrenceController(this, this._codeMirror);
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        this._codeMirror.on('changes', this._changes.bind(this));
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        this._codeMirror.on('beforeSelectionChange', this._beforeSelectionChange.bind(this));
        this._codeMirror.on('cursorActivity', () => {
            this.dispatchEventToListeners(UI.TextEditor.Events.CursorChanged);
        });
        this.element.style.overflow = 'hidden';
        this._codeMirrorElement.classList.add('source-code');
        this._codeMirrorElement.classList.add('fill');
        this._decorations = new Platform.MapUtilities.Multimap();
        this.element.addEventListener('keydown', this._handleKeyDown.bind(this), true);
        this.element.addEventListener('keydown', this._handlePostKeyDown.bind(this), false);
        this._needsRefresh = true;
        this._readOnly = false;
        this._mimeType = '';
        if (options.mimeType) {
            this.setMimeType(options.mimeType);
        }
        if (options.autoHeight) {
            this._codeMirror.setSize(null, 'auto');
        }
        this._placeholderElement = null;
        if (options.placeholder) {
            this._placeholderElement = document.createElement('pre');
            this._placeholderElement.classList.add('placeholder-text');
            this._placeholderElement.classList.add('CodeMirror-line-like');
            this._placeholderElement.textContent = options.placeholder;
            this._updatePlaceholder();
        }
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    static getForCodeMirror(codeMirrorEditor) {
        const wrapper = editorToDevtoolsWrapper.get(codeMirrorEditor);
        if (!wrapper) {
            throw new Error('CodeMirrorTextEditor not found');
        }
        return wrapper;
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    static autocompleteCommand(codeMirror) {
        const autocompleteController = CodeMirrorTextEditor.getForCodeMirror(codeMirror)._autocompleteController;
        if (autocompleteController) {
            autocompleteController.autocomplete(true);
        }
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    static undoLastSelectionCommand(codeMirror) {
        CodeMirrorTextEditor.getForCodeMirror(codeMirror)._selectNextOccurrenceController.undoLastSelection();
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    static selectNextOccurrenceCommand(codeMirror) {
        CodeMirrorTextEditor.getForCodeMirror(codeMirror)._selectNextOccurrenceController.selectNextOccurrence();
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    static moveCamelLeftCommand(shift, codeMirror) {
        CodeMirrorTextEditor.getForCodeMirror(codeMirror)._doCamelCaseMovement(-1, shift);
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    static moveCamelRightCommand(shift, codeMirror) {
        CodeMirrorTextEditor.getForCodeMirror(codeMirror)._doCamelCaseMovement(1, shift);
    }
    static _getIndentation(indentationValue) {
        const indentWithTabs = /\t/.test(indentationValue);
        const indentUnit = indentWithTabs ? 4 : indentationValue.length;
        return { indentWithTabs, indentUnit };
    }
    static _overrideModeWithPrefixedTokens(modeName, tokenPrefix) {
        const oldModeName = modeName + '-old';
        if (CodeMirror.modes[oldModeName]) {
            return;
        }
        CodeMirror.defineMode(oldModeName, CodeMirror.modes[modeName]);
        CodeMirror.defineMode(modeName, modeConstructor);
        // @ts-ignore TODO(crbug.com/1172300) Properly type this after jsdoc to ts migration
        function modeConstructor(config, parserConfig) {
            // TODO(crbug.com/1172300) Properly type this after jsdoc to ts migration
            const innerConfig = {};
            for (const i in parserConfig) {
                innerConfig[i] = parserConfig[i];
            }
            innerConfig.name = oldModeName;
            const codeMirrorMode = CodeMirror.getMode(config, innerConfig);
            codeMirrorMode.name = modeName;
            if (typeof codeMirrorMode.token === 'undefined') {
                throw new Error('codeMirrorMode.token was unexpectedly undefined');
            }
            codeMirrorMode.token = getTokenFunction(codeMirrorMode.token);
            return codeMirrorMode;
        }
        function getTokenFunction(superToken) {
            function childFunc(stream, state) {
                return tokenOverride(superToken, stream, state);
            }
            return childFunc;
        }
        function tokenOverride(superToken, stream, state) {
            const token = superToken(stream, state);
            return token ? tokenPrefix + token.split(/ +/).join(' ' + tokenPrefix) : token;
        }
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    static _fixWordMovement(codeMirror) {
        // https://crbug.com/1151919 * = CodeMirror.Editor
        function moveLeft(shift, codeMirror) {
            codeMirror.setExtending(shift);
            const cursor = codeMirror.getCursor('head');
            codeMirror.execCommand('goGroupLeft');
            const newCursor = codeMirror.getCursor('head');
            if (newCursor.ch === 0 && newCursor.line !== 0) {
                codeMirror.setExtending(false);
                return;
            }
            const skippedText = codeMirror.getRange(newCursor, cursor, '#');
            if (/^\s+$/.test(skippedText)) {
                codeMirror.execCommand('goGroupLeft');
            }
            codeMirror.setExtending(false);
        }
        // https://crbug.com/1151919 * = CodeMirror.Editor
        function moveRight(shift, codeMirror) {
            codeMirror.setExtending(shift);
            const cursor = codeMirror.getCursor('head');
            codeMirror.execCommand('goGroupRight');
            const newCursor = codeMirror.getCursor('head');
            if (newCursor.ch === 0 && newCursor.line !== 0) {
                codeMirror.setExtending(false);
                return;
            }
            const skippedText = codeMirror.getRange(cursor, newCursor, '#');
            if (/^\s+$/.test(skippedText)) {
                codeMirror.execCommand('goGroupRight');
            }
            codeMirror.setExtending(false);
        }
        const modifierKey = Host.Platform.isMac() ? 'Alt' : 'Ctrl';
        const leftKey = modifierKey + '-Left';
        const rightKey = modifierKey + '-Right';
        const keyMap = {};
        keyMap[leftKey] = moveLeft.bind(null, false);
        keyMap[rightKey] = moveRight.bind(null, false);
        keyMap['Shift-' + leftKey] = moveLeft.bind(null, true);
        keyMap['Shift-' + rightKey] = moveRight.bind(null, true);
        codeMirror.addKeyMap(keyMap);
    }
    // https://crbug.com/1151919 * = CodeMirror.Editor
    codeMirror() {
        // https://crbug.com/1151919 * = CodeMirror.Editor
        return /** @type {*} */ this._codeMirror;
    }
    widget() {
        return this;
    }
    setPlaceholder(placeholder) {
        if (!this._placeholderElement) {
            this._placeholderElement = document.createElement('pre');
            this._placeholderElement.classList.add('placeholder-text');
            this._placeholderElement.classList.add('CodeMirror-line-like');
        }
        this._placeholderElement.textContent = placeholder || '';
        this._updatePlaceholder();
    }
    _normalizePositionForOverlappingColumn(lineNumber, lineLength, charNumber) {
        const linesCount = this._codeMirror.lineCount();
        let columnNumber = charNumber;
        if (charNumber < 0 && lineNumber > 0) {
            --lineNumber;
            columnNumber = this.line(lineNumber).length;
        }
        else if (charNumber >= lineLength && lineNumber < linesCount - 1) {
            ++lineNumber;
            columnNumber = 0;
        }
        else {
            columnNumber = Platform.NumberUtilities.clamp(charNumber, 0, lineLength);
        }
        return { lineNumber: lineNumber, columnNumber: columnNumber };
    }
    _camelCaseMoveFromPosition(lineNumber, columnNumber, direction) {
        function valid(charNumber, length) {
            return charNumber >= 0 && charNumber < length;
        }
        function isWordStart(text, charNumber) {
            const position = charNumber;
            const nextPosition = charNumber + 1;
            return valid(position, text.length) && valid(nextPosition, text.length) &&
                TextUtils.TextUtils.Utils.isWordChar(text[position]) &&
                TextUtils.TextUtils.Utils.isWordChar(text[nextPosition]) &&
                TextUtils.TextUtils.Utils.isUpperCase(text[position]) &&
                TextUtils.TextUtils.Utils.isLowerCase(text[nextPosition]);
        }
        function isWordEnd(text, charNumber) {
            const position = charNumber;
            const prevPosition = charNumber - 1;
            return valid(position, text.length) && valid(prevPosition, text.length) &&
                TextUtils.TextUtils.Utils.isWordChar(text[position]) &&
                TextUtils.TextUtils.Utils.isWordChar(text[prevPosition]) &&
                TextUtils.TextUtils.Utils.isUpperCase(text[position]) &&
                TextUtils.TextUtils.Utils.isLowerCase(text[prevPosition]);
        }
        function constrainPosition(lineNumber, lineLength, columnNumber) {
            return { lineNumber: lineNumber, columnNumber: Platform.NumberUtilities.clamp(columnNumber, 0, lineLength) };
        }
        const text = this.line(lineNumber);
        const length = text.length;
        if ((columnNumber === length && direction === 1) || (columnNumber === 0 && direction === -1)) {
            return this._normalizePositionForOverlappingColumn(lineNumber, length, columnNumber + direction);
        }
        let charNumber = direction === 1 ? columnNumber : columnNumber - 1;
        // Move through initial spaces if any.
        while (valid(charNumber, length) && TextUtils.TextUtils.Utils.isSpaceChar(text[charNumber])) {
            charNumber += direction;
        }
        if (!valid(charNumber, length)) {
            return constrainPosition(lineNumber, length, charNumber);
        }
        if (TextUtils.TextUtils.Utils.isStopChar(text[charNumber])) {
            while (valid(charNumber, length) && TextUtils.TextUtils.Utils.isStopChar(text[charNumber])) {
                charNumber += direction;
            }
            if (!valid(charNumber, length)) {
                return constrainPosition(lineNumber, length, charNumber);
            }
            return { lineNumber: lineNumber, columnNumber: direction === -1 ? charNumber + 1 : charNumber };
        }
        charNumber += direction;
        while (valid(charNumber, length) && !isWordStart(text, charNumber) && !isWordEnd(text, charNumber) &&
            TextUtils.TextUtils.Utils.isWordChar(text[charNumber])) {
            charNumber += direction;
        }
        if (!valid(charNumber, length)) {
            return constrainPosition(lineNumber, length, charNumber);
        }
        if (isWordStart(text, charNumber) || isWordEnd(text, charNumber)) {
            return { lineNumber: lineNumber, columnNumber: charNumber };
        }
        return { lineNumber: lineNumber, columnNumber: direction === -1 ? charNumber + 1 : charNumber };
    }
    _doCamelCaseMovement(direction, shift) {
        const selections = this.selections();
        for (let i = 0; i < selections.length; ++i) {
            const selection = selections[i];
            const move = this._camelCaseMoveFromPosition(selection.endLine, selection.endColumn, direction);
            selection.endLine = move.lineNumber;
            selection.endColumn = move.columnNumber;
            if (!shift) {
                selections[i] = selection.collapseToEnd();
            }
        }
        this.setSelections(selections);
    }
    dispose() {
        if (this._options.bracketMatchingSetting) {
            this._options.bracketMatchingSetting.removeChangeListener(this._enableBracketMatchingIfNeeded, this);
        }
    }
    _enableBracketMatchingIfNeeded() {
        this._codeMirror.setOption(
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        'autoCloseBrackets', (this._options.bracketMatchingSetting && this._options.bracketMatchingSetting.get()) ? { explode: false } :
            false);
    }
    wasShown() {
        if (this._needsRefresh) {
            this.refresh();
        }
    }
    refresh() {
        if (this.isShowing()) {
            this._codeMirror.refresh();
            this._needsRefresh = false;
            return;
        }
        this._needsRefresh = true;
    }
    willHide() {
        delete this._editorSizeInSync;
    }
    undo() {
        this._codeMirror.undo();
    }
    redo() {
        this._codeMirror.redo();
    }
    _handleKeyDown(e) {
        const keyboardEvent = e;
        if (keyboardEvent.key === 'Tab' &&
            Common.Settings.Settings.instance().moduleSetting('textEditorTabMovesFocus').get()) {
            keyboardEvent.consume(false);
            return;
        }
        if (this._autocompleteController && this._autocompleteController.keyDown(keyboardEvent)) {
            keyboardEvent.consume(true);
        }
    }
    _handlePostKeyDown(e) {
        if (e.defaultPrevented) {
            e.consume(true);
        }
    }
    configureAutocomplete(config) {
        if (this._autocompleteController) {
            this._autocompleteController.dispose();
            delete this._autocompleteController;
        }
        if (config) {
            this._autocompleteController = new TextEditorAutocompleteController(this, this._codeMirror, config);
        }
    }
    cursorPositionToCoordinates(lineNumber, column) {
        if (lineNumber >= this._codeMirror.lineCount() || lineNumber < 0 || column < 0 ||
            column > this._codeMirror.getLine(lineNumber).length) {
            return null;
        }
        const metrics = this._codeMirror.cursorCoords(new CodeMirror.Pos(lineNumber, column));
        return { x: metrics.left, y: metrics.top, height: metrics.bottom - metrics.top };
    }
    coordinatesToCursorPosition(x, y) {
        const element = this.element.ownerDocument.elementFromPoint(x, y);
        if (!element || !element.isSelfOrDescendant(this._codeMirror.getWrapperElement())) {
            return null;
        }
        const gutterBox = this._codeMirror.getGutterElement().boxInWindow();
        if (x >= gutterBox.x && x <= gutterBox.x + gutterBox.width && y >= gutterBox.y &&
            y <= gutterBox.y + gutterBox.height) {
            return null;
        }
        const coords = this._codeMirror.coordsChar({ left: x, top: y });
        return TextUtils.CodeMirrorUtils.toRange(coords, coords);
    }
    visualCoordinates(lineNumber, columnNumber) {
        const metrics = this._codeMirror.cursorCoords(new CodeMirror.Pos(lineNumber, columnNumber));
        return { x: metrics.left, y: metrics.top };
    }
    tokenAtTextPosition(lineNumber, columnNumber) {
        if (lineNumber < 0 || lineNumber >= this._codeMirror.lineCount()) {
            return null;
        }
        const token = this._codeMirror.getTokenAt(new CodeMirror.Pos(lineNumber, (columnNumber || 0) + 1));
        if (!token) {
            return null;
        }
        return { startColumn: token.start, endColumn: token.end, type: token.type };
    }
    isClean(generation) {
        return this._codeMirror.isClean(generation);
    }
    markClean() {
        return this._codeMirror.changeGeneration(true);
    }
    _hasLongLines() {
        function lineIterator(lineHandle) {
            if (lineHandle.text.length > CodeMirrorTextEditor.LongLineModeLineLengthThreshold) {
                hasLongLines = true;
            }
            return hasLongLines;
        }
        let hasLongLines = false;
        this._codeMirror.eachLine(lineIterator);
        return hasLongLines;
    }
    _enableLongLinesMode() {
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        this._codeMirror.setOption('styleSelectedText', false);
    }
    _disableLongLinesMode() {
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        this._codeMirror.setOption('styleSelectedText', true);
    }
    _updateIndentSize(updatedValue) {
        const { indentWithTabs, indentUnit } = CodeMirrorTextEditor._getIndentation(updatedValue.data);
        this._codeMirror.setOption('indentUnit', indentUnit);
        this._codeMirror.setOption('indentWithTabs', indentWithTabs);
    }
    setMimeType(mimeType) {
        this._mimeType = mimeType;
        const rewrittenMimeType = this.rewriteMimeType(mimeType);
        const modeOption = this._codeMirror.getOption('mode');
        if (modeOption !== rewrittenMimeType) {
            this._codeMirror.setOption('mode', rewrittenMimeType);
        }
    }
    setHighlightMode(mode) {
        this._mimeType = '';
        this._codeMirror.setOption('mode', mode);
    }
    rewriteMimeType(mimeType) {
        // Overridden in SourcesTextEditor
        return mimeType;
    }
    mimeType() {
        return this._mimeType;
    }
    setReadOnly(readOnly) {
        if (this._readOnly === readOnly) {
            return;
        }
        this.clearPositionHighlight();
        this._readOnly = readOnly;
        this.element.classList.toggle('CodeMirror-readonly', readOnly);
        this._codeMirror.setOption('readOnly', readOnly);
    }
    readOnly() {
        return Boolean(this._codeMirror.getOption('readOnly'));
    }
    setLineNumberFormatter(formatter) {
        this._codeMirror.setOption('lineNumberFormatter', formatter);
    }
    addKeyDownHandler(handler) {
        this._codeMirror.on('keydown', /**
    * @param {*} CodeMirror
    * @param {!KeyboardEvent} event
    */ (CodeMirror, event) => handler(event));
    }
    addBookmark(lineNumber, columnNumber, element, type, insertBefore) {
        const marker = this._codeMirror.setBookmark(new CodeMirror.Pos(lineNumber, columnNumber), { widget: element, insertLeft: insertBefore });
        const bookmark = new TextEditorBookMark(marker, type, this);
        this._bookmarkForMarker.set(marker, bookmark);
        this._updateDecorations(lineNumber);
        return bookmark;
    }
    bookmarks(range, type) {
        const pos = TextUtils.CodeMirrorUtils.toPos(range);
        let markers = this._codeMirror.findMarksAt(pos.start);
        if (!range.isEmpty()) {
            const middleMarkers = this._codeMirror.findMarks(pos.start, pos.end);
            const endMarkers = this._codeMirror.findMarksAt(pos.end);
            markers = markers.concat(middleMarkers, endMarkers);
        }
        const bookmarks = [];
        for (let i = 0; i < markers.length; i++) {
            const marker = markers[i];
            const bookmark = this._bookmarkForMarker.get(marker);
            if (bookmark && (!type || bookmark.type() === type)) {
                bookmarks.push(bookmark);
            }
        }
        return bookmarks;
    }
    focus() {
        this._codeMirror.focus();
    }
    hasFocus() {
        return this._codeMirror.hasFocus();
    }
    operation(operation) {
        this._codeMirror.operation(operation);
    }
    scrollLineIntoView(lineNumber) {
        this._innerRevealLine(lineNumber, this._codeMirror.getScrollInfo());
    }
    _innerRevealLine(lineNumber, scrollInfo) {
        const topLine = this._codeMirror.lineAtHeight(scrollInfo.top, 'local');
        const bottomLine = this._codeMirror.lineAtHeight(scrollInfo.top + scrollInfo.clientHeight, 'local');
        const linesPerScreen = bottomLine - topLine + 1;
        if (lineNumber < topLine) {
            const topLineToReveal = Math.max(lineNumber - (linesPerScreen / 2) + 1, 0) | 0;
            this._codeMirror.scrollIntoView(new CodeMirror.Pos(topLineToReveal, 0));
        }
        else if (lineNumber > bottomLine) {
            const bottomLineToReveal = Math.min(lineNumber + (linesPerScreen / 2) - 1, this.linesCount - 1) | 0;
            this._codeMirror.scrollIntoView(new CodeMirror.Pos(bottomLineToReveal, 0));
        }
    }
    addDecoration(element, lineNumber, startColumn, endColumn) {
        const widget = this._codeMirror.addLineWidget(lineNumber, element);
        let update = null;
        if (typeof startColumn !== 'undefined') {
            if (typeof endColumn === 'undefined') {
                endColumn = Infinity;
            }
            update = this._updateFloatingDecoration.bind(this, element, lineNumber, startColumn, endColumn);
            update();
        }
        this._decorations.set(lineNumber, { element: element, update: update, widget: widget });
    }
    _updateFloatingDecoration(element, lineNumber, startColumn, endColumn) {
        const base = this._codeMirror.cursorCoords(new CodeMirror.Pos(lineNumber, 0), 'page');
        const start = this._codeMirror.cursorCoords(new CodeMirror.Pos(lineNumber, startColumn), 'page');
        const end = this._codeMirror.charCoords(new CodeMirror.Pos(lineNumber, endColumn), 'page');
        element.style.width = (end.right - start.left) + 'px';
        element.style.left = (start.left - base.left) + 'px';
    }
    _updateDecorations(lineNumber) {
        this._decorations.get(lineNumber).forEach(innerUpdateDecorations);
        function innerUpdateDecorations(decoration) {
            if (decoration.update) {
                decoration.update();
            }
        }
    }
    removeDecoration(element, lineNumber) {
        this._decorations.get(lineNumber).forEach(innerRemoveDecoration.bind(this));
        function innerRemoveDecoration(decoration) {
            if (decoration.element !== element) {
                return;
            }
            this._codeMirror.removeLineWidget(decoration.widget);
            this._decorations.delete(lineNumber, decoration);
        }
    }
    revealPosition(lineNumber, columnNumber, shouldHighlight) {
        lineNumber = Platform.NumberUtilities.clamp(lineNumber, 0, this._codeMirror.lineCount() - 1);
        if (typeof columnNumber !== 'number') {
            columnNumber = 0;
        }
        columnNumber = Platform.NumberUtilities.clamp(columnNumber, 0, this._codeMirror.getLine(lineNumber).length);
        this.clearPositionHighlight();
        this._highlightedLine = this._codeMirror.getLineHandle(lineNumber);
        if (!this._highlightedLine) {
            return;
        }
        this.scrollLineIntoView(lineNumber);
        if (shouldHighlight) {
            this._codeMirror.addLineClass(this._highlightedLine, null, this._readOnly ? 'cm-readonly-highlight' : 'cm-highlight');
            if (!this._readOnly) {
                this._clearHighlightTimeout = window.setTimeout(this.clearPositionHighlight.bind(this), 2000);
            }
        }
        this.setSelection(TextUtils.TextRange.TextRange.createFromLocation(lineNumber, columnNumber));
    }
    clearPositionHighlight() {
        if (this._clearHighlightTimeout) {
            clearTimeout(this._clearHighlightTimeout);
        }
        delete this._clearHighlightTimeout;
        if (this._highlightedLine) {
            this._codeMirror.removeLineClass(
            // @ts-ignore the `null` argument should be a string?
            this._highlightedLine, null, this._readOnly ? 'cm-readonly-highlight' : 'cm-highlight');
        }
        delete this._highlightedLine;
    }
    elementsToRestoreScrollPositionsFor() {
        return [];
    }
    _updatePaddingBottom(width, height) {
        let newPaddingBottom = 0;
        const linesElement = this._codeMirrorElement.getElementsByClassName('CodeMirror-lines')[0];
        if (this._options.padBottom) {
            const scrollInfo = this._codeMirror.getScrollInfo();
            const lineCount = this._codeMirror.lineCount();
            if (lineCount > 1) {
                newPaddingBottom =
                    // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
                    Math.max(scrollInfo.clientHeight - this._codeMirror.getLineHandle(this._codeMirror.lastLine()).height, 0);
            }
        }
        const stringPaddingBottomValue = String(newPaddingBottom) + 'px';
        if (linesElement.style.paddingBottom !== stringPaddingBottomValue) {
            linesElement.style.paddingBottom = stringPaddingBottomValue;
            this._codeMirror.setSize(width, height);
        }
    }
    toggleScrollPastEof(enableScrolling) {
        if (this._options.padBottom === enableScrolling) {
            return;
        }
        this._options.padBottom = enableScrolling;
        this._resizeEditor();
    }
    _resizeEditor() {
        const parentElement = this.element.parentElement;
        if (!parentElement || !this.isShowing()) {
            return;
        }
        this._codeMirror.operation(() => {
            const scrollLeft = this._codeMirror.doc.scrollLeft;
            const scrollTop = this._codeMirror.doc.scrollTop;
            const width = parentElement.offsetWidth;
            const height = parentElement.offsetHeight - this.element.offsetTop;
            if (this._options.autoHeight) {
                this._codeMirror.setSize(width, 'auto');
            }
            else {
                this._codeMirror.setSize(width, height);
                this._updatePaddingBottom(width, height);
            }
            this._codeMirror.scrollTo(scrollLeft, scrollTop);
        });
    }
    onResize() {
        if (this._autocompleteController) {
            this._autocompleteController.clearAutocomplete();
        }
        this._resizeEditor();
        this._editorSizeInSync = true;
        if (this._selectionSetScheduled) {
            delete this._selectionSetScheduled;
            if (this._lastSelection) {
                this.setSelection(this._lastSelection);
            }
        }
    }
    editRange(range, text, origin) {
        const pos = TextUtils.CodeMirrorUtils.toPos(range);
        this._codeMirror.replaceRange(text, pos.start, pos.end, origin);
        const newRange = TextUtils.CodeMirrorUtils.toRange(pos.start, this._codeMirror.posFromIndex(this._codeMirror.indexFromPos(pos.start) + text.length));
        this.dispatchEventToListeners(UI.TextEditor.Events.TextChanged, { oldRange: range, newRange: newRange });
        return newRange;
    }
    clearAutocomplete() {
        if (this._autocompleteController) {
            this._autocompleteController.clearAutocomplete();
        }
    }
    wordRangeForCursorPosition(lineNumber, column, isWordChar) {
        const line = this.line(lineNumber);
        let wordStart = column;
        if (column !== 0 && isWordChar(line.charAt(column - 1))) {
            wordStart = column - 1;
            while (wordStart > 0 && isWordChar(line.charAt(wordStart - 1))) {
                --wordStart;
            }
        }
        let wordEnd = column;
        while (wordEnd < line.length && isWordChar(line.charAt(wordEnd))) {
            ++wordEnd;
        }
        return new TextUtils.TextRange.TextRange(lineNumber, wordStart, lineNumber, wordEnd);
    }
    // https://crbug.com/1151919 first * = CodeMirror.Editor, second * = CodeMirror.EditorChangeLinkedList
    _changes(codeMirror, changes) {
        if (!changes.length) {
            return;
        }
        this._updatePlaceholder();
        // We do not show "scroll beyond end of file" span for one line documents, so we need to check if "document has one line" changed.
        const hasOneLine = this._codeMirror.lineCount() === 1;
        if (hasOneLine !== this._hasOneLine) {
            this._resizeEditor();
        }
        this._hasOneLine = hasOneLine;
        this._decorations.valuesArray().forEach(decoration => this._codeMirror.removeLineWidget(decoration.widget));
        this._decorations.clear();
        const edits = [];
        let currentEdit;
        for (let changeIndex = 0; changeIndex < changes.length; ++changeIndex) {
            const changeObject = changes[changeIndex];
            const edit = TextUtils.CodeMirrorUtils.changeObjectToEditOperation(changeObject);
            if (currentEdit && edit.oldRange.equal(currentEdit.newRange)) {
                currentEdit.newRange = edit.newRange;
            }
            else {
                currentEdit = edit;
                edits.push(currentEdit);
            }
        }
        for (let i = 0; i < edits.length; i++) {
            this.dispatchEventToListeners(UI.TextEditor.Events.TextChanged, { oldRange: edits[i].oldRange, newRange: edits[i].newRange });
        }
    }
    // https://crbug.com/1151919 first * = CodeMirror.Editor, second and third * = CodeMirror.Pos
    _beforeSelectionChange(_codeMirror, _selection) {
        this._selectNextOccurrenceController.selectionWillChange();
    }
    scrollToLine(lineNumber) {
        const pos = new CodeMirror.Pos(lineNumber, 0);
        const coords = this._codeMirror.charCoords(pos, 'local');
        this._codeMirror.scrollTo(0, coords.top);
    }
    firstVisibleLine() {
        return this._codeMirror.lineAtHeight(this._codeMirror.getScrollInfo().top, 'local');
    }
    scrollTop() {
        return this._codeMirror.getScrollInfo().top;
    }
    setScrollTop(scrollTop) {
        this._codeMirror.scrollTo(0, scrollTop);
    }
    lastVisibleLine() {
        const scrollInfo = this._codeMirror.getScrollInfo();
        return this._codeMirror.lineAtHeight(scrollInfo.top + scrollInfo.clientHeight, 'local');
    }
    selection() {
        const start = this._codeMirror.getCursor('anchor');
        const end = this._codeMirror.getCursor('head');
        return TextUtils.CodeMirrorUtils.toRange(start, end);
    }
    selections() {
        const selectionList = this._codeMirror.listSelections();
        const result = [];
        for (let i = 0; i < selectionList.length; ++i) {
            const selection = selectionList[i];
            result.push(TextUtils.CodeMirrorUtils.toRange(selection.anchor, selection.head));
        }
        return result;
    }
    lastSelection() {
        return this._lastSelection || null;
    }
    setSelection(textRange, dontScroll) {
        this._lastSelection = textRange;
        if (!this._editorSizeInSync) {
            this._selectionSetScheduled = true;
            return;
        }
        const pos = TextUtils.CodeMirrorUtils.toPos(textRange);
        // https://crbug.com/1151919 both * = CodeMirror.Position
        const startAsPosition = pos.start;
        const endAsPosition = pos.end;
        const scroll = !dontScroll;
        this._codeMirror.setSelection(startAsPosition, endAsPosition, { scroll });
    }
    setSelections(ranges, primarySelectionIndex) {
        const selections = [];
        for (let i = 0; i < ranges.length; ++i) {
            const selection = TextUtils.CodeMirrorUtils.toPos(ranges[i]);
            selections.push({ anchor: selection.start, head: selection.end });
        }
        primarySelectionIndex = primarySelectionIndex || 0;
        this._codeMirror.setSelections(selections, primarySelectionIndex, { scroll: false });
    }
    _detectLineSeparator(text) {
        this._lineSeparator = text.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
    }
    setText(text) {
        if (text.length > CodeMirrorTextEditor.MaxEditableTextSize) {
            this.configureAutocomplete(null);
            this.setReadOnly(true);
        }
        this._codeMirror.setValue(text);
        if (this._shouldClearHistory) {
            this._codeMirror.clearHistory();
            this._shouldClearHistory = false;
        }
        this._detectLineSeparator(text);
        if (this._hasLongLines()) {
            this._enableLongLinesMode();
        }
        else {
            this._disableLongLinesMode();
        }
        if (!this.isShowing()) {
            this.refresh();
        }
    }
    text(textRange) {
        if (!textRange) {
            return this._codeMirror.getValue(this._lineSeparator);
        }
        const pos = TextUtils.CodeMirrorUtils.toPos(textRange.normalize());
        return this._codeMirror.getRange(pos.start, pos.end, this._lineSeparator);
    }
    textWithCurrentSuggestion() {
        if (!this._autocompleteController) {
            return this.text();
        }
        return this._autocompleteController.textWithCurrentSuggestion();
    }
    fullRange() {
        const lineCount = this.linesCount;
        const lastLine = this._codeMirror.getLine(lineCount - 1);
        return TextUtils.CodeMirrorUtils.toRange(new CodeMirror.Pos(0, 0), new CodeMirror.Pos(lineCount - 1, lastLine.length));
    }
    currentLineNumber() {
        return this._codeMirror.getCursor().line;
    }
    line(lineNumber) {
        return this._codeMirror.getLine(lineNumber);
    }
    get linesCount() {
        return this._codeMirror.lineCount();
    }
    newlineAndIndent() {
        this._codeMirror.execCommand('newlineAndIndent');
    }
    textEditorPositionHandle(lineNumber, columnNumber) {
        return new CodeMirrorPositionHandle(this._codeMirror, new CodeMirror.Pos(lineNumber, columnNumber));
    }
    _updatePlaceholder() {
        if (!this._placeholderElement) {
            return;
        }
        this._placeholderElement.remove();
        if (this.linesCount === 1 && !this.line(0)) {
            // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
            this._codeMirror.display.lineSpace.insertBefore(
            // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
            this._placeholderElement, this._codeMirror.display.lineSpace.firstChild);
        }
    }
    static maxHighlightLength = 1000;
    static LongLineModeLineLengthThreshold = 2000;
    static MaxEditableTextSize = 1024 * 1024 * 10;
}
CodeMirrorTextEditor._overrideModeWithPrefixedTokens('css', 'css-');
CodeMirrorTextEditor._overrideModeWithPrefixedTokens('javascript', 'js-');
CodeMirrorTextEditor._overrideModeWithPrefixedTokens('xml', 'xml-');
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.autocomplete = CodeMirrorTextEditor.autocompleteCommand;
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.undoLastSelection = CodeMirrorTextEditor.undoLastSelectionCommand;
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.selectNextOccurrence = CodeMirrorTextEditor.selectNextOccurrenceCommand;
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.moveCamelLeft = CodeMirrorTextEditor.moveCamelLeftCommand.bind(null, false);
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.selectCamelLeft = CodeMirrorTextEditor.moveCamelLeftCommand.bind(null, true);
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.moveCamelRight = CodeMirrorTextEditor.moveCamelRightCommand.bind(null, false);
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.selectCamelRight = CodeMirrorTextEditor.moveCamelRightCommand.bind(null, true);
// @ts-ignore https://crbug.com/1151919 * = CodeMirror.Editor
CodeMirror.commands.UserIndent = function (codeMirror) {
    const ranges = codeMirror.listSelections();
    if (ranges.length === 0) {
        return;
    }
    if (codeMirror.somethingSelected()) {
        codeMirror.indentSelection('add');
        return;
    }
    const indentation = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
    codeMirror.replaceSelection(indentation);
};
// https://crbug.com/1151919 * = CodeMirror.Editor
// @ts-ignore TS doesn't find the property even though it's defined in codemirror-legacy.d.ts
CodeMirror.commands.indentLessOrPass = function (codeMirror) {
    const selections = codeMirror.listSelections();
    if (selections.length === 1) {
        const range = TextUtils.CodeMirrorUtils.toRange(selections[0].anchor, selections[0].head);
        if (range.isEmpty() && !/^\s/.test(codeMirror.getLine(range.startLine))) {
            return CodeMirror.Pass;
        }
    }
    codeMirror.execCommand('indentLess');
    return undefined;
};
// https://crbug.com/1151919 * = CodeMirror.Editor
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.gotoMatchingBracket = function (codeMirror) {
    const updatedSelections = [];
    const selections = codeMirror.listSelections();
    for (let i = 0; i < selections.length; ++i) {
        const selection = selections[i];
        const cursor = selection.head;
        // @ts-ignore findMatchingBracket types are incorrect
        const matchingBracket = codeMirror.findMatchingBracket(cursor, false, { maxScanLines: 10000 });
        let updatedHead = cursor;
        if (matchingBracket && matchingBracket.match) {
            const columnCorrection = CodeMirror.cmpPos(matchingBracket.from, cursor) === 0 ? 1 : 0;
            updatedHead = new CodeMirror.Pos(matchingBracket.to.line, matchingBracket.to.ch + columnCorrection);
        }
        updatedSelections.push({ anchor: updatedHead, head: updatedHead });
    }
    codeMirror.setSelections(updatedSelections);
};
// https://crbug.com/1151919 * = CodeMirror.Editor
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.undoAndReveal = function (codemirror) {
    const scrollInfo = codemirror.getScrollInfo();
    codemirror.execCommand('undo');
    const cursor = codemirror.getCursor('start');
    CodeMirrorTextEditor.getForCodeMirror(codemirror)._innerRevealLine(cursor.line, scrollInfo);
    const autocompleteController = CodeMirrorTextEditor.getForCodeMirror(codemirror)._autocompleteController;
    if (autocompleteController) {
        autocompleteController.clearAutocomplete();
    }
};
// https://crbug.com/1151919 * = CodeMirror.Editor
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.redoAndReveal = function (codemirror) {
    const scrollInfo = codemirror.getScrollInfo();
    codemirror.execCommand('redo');
    const cursor = codemirror.getCursor('start');
    CodeMirrorTextEditor.getForCodeMirror(codemirror)._innerRevealLine(cursor.line, scrollInfo);
    const autocompleteController = CodeMirrorTextEditor.getForCodeMirror(codemirror)._autocompleteController;
    if (autocompleteController) {
        autocompleteController.clearAutocomplete();
    }
};
// https://crbug.com/1151919 * = CodeMirror.Editor
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.dismiss = function (codemirror) {
    const selections = codemirror.listSelections();
    const selection = selections[0];
    if (selections.length === 1) {
        if (TextUtils.CodeMirrorUtils.toRange(selection.anchor, selection.head).isEmpty()) {
            return CodeMirror.Pass;
        }
        codemirror.setSelection(selection.anchor, selection.anchor, { scroll: false });
        CodeMirrorTextEditor.getForCodeMirror(codemirror).scrollLineIntoView(selection.anchor.line);
        return;
    }
    codemirror.setSelection(selection.anchor, selection.head, { scroll: false });
    CodeMirrorTextEditor.getForCodeMirror(codemirror).scrollLineIntoView(selection.anchor.line);
    return undefined;
};
// https://crbug.com/1151919 * = CodeMirror.Editor
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.goSmartPageUp = function (codemirror) {
    if (CodeMirrorTextEditor.getForCodeMirror(codemirror)
        .selection()
        .equal(TextUtils.TextRange.TextRange.createFromLocation(0, 0))) {
        return CodeMirror.Pass;
    }
    codemirror.execCommand('goPageUp');
    return undefined;
};
// https://crbug.com/1151919 * = CodeMirror.Editor
// @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
CodeMirror.commands.goSmartPageDown = function (codemirror) {
    if (CodeMirrorTextEditor.getForCodeMirror(codemirror)
        .selection()
        .equal(CodeMirrorTextEditor.getForCodeMirror(codemirror).fullRange().collapseToEnd())) {
        return CodeMirror.Pass;
    }
    codemirror.execCommand('goPageDown');
    return undefined;
};
export class CodeMirrorPositionHandle {
    _codeMirror;
    _lineHandle;
    _columnNumber;
    // https://crbug.com/1151919 first * = CodeMirror.Editor, second * = CodeMirror.Pos
    constructor(codeMirror, pos) {
        this._codeMirror = codeMirror;
        this._lineHandle = codeMirror.getLineHandle(pos.line);
        this._columnNumber = pos.ch;
    }
    resolve() {
        const lineNumber = this._lineHandle ? this._codeMirror.getLineNumber(this._lineHandle) : null;
        if (typeof lineNumber !== 'number') {
            return null;
        }
        return { lineNumber: lineNumber, columnNumber: this._columnNumber };
    }
    equal(argPositionHandle) {
        const positionHandle = argPositionHandle;
        return positionHandle._lineHandle === this._lineHandle && positionHandle._columnNumber === this._columnNumber &&
            positionHandle._codeMirror === this._codeMirror;
    }
}
export class SelectNextOccurrenceController {
    _textEditor;
    _codeMirror;
    _muteSelectionListener;
    _fullWordSelection;
    // https://crbug.com/1151919 * = CodeMirror.Editor
    constructor(textEditor, codeMirror) {
        this._textEditor = textEditor;
        this._codeMirror = codeMirror;
    }
    selectionWillChange() {
        if (!this._muteSelectionListener) {
            delete this._fullWordSelection;
        }
    }
    _findRange(selections, range) {
        for (let i = 0; i < selections.length; ++i) {
            if (range.equal(selections[i])) {
                return true;
            }
        }
        return false;
    }
    undoLastSelection() {
        this._muteSelectionListener = true;
        this._codeMirror.execCommand('undoSelection');
        this._muteSelectionListener = false;
    }
    selectNextOccurrence() {
        const selections = this._textEditor.selections();
        let anyEmptySelection = false;
        for (let i = 0; i < selections.length; ++i) {
            const selection = selections[i];
            anyEmptySelection = anyEmptySelection || selection.isEmpty();
            if (selection.startLine !== selection.endLine) {
                return;
            }
        }
        if (anyEmptySelection) {
            this._expandSelectionsToWords(selections);
            return;
        }
        const last = selections[selections.length - 1];
        let next = last;
        do {
            next = next ? this._findNextOccurrence(next, Boolean(this._fullWordSelection)) : null;
        } while (next && this._findRange(selections, next) && !next.equal(last));
        if (!next) {
            return;
        }
        selections.push(next);
        this._muteSelectionListener = true;
        this._textEditor.setSelections(selections, selections.length - 1);
        delete this._muteSelectionListener;
        this._textEditor.scrollLineIntoView(next.startLine);
    }
    _expandSelectionsToWords(selections) {
        const newSelections = [];
        for (let i = 0; i < selections.length; ++i) {
            const selection = selections[i];
            const startRangeWord = this._textEditor.wordRangeForCursorPosition(selection.startLine, selection.startColumn, TextUtils.TextUtils.Utils.isWordChar) ||
                TextUtils.TextRange.TextRange.createFromLocation(selection.startLine, selection.startColumn);
            const endRangeWord = this._textEditor.wordRangeForCursorPosition(selection.endLine, selection.endColumn, TextUtils.TextUtils.Utils.isWordChar) ||
                TextUtils.TextRange.TextRange.createFromLocation(selection.endLine, selection.endColumn);
            const newSelection = new TextUtils.TextRange.TextRange(startRangeWord.startLine, startRangeWord.startColumn, endRangeWord.endLine, endRangeWord.endColumn);
            newSelections.push(newSelection);
        }
        this._textEditor.setSelections(newSelections, newSelections.length - 1);
        this._fullWordSelection = true;
    }
    _findNextOccurrence(range, fullWord) {
        range = range.normalize();
        let matchedLineNumber = undefined;
        let matchedColumnNumber = undefined;
        const textToFind = this._textEditor.text(range);
        function findWordInLine(wordRegex, lineNumber, lineText, from, to) {
            if (typeof matchedLineNumber === 'number') {
                return true;
            }
            wordRegex.lastIndex = from;
            const result = wordRegex.exec(lineText);
            if (!result || result.index + textToFind.length > to) {
                return false;
            }
            matchedLineNumber = lineNumber;
            matchedColumnNumber = result.index;
            return true;
        }
        let iteratedLineNumber;
        // https://crbug.com/1151919 * = CodeMirror.LineHandle
        function lineIterator(regex, lineHandle) {
            if (findWordInLine(regex, iteratedLineNumber++, lineHandle.text, 0, lineHandle.text.length)) {
                return true;
            }
            return undefined;
        }
        let regexSource = Platform.StringUtilities.escapeForRegExp(textToFind);
        if (fullWord) {
            regexSource = '\\b' + regexSource + '\\b';
        }
        const wordRegex = new RegExp(regexSource, 'g');
        const currentLineText = this._codeMirror.getLine(range.startLine);
        findWordInLine(wordRegex, range.startLine, currentLineText, range.endColumn, currentLineText.length);
        iteratedLineNumber = range.startLine + 1;
        this._codeMirror.eachLine(range.startLine + 1, this._codeMirror.lineCount(), lineIterator.bind(null, wordRegex));
        iteratedLineNumber = 0;
        this._codeMirror.eachLine(0, range.startLine, lineIterator.bind(null, wordRegex));
        findWordInLine(wordRegex, range.startLine, currentLineText, 0, range.startColumn);
        if (typeof matchedLineNumber !== 'number' || typeof matchedColumnNumber !== 'number') {
            return null;
        }
        const textToFindLength = textToFind ? textToFind.length : 0;
        return new TextUtils.TextRange.TextRange(matchedLineNumber, matchedColumnNumber, matchedLineNumber, matchedColumnNumber + textToFindLength);
    }
}
export class TextEditorBookMark {
    _marker;
    _type;
    _editor;
    // https://crbug.com/1151919 * = CodeMirror.TextMarker
    constructor(marker, type, editor) {
        this._marker = marker;
        this._type = type;
        this._editor = editor;
    }
    clear() {
        const position = this._marker.find();
        this._marker.clear();
        if (position) {
            // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
            this._editor._updateDecorations(position.line);
        }
    }
    refresh() {
        this._marker.changed();
        const position = this._marker.find();
        if (position) {
            // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
            this._editor._updateDecorations(position.line);
        }
    }
    type() {
        return this._type;
    }
    position() {
        const pos = this._marker.find();
        // @ts-ignore https://crbug.com/1151919 CodeMirror types are incorrect
        return pos ? TextUtils.TextRange.TextRange.createFromLocation(pos.line, pos.ch) : null;
    }
}
let codeMirrorTextEditorFactoryInstance;
export class CodeMirrorTextEditorFactory {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!codeMirrorTextEditorFactoryInstance || forceNew) {
            codeMirrorTextEditorFactoryInstance = new CodeMirrorTextEditorFactory();
        }
        return codeMirrorTextEditorFactoryInstance;
    }
    createEditor(options) {
        return new CodeMirrorTextEditor(options);
    }
}
// CodeMirror uses an offscreen <textarea> to detect input. Due to inconsistencies in the many browsers it supports,
// it simplifies things by regularly checking if something is in the textarea, adding those characters to the document,
// and then clearing the textarea. This breaks assistive technology that wants to read from CodeMirror, because the
// <textarea> that they interact with is constantly empty.
// Because we target up-to-date Chrome, we can guarantee consistent input events. This lets us leave the current
// line from the editor in our <textarea>. CodeMirror still expects a mostly empty <textarea>, so we pass CodeMirror a
// fake <textarea> that only contains the users input.
// @ts-ignore
export class DevToolsAccessibleTextArea extends CodeMirror.inputStyles.textarea {
    textarea;
    contextMenuPending;
    composing;
    cm;
    prevInput;
    // https://crbug.com/1151919 * = CodeMirror.Editor
    constructor(codeMirror) {
        super(codeMirror);
        this.cm = codeMirror;
        this.contextMenuPending = false;
        this.composing = false;
    }
    init(display) {
        super.init(display);
        this.textarea.addEventListener('compositionstart', this._onCompositionStart.bind(this));
    }
    _onCompositionStart() {
        if (this.textarea.selectionEnd === this.textarea.value.length) {
            return;
        }
        // CodeMirror always expects the caret to be at the end of the textarea
        // When in IME composition mode, clip the textarea to how CodeMirror expects it,
        // and then let CodeMirror do it's thing.
        this.textarea.value = this.textarea.value.substring(0, this.textarea.selectionEnd);
        this.textarea.setSelectionRange(this.textarea.value.length, this.textarea.value.length);
        this.prevInput = this.textarea.value;
    }
    reset(typing) {
        if (this.textAreaBusy(Boolean(typing))) {
            super.reset(typing);
            return;
        }
        // When navigating around the document, keep the current visual line in the textarea.
        const cursor = this.cm.getCursor();
        let start, end;
        if (this.cm.getOption('lineWrapping')) {
            // To get the visual line, compute the leftmost and rightmost character positions.
            const top = this.cm.charCoords(cursor, 'page').top;
            start = this.cm.coordsChar({ left: -Infinity, top });
            end = this.cm.coordsChar({ left: Infinity, top });
        }
        else {
            // Limit the line to 1000 characters to prevent lag.
            const offset = Math.floor(cursor.ch / 1000) * 1000;
            start = { ch: offset, line: cursor.line };
            end = { ch: offset + 1000, line: cursor.line };
        }
        this.textarea.value = this.cm.getRange(start, end);
        const caretPosition = cursor.ch - start.ch;
        this.textarea.setSelectionRange(caretPosition, caretPosition);
        this.prevInput = this.textarea.value;
    }
    /**
     * If the user is currently typing into the textarea or otherwise
     * modifying it, we don't want to clobber their work.
     */
    textAreaBusy(typing) {
        return typing || this.contextMenuPending || this.composing || this.cm.somethingSelected();
    }
    poll() {
        if (this.contextMenuPending || this.composing) {
            return super.poll();
        }
        const text = this.textarea.value;
        let start = 0;
        const length = Math.min(this.prevInput.length, text.length);
        while (start < length && this.prevInput[start] === text[start]) {
            ++start;
        }
        let end = 0;
        while (end < length - start && this.prevInput[this.prevInput.length - end - 1] === text[text.length - end - 1]) {
            ++end;
        }
        // CodeMirror expects the user to be typing into a blank <textarea>.
        // Pass a fake textarea into super.poll that only contains the users input.
        const placeholder = this.textarea;
        this.textarea = document.createElement('textarea');
        this.textarea.value = text.substring(start, text.length - end);
        this.textarea.setSelectionRange(placeholder.selectionStart - start, placeholder.selectionEnd - start);
        this.prevInput = '';
        const result = super.poll();
        this.prevInput = text;
        this.textarea = placeholder;
        return result;
    }
}
// @ts-ignore
CodeMirror.inputStyles.devToolsAccessibleTextArea = DevToolsAccessibleTextArea;
//# sourceMappingURL=CodeMirrorTextEditor.js.map