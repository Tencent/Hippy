import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
import * as TextEditor from '../text_editor/text_editor.js';
export declare class SourcesTextEditor extends TextEditor.CodeMirrorTextEditor.CodeMirrorTextEditor {
    _delegate: SourcesTextEditorDelegate;
    _gutterMouseMove: (event: Event) => void;
    _gutterMouseOut: () => void;
    _tokenHighlighter: TokenHighlighter;
    _gutters: string[];
    _isHandlingMouseDownEvent: boolean;
    _autocompleteConfig: UI.TextEditor.AutocompleteConfig | null;
    _infoBarDiv: Element | null;
    _selectionBeforeSearch?: TextUtils.TextRange.TextRange;
    _executionLine?: any;
    _executionLineTailMarker?: any;
    _indentationLevel?: any;
    _autoAppendedSpaces?: TextEditor.CodeMirrorTextEditor.TextEditorPositionHandle[];
    constructor(delegate: SourcesTextEditorDelegate, codeMirrorOptions?: UI.TextEditor.Options);
    static getForCodeMirror(codeMirrorEditor: any): SourcesTextEditor;
    attachInfobar(infobar: UI.Infobar.Infobar): void;
    static _guessIndentationLevel(lines: string[]): string;
    _isSearchActive(): boolean;
    scrollToLine(lineNumber: number): void;
    highlightSearchResults(regex: RegExp, range: TextUtils.TextRange.TextRange | null): void;
    cancelSearchResultsHighlight(): void;
    removeHighlight(highlightDescriptor: any): void;
    highlightRange(range: TextUtils.TextRange.TextRange, cssClass: string): any;
    installGutter(type: string, leftToNumbers: boolean): void;
    uninstallGutter(type: string): void;
    setGutterDecoration(lineNumber: number, type: string, element: Element | null): void;
    setExecutionLocation(lineNumber: number, columnNumber: number): void;
    showExecutionLineBackground(): void;
    hideExecutionLineBackground(): void;
    clearExecutionLine(): void;
    toggleLineClass(lineNumber: number, className: string, toggled: boolean): void;
    hasLineClass(lineNumber: number, className: string): boolean;
    /**
     * |instance| is actually a CodeMirror.Editor
     */
    _gutterClick(_instance: Object, lineNumber: number, gutterType: string, event: MouseEvent): void;
    _textAreaContextMenu(event: MouseEvent): void;
    /**
     * |instance| is actually a CodeMirror.Editor
     */
    _gutterContextMenu(_instance: Object, lineNumber: number, _gutterType: string, event: MouseEvent): void;
    editRange(range: TextUtils.TextRange.TextRange, text: string, origin?: string): TextUtils.TextRange.TextRange;
    _onUpdateEditorIndentation(): void;
    _setEditorIndentation(lines: string[]): void;
    indent(): string;
    _onAutoAppendedSpaces(): void;
    _cursorActivity(): void;
    _reportJump(from: TextUtils.TextRange.TextRange | null, to: TextUtils.TextRange.TextRange | null): void;
    _scroll(): void;
    _focus(): void;
    _blur(): void;
    _fireBeforeSelectionChanged(_codeMirror: typeof CodeMirror, selection: any): void;
    dispose(): void;
    setText(text: string): void;
    _updateWhitespace(): void;
    _updateCodeFolding(): void;
    _updateScrollPastEof(): void;
    rewriteMimeType(mimeType: string): string;
    _allWhitespaceOverlayMode(mimeType: string): string;
    _trailingWhitespaceOverlayMode(mimeType: string): string;
    _setupWhitespaceHighlight(): void;
    configureAutocomplete(config: UI.TextEditor.AutocompleteConfig | null): void;
    _updateAutocomplete(): void;
}
export declare enum Events {
    GutterClick = "GutterClick",
    SelectionChanged = "SelectionChanged",
    ScrollChanged = "ScrollChanged",
    EditorFocused = "EditorFocused",
    EditorBlurred = "EditorBlurred",
    JumpHappened = "JumpHappened"
}
export declare class SourcesTextEditorDelegate {
    populateLineGutterContextMenu(_contextMenu: UI.ContextMenu.ContextMenu, _lineNumber: number): Promise<void>;
    populateTextAreaContextMenu(_contextMenu: UI.ContextMenu.ContextMenu, _lineNumber: number, _columnNumber: number): Promise<void>;
}
export declare const _BlockIndentController: {
    name: string;
    Enter: (codeMirror: any) => any;
    '\'}\'': (codeMirror: any) => any;
};
export declare class TokenHighlighter {
    _textEditor: SourcesTextEditor;
    _codeMirror: any;
    _highlightDescriptor: {
        overlay: {
            token: (arg0: any) => string | null;
        };
        selectionStart: any;
    } | undefined;
    _highlightRegex?: RegExp;
    _highlightRange?: TextUtils.TextRange.TextRange | null;
    _searchResultMarker?: any;
    _searchMatchLength?: any;
    constructor(textEditor: SourcesTextEditor, codeMirror: any);
    highlightSearchResults(regex: RegExp, range: TextUtils.TextRange.TextRange | null): void;
    highlightedRegex(): RegExp | undefined;
    highlightSelectedTokens(): void;
    _isWord(selectedText: string, lineNumber: number, startColumn: number, endColumn: number): boolean;
    _removeHighlight(): void;
    _searchHighlighter(regex: RegExp, stream: any): string | null;
    _tokenHighlighter(token: string, selectionStart: any, stream: any): string | null;
    _setHighlighter(highlighter: (arg0: any) => string | null, selectionStart: any): void;
}
export declare const lineNumbersGutterType = "CodeMirror-linenumbers";
export interface GutterClickEventData {
    gutterType: string;
    lineNumber: number;
    event: MouseEvent;
}
