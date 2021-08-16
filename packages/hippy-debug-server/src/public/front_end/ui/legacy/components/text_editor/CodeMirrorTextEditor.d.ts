import * as Platform from '../../../../core/platform/platform.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
import { TextEditorAutocompleteController } from './TextEditorAutocompleteController.js';
export interface Token {
    startColumn: number;
    endColumn: number;
    type: string;
}
export interface Coordinates {
    x: number;
    y: number;
    height: number;
}
export declare class CodeMirrorTextEditor extends UI.Widget.VBox implements UI.TextEditor.TextEditor {
    _options: UI.TextEditor.Options;
    _codeMirror: any;
    _codeMirrorElement: HTMLElement;
    _shouldClearHistory: boolean;
    _lineSeparator: string;
    _hasOneLine: boolean;
    _bookmarkForMarker: WeakMap<any, TextEditorBookMark>;
    _selectNextOccurrenceController: SelectNextOccurrenceController;
    _decorations: Platform.MapUtilities.Multimap<number, Decoration>;
    _needsRefresh: boolean;
    _readOnly: boolean;
    _mimeType: string;
    _placeholderElement: HTMLPreElement | null;
    _autocompleteController?: TextEditorAutocompleteController;
    _highlightedLine?: any;
    _clearHighlightTimeout?: number;
    _editorSizeInSync?: boolean;
    _lastSelection?: TextUtils.TextRange.TextRange;
    _selectionSetScheduled?: boolean;
    constructor(options: UI.TextEditor.Options);
    static getForCodeMirror(codeMirrorEditor: any): CodeMirrorTextEditor;
    static autocompleteCommand(codeMirror: any): void;
    static undoLastSelectionCommand(codeMirror: any): void;
    static selectNextOccurrenceCommand(codeMirror: any): void;
    static moveCamelLeftCommand(shift: boolean, codeMirror: any): void;
    static moveCamelRightCommand(shift: boolean, codeMirror: any): void;
    static _getIndentation(indentationValue: string): {
        indentWithTabs: boolean;
        indentUnit: number;
    };
    static _overrideModeWithPrefixedTokens(modeName: string, tokenPrefix: string): void;
    static _fixWordMovement(codeMirror: any): void;
    codeMirror(): any;
    widget(): UI.Widget.Widget;
    setPlaceholder(placeholder: string): void;
    _normalizePositionForOverlappingColumn(lineNumber: number, lineLength: number, charNumber: number): {
        lineNumber: number;
        columnNumber: number;
    };
    _camelCaseMoveFromPosition(lineNumber: number, columnNumber: number, direction: number): {
        lineNumber: number;
        columnNumber: number;
    };
    _doCamelCaseMovement(direction: number, shift: boolean): void;
    dispose(): void;
    _enableBracketMatchingIfNeeded(): void;
    wasShown(): void;
    protected refresh(): void;
    willHide(): void;
    undo(): void;
    redo(): void;
    _handleKeyDown(e: Event): void;
    _handlePostKeyDown(e: Event): void;
    configureAutocomplete(config: UI.TextEditor.AutocompleteConfig | null): void;
    cursorPositionToCoordinates(lineNumber: number, column: number): Coordinates | null;
    coordinatesToCursorPosition(x: number, y: number): TextUtils.TextRange.TextRange | null;
    visualCoordinates(lineNumber: number, columnNumber: number): {
        x: number;
        y: number;
    };
    tokenAtTextPosition(lineNumber: number, columnNumber: number): Token | null;
    isClean(generation: number): boolean;
    markClean(): number;
    _hasLongLines(): boolean;
    _enableLongLinesMode(): void;
    _disableLongLinesMode(): void;
    _updateIndentSize(updatedValue: {
        data: any;
    }): void;
    setMimeType(mimeType: string): void;
    setHighlightMode(mode: Object): void;
    protected rewriteMimeType(mimeType: string): string;
    protected mimeType(): string;
    setReadOnly(readOnly: boolean): void;
    readOnly(): boolean;
    setLineNumberFormatter(formatter: (arg0: number) => string): void;
    addKeyDownHandler(handler: (arg0: KeyboardEvent) => void): void;
    addBookmark(lineNumber: number, columnNumber: number, element: HTMLElement, type: symbol, insertBefore?: boolean): TextEditorBookMark;
    bookmarks(range: TextUtils.TextRange.TextRange, type?: symbol): TextEditorBookMark[];
    focus(): void;
    hasFocus(): boolean;
    operation(operation: () => any): void;
    scrollLineIntoView(lineNumber: number): void;
    _innerRevealLine(lineNumber: number, scrollInfo: {
        left: number;
        top: number;
        width: number;
        height: number;
        clientWidth: number;
        clientHeight: number;
    }): void;
    addDecoration(element: HTMLElement, lineNumber: number, startColumn?: number, endColumn?: number): void;
    _updateFloatingDecoration(element: HTMLElement, lineNumber: number, startColumn: number, endColumn: number): void;
    _updateDecorations(lineNumber: number): void;
    removeDecoration(element: Element, lineNumber: number): void;
    revealPosition(lineNumber: number, columnNumber?: number, shouldHighlight?: boolean): void;
    clearPositionHighlight(): void;
    elementsToRestoreScrollPositionsFor(): Element[];
    _updatePaddingBottom(width: number, height: number): void;
    toggleScrollPastEof(enableScrolling: boolean): void;
    _resizeEditor(): void;
    onResize(): void;
    editRange(range: TextUtils.TextRange.TextRange, text: string, origin?: string): TextUtils.TextRange.TextRange;
    clearAutocomplete(): void;
    wordRangeForCursorPosition(lineNumber: number, column: number, isWordChar: (arg0: string) => boolean): TextUtils.TextRange.TextRange;
    _changes(codeMirror: any, changes: any): void;
    _beforeSelectionChange(_codeMirror: any, _selection: {
        ranges: Array<{
            head: any;
            anchor: any;
        }>;
    }): void;
    scrollToLine(lineNumber: number): void;
    firstVisibleLine(): number;
    scrollTop(): number;
    setScrollTop(scrollTop: number): void;
    lastVisibleLine(): number;
    selection(): TextUtils.TextRange.TextRange;
    selections(): TextUtils.TextRange.TextRange[];
    lastSelection(): TextUtils.TextRange.TextRange | null;
    setSelection(textRange: TextUtils.TextRange.TextRange, dontScroll?: boolean): void;
    setSelections(ranges: TextUtils.TextRange.TextRange[], primarySelectionIndex?: number): void;
    _detectLineSeparator(text: string): void;
    setText(text: string): void;
    text(textRange?: TextUtils.TextRange.TextRange): string;
    textWithCurrentSuggestion(): string;
    fullRange(): TextUtils.TextRange.TextRange;
    currentLineNumber(): number;
    line(lineNumber: number): string;
    get linesCount(): number;
    newlineAndIndent(): void;
    textEditorPositionHandle(lineNumber: number, columnNumber: number): TextEditorPositionHandle;
    _updatePlaceholder(): void;
    static readonly maxHighlightLength = 1000;
    static readonly LongLineModeLineLengthThreshold = 2000;
    static readonly MaxEditableTextSize: number;
}
export declare class CodeMirrorPositionHandle implements TextEditorPositionHandle {
    _codeMirror: any;
    _lineHandle: any;
    _columnNumber: any;
    constructor(codeMirror: any, pos: any);
    resolve(): {
        lineNumber: number;
        columnNumber: number;
    } | null;
    equal(argPositionHandle: TextEditorPositionHandle): boolean;
}
export declare class SelectNextOccurrenceController {
    _textEditor: CodeMirrorTextEditor;
    _codeMirror: any;
    _muteSelectionListener?: boolean;
    _fullWordSelection?: boolean;
    constructor(textEditor: CodeMirrorTextEditor, codeMirror: any);
    selectionWillChange(): void;
    _findRange(selections: TextUtils.TextRange.TextRange[], range: TextUtils.TextRange.TextRange): boolean;
    undoLastSelection(): void;
    selectNextOccurrence(): void;
    _expandSelectionsToWords(selections: TextUtils.TextRange.TextRange[]): void;
    _findNextOccurrence(range: TextUtils.TextRange.TextRange, fullWord: boolean): TextUtils.TextRange.TextRange | null;
}
/**
 * @interface
 */
