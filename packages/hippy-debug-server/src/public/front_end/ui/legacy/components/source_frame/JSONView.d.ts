import * as UI from '../../legacy.js';
import * as ObjectUI from '../object_ui/object_ui.js';
export declare class JSONView extends UI.Widget.VBox implements UI.SearchableView.Searchable {
    _initialized: boolean;
    _parsedJSON: ParsedJSON;
    _startCollapsed: boolean;
    _searchableView: UI.SearchableView.SearchableView | null;
    _treeOutline: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection;
    _currentSearchFocusIndex: number;
    _currentSearchTreeElements: ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement[];
    _searchRegex: RegExp | null;
    constructor(parsedJSON: ParsedJSON, startCollapsed?: boolean);
    static createView(content: string): Promise<UI.SearchableView.SearchableView | null>;
    static createViewSync(obj: Object | null): UI.SearchableView.SearchableView;
    static _parseJSON(text: string | null): Promise<ParsedJSON | null>;
    static _extractJSON(text: string): ParsedJSON | null;
    static _findBrackets(text: string, open: string, close: string): {
        start: number;
        end: number;
        length: number;
    };
    wasShown(): void;
    _initialize(): void;
    _jumpToMatch(index: number): void;
    _updateSearchCount(count: number): void;
    _updateSearchIndex(index: number): void;
    searchCanceled(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
}
export declare class ParsedJSON {
    data: any;
    prefix: string;
    suffix: string;
    constructor(data: any, prefix: string, suffix: string);
}
