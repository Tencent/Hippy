import * as UI from '../../legacy.js';
export declare class XMLView extends UI.Widget.Widget implements UI.SearchableView.Searchable {
    _treeOutline: UI.TreeOutline.TreeOutlineInShadow;
    _searchableView: UI.SearchableView.SearchableView | null;
    _currentSearchFocusIndex: number;
    _currentSearchTreeElements: XMLViewNode[];
    _searchConfig: UI.SearchableView.SearchConfig | null;
    constructor(parsedXML: Document);
    static createSearchableView(parsedXML: Document): UI.SearchableView.SearchableView;
    static parseXML(text: string, mimeType: string): Document | null;
    _jumpToMatch(index: number, shouldJump: boolean): void;
    _updateSearchCount(count: number): void;
    _updateSearchIndex(index: number): void;
    _innerPerformSearch(shouldJump: boolean, jumpBackwards?: boolean): void;
    _innerSearchCanceled(): void;
    searchCanceled(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
}
export declare class XMLViewNode extends UI.TreeOutline.TreeElement {
    _node: Node | ParentNode;
    _closeTag: boolean;
    _highlightChanges: UI.UIUtils.HighlightChange[];
    _xmlView: XMLView;
    constructor(node: Node | ParentNode, closeTag: boolean, xmlView: XMLView);
    static populate(root: UI.TreeOutline.TreeOutline | UI.TreeOutline.TreeElement, xmlNode: Node | ParentNode, xmlView: XMLView): void;
    setSearchRegex(regex: RegExp | null, additionalCssClassName?: string): boolean;
    revertHighlightChanges(): void;
    _updateTitle(): void;
    _setTitle(items: string[]): void;
    onattach(): void;
    onexpand(): void;
    oncollapse(): void;
    onpopulate(): Promise<void>;
}
