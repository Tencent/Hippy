import * as Common from '../../../../core/common/common.js';
import * as Formatter from '../../../../models/formatter/formatter.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import type * as Workspace from '../../../../models/workspace/workspace.js';
import * as UI from '../../legacy.js';
import type { SourcesTextEditorDelegate } from './SourcesTextEditor.js';
import { SourcesTextEditor } from './SourcesTextEditor.js';
export declare class SourceFrameImpl extends UI.View.SimpleView implements UI.SearchableView.Searchable, UI.SearchableView.Replaceable, SourcesTextEditorDelegate, Transformer {
    _lazyContent: () => Promise<TextUtils.ContentProvider.DeferredContent>;
    _pretty: boolean;
    _rawContent: string | null;
    _formattedContentPromise: Promise<{
        content: string;
        map: Formatter.ScriptFormatter.FormatterSourceMapping;
    }> | null;
    _formattedMap: Formatter.ScriptFormatter.FormatterSourceMapping | null;
    _prettyToggle: UI.Toolbar.ToolbarToggle;
    _shouldAutoPrettyPrint: boolean;
    _progressToolbarItem: UI.Toolbar.ToolbarItem;
    _textEditor: SourcesTextEditor;
    _prettyCleanGeneration: number | null;
    _cleanGeneration: number;
    _searchConfig: UI.SearchableView.SearchConfig | null;
    _delayedFindSearchMatches: (() => void) | null;
    _currentSearchResultIndex: number;
    _searchResults: TextUtils.TextRange.TextRange[];
    _searchRegex: RegExp | null;
    _loadError: boolean;
    _muteChangeEventsForSetContent: boolean;
    _sourcePosition: UI.Toolbar.ToolbarText;
    _searchableView: UI.SearchableView.SearchableView | null;
    _editable: boolean;
    _positionToReveal: {
        line: number;
        column: (number | undefined);
        shouldHighlight: (boolean | undefined);
    } | null;
    _lineToScrollTo: number | null;
    _selectionToSet: TextUtils.TextRange.TextRange | null;
    _loaded: boolean;
    _contentRequested: boolean;
    _highlighterType: string;
    _wasmDisassembly: Common.WasmDisassembly.WasmDisassembly | null;
    contentSet: boolean;
    constructor(lazyContent: () => Promise<TextUtils.ContentProvider.DeferredContent>, codeMirrorOptions?: UI.TextEditor.Options);
    get wasmDisassembly(): Common.WasmDisassembly.WasmDisassembly | null;
    editorLocationToUILocation(lineNumber: number, columnNumber?: number): {
        lineNumber: number;
        columnNumber?: number | undefined;
    };
    uiLocationToEditorLocation(lineNumber: number, columnNumber?: number | undefined): {
        lineNumber: number;
        columnNumber: number;
    };
    setCanPrettyPrint(canPrettyPrint: boolean, autoPrettyPrint?: boolean): void;
    _setPretty(value: boolean): Promise<void>;
    _updateLineNumberFormatter(): void;
    _updatePrettyPrintState(): void;
    _prettyToRawLocation(line: number, column?: number | undefined): number[];
    _rawToPrettyLocation(line: number, column: number): number[];
    setEditable(editable: boolean): void;
    hasLoadError(): boolean;
    wasShown(): void;
    willHide(): void;
    toolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    get loaded(): boolean;
    get textEditor(): SourcesTextEditor;
    get pretty(): boolean;
    _ensureContentLoaded(): Promise<void>;
    _requestFormattedContent(): Promise<{
        content: string;
        map: Formatter.ScriptFormatter.FormatterSourceMapping;
    }>;
    revealPosition(line: number, column?: number, shouldHighlight?: boolean): void;
    _innerRevealPositionIfNeeded(): void;
    _clearPositionToReveal(): void;
    scrollToLine(line: number): void;
    _innerScrollToLineIfNeeded(): void;
    selection(): TextUtils.TextRange.TextRange;
    setSelection(textRange: TextUtils.TextRange.TextRange): void;
    _innerSetSelectionIfNeeded(): void;
    _wasShownOrLoaded(): void;
    onTextChanged(_oldRange: TextUtils.TextRange.TextRange, _newRange: TextUtils.TextRange.TextRange): void;
    isClean(): boolean;
    contentCommitted(): void;
    _simplifyMimeType(content: string, mimeType: string): string;
    setHighlighterType(highlighterType: string): void;
    highlighterType(): string;
    _updateHighlighterType(content: string): void;
    setContent(content: string | null, loadError: string | null): void;
    setSearchableView(view: UI.SearchableView.SearchableView | null): void;
    _doFindSearchMatches(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards: boolean): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    _resetCurrentSearchResultIndex(): void;
    _resetSearch(): void;
    searchCanceled(): void;
    jumpToLastSearchResult(): void;
    _searchResultIndexForCurrentSelection(): number;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
    jumpToSearchResult(index: number): void;
    replaceSelectionWith(searchConfig: UI.SearchableView.SearchConfig, replacement: string): void;
    replaceAllWith(searchConfig: UI.SearchableView.SearchConfig, replacement: string): void;
    _collectRegexMatches(regexObject: RegExp): TextUtils.TextRange.TextRange[];
    populateLineGutterContextMenu(_contextMenu: UI.ContextMenu.ContextMenu, _editorLineNumber: number): Promise<void>;
    populateTextAreaContextMenu(_contextMenu: UI.ContextMenu.ContextMenu, _editorLineNumber: number, _editorColumnNumber: number): Promise<void>;
    canEditSource(): boolean;
    _updateSourcePosition(): void;
}
export interface LineDecorator {
    decorate(uiSourceCode: Workspace.UISourceCode.UISourceCode, textEditor: SourcesTextEditor, type: string): void;
}
export interface Transformer {
    editorLocationToUILocation(lineNumber: number, columnNumber?: number): {
        lineNumber: number;
        columnNumber?: number | undefined;
    };
    uiLocationToEditorLocation(lineNumber: number, columnNumber?: number): {
        lineNumber: number;
        columnNumber: number;
    };
}
export declare function registerLineDecorator(registration: LineDecoratorRegistration): void;
export declare function getRegisteredLineDecorators(): LineDecoratorRegistration[];
export declare enum DecoratorType {
    PERFORMANCE = "performance",
    MEMORY = "memory",
    COVERAGE = "coverage"
}
export interface LineDecoratorRegistration {
    lineDecorator: () => LineDecorator;
    decoratorType: DecoratorType;
}
