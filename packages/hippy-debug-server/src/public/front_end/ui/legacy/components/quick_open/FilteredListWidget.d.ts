import * as UI from '../../legacy.js';
export declare class FilteredListWidget extends UI.Widget.VBox implements UI.ListControl.ListDelegate<number> {
    _promptHistory: string[];
    _scoringTimer: number;
    _filterTimer: number;
    _loadTimeout: number;
    _refreshListWithCurrentResult: (() => void) | undefined;
    _dialog: UI.Dialog.Dialog | undefined;
    _query: string | undefined;
    _promptElement: HTMLElement;
    _prompt: UI.TextPrompt.TextPrompt;
    _bottomElementsContainer: HTMLElement;
    _progressElement: HTMLElement;
    _progressBarElement: HTMLElement;
    _items: UI.ListModel.ListModel<number>;
    _list: UI.ListControl.ListControl<number>;
    _itemElementsContainer: HTMLDivElement;
    _notFoundElement: HTMLElement;
    _prefix: string;
    _provider: Provider | null;
    _queryChangedCallback?: (arg0: string) => void;
    constructor(provider: Provider | null, promptHistory?: string[], queryChangedCallback?: ((arg0: string) => void));
    static highlightRanges(element: Element, query: string, caseInsensitive?: boolean): boolean;
    setPlaceholder(placeholder: string, ariaPlaceholder?: string): void;
    /**
     * Sets the text prompt's accessible title. By default, it is "Quick open prompt".
     */
    setPromptTitle(title: string): void;
    showAsDialog(dialogTitle?: string): void;
    setPrefix(prefix: string): void;
    setProvider(provider: Provider | null): void;
    setQuerySelectedRange(startIndex: number, endIndex: number): void;
    _attachProvider(): void;
    _value(): string;
    _cleanValue(): string;
    wasShown(): void;
    willHide(): void;
    _clearTimers(): void;
    _onEnter(_event: Event): void;
    _itemsLoaded(provider: Provider | null): void;
    _updateAfterItemsLoaded(): void;
    createElementForItem(item: number): Element;
    heightForItem(_item: number): number;
    isItemSelectable(_item: number): boolean;
    selectedItemChanged(_from: number | null, _to: number | null, fromElement: Element | null, toElement: Element | null): void;
    _onClick(event: Event): void;
    setQuery(query: string): void;
    _tabKeyPressed(): boolean;
    _itemsFilteredForTest(): void;
    _filterItems(): void;
    _refreshList(bestItems: number[], overflowItems: number[], filteredItems: number[]): void;
    _updateNotFoundMessage(hasItems: boolean): void;
    _onInput(): void;
    _queryChanged(): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    _onKeyDown(keyboardEvent: KeyboardEvent): void;
    _scheduleFilter(): void;
    _selectItem(itemIndex: number | null): void;
}
export declare class Provider {
    _refreshCallback: () => void;
    constructor();
    setRefreshCallback(refreshCallback: () => void): void;
    attach(): void;
    itemCount(): number;
    itemKeyAt(_itemIndex: number): string;
    itemScoreAt(_itemIndex: number, _query: string): number;
    renderItem(_itemIndex: number, _query: string, _titleElement: Element, _subtitleElement: Element): void;
    renderAsTwoRows(): boolean;
    selectItem(_itemIndex: number | null, _promptValue: string): void;
    refresh(): void;
    rewriteQuery(query: string): string;
    queryChanged(_query: string): void;
    notFoundText(_query: string): string;
    detach(): void;
}
export declare function registerProvider(registration: ProviderRegistration): void;
export declare function getRegisteredProviders(): ProviderRegistration[];
export interface ProviderRegistration {
    provider: () => Promise<Provider>;
    title?: (() => string);
    prefix: string;
}
