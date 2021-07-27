import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { SearchConfig, SearchResult } from './SearchConfig.js';
export declare class SearchResultsPane extends UI.Widget.VBox {
    _searchConfig: SearchConfig;
    _searchResults: SearchResult[];
    _treeOutline: UI.TreeOutline.TreeOutlineInShadow;
    _matchesExpandedCount: number;
    constructor(searchConfig: SearchConfig);
    addSearchResult(searchResult: SearchResult): void;
    _addTreeElement(searchResult: SearchResult): void;
}
export declare const matchesExpandedByDefault = 20;
export declare const matchesShownAtOnce = 20;
export declare class SearchResultsTreeElement extends UI.TreeOutline.TreeElement {
    _searchConfig: SearchConfig;
    _searchResult: SearchResult;
    _initialized: boolean;
    toggleOnClick: boolean;
    constructor(searchConfig: SearchConfig, searchResult: SearchResult);
    onexpand(): void;
    _updateMatchesUI(): void;
    onattach(): void;
    _updateSearchMatches(): void;
    _appendSearchMatches(fromIndex: number, toIndex: number): void;
    _appendShowMoreMatchesElement(startMatchIndex: number): void;
    _createContentSpan(lineContent: string, matchRanges: TextUtils.TextRange.SourceRange[]): Element;
    _regexMatchRanges(lineContent: string, regex: RegExp): TextUtils.TextRange.SourceRange[];
    _showMoreMatchesElementSelected(showMoreMatchesTreeElement: UI.TreeOutline.TreeElement, startMatchIndex: number): boolean;
}