export interface TextEditorPositionHandle {
    resolve(): {
        lineNumber: number;
        columnNumber: number;
    } | null;
    equal(positionHandle: TextEditorPositionHandle): boolean;
}
export declare class TextEditorBookMark {
    _marker: any;
    _type: symbol;
    _editor: CodeMirrorTextEditor;
    constructor(marker: any, type: symbol, editor: CodeMirrorTextEditor);
    clear(): void;
    refresh(): void;
    type(): symbol;
    position(): TextUtils.TextRange.TextRange | null;
}
export declare class CodeMirrorTextEditorFactory implements UI.TextEditor.TextEditorFactory {
    static instance(opts?: {
        forceNew: boolean | null;
    }): CodeMirrorTextEditorFactory;
    createEditor(options: UI.TextEditor.Options): CodeMirrorTextEditor;
}
export declare class DevToolsAccessibleTextArea extends CodeMirror.inputStyles.textarea {
    textarea: HTMLTextAreaElement;
    contextMenuPending: boolean;
    composing: boolean;
    cm: any;
    prevInput: string;
    constructor(codeMirror: any);
    init(display: Object): void;
    _onCompositionStart(): void;
    reset(typing?: boolean): void;
    /**
     * If the user is currently typing into the textarea or otherwise
     * modifying it, we don't want to clobber their work.
     */
    protected textAreaBusy(typing: boolean): boolean;
    poll(): boolean;
}
export interface Decoration {
    element: Element;
    widget: any;
    update: (() => void) | null;
}
