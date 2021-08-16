import * as Common from '../../core/common/common.js';
import { HistoryInput } from './HistoryInput.js';
import { ToolbarToggle } from './Toolbar.js';
import { VBox } from './Widget.js';
export declare class SearchableView extends VBox {
    _searchProvider: Searchable;
    _replaceProvider: Replaceable | null;
    _setting: Common.Settings.Setting<any> | null;
    _replaceable: boolean;
    _footerElementContainer: HTMLElement;
    _footerElement: HTMLElement;
    _replaceToggleButton: ToolbarToggle;
    _searchInputElement: HistoryInput;
    _matchesElement: HTMLElement;
    _searchNavigationPrevElement: HTMLElement;
    _searchNavigationNextElement: HTMLElement;
    _replaceInputElement: HTMLInputElement;
    _buttonsContainer: HTMLElement;
    _caseSensitiveButton: ToolbarToggle | undefined;
    _regexButton: ToolbarToggle | undefined;
    _secondRowButtons: HTMLElement;
    _replaceButtonElement: HTMLButtonElement;
    _replaceAllButtonElement: HTMLButtonElement;
    _minimalSearchQuerySize: number;
    _searchIsVisible?: boolean;
    _currentQuery?: string;
    _valueChangedTimeoutId?: number;
    constructor(searchable: Searchable, replaceable: Replaceable | null, settingName?: string);
    static fromElement(element: Element | null): SearchableView | null;
    _toggleCaseSensitiveSearch(): void;
    _toggleRegexSearch(): void;
    _toggleReplace(): void;
    _saveSetting(): void;
    _loadSetting(): void;
    setMinimalSearchQuerySize(minimalSearchQuerySize: number): void;
    setPlaceholder(placeholder: string, ariaLabel?: string): void;
    setReplaceable(replaceable: boolean): void;
    updateSearchMatchesCount(matches: number): void;
    updateCurrentMatchIndex(currentMatchIndex: number): void;
    isSearchVisible(): boolean;
    closeSearch(): void;
    _toggleSearchBar(toggled: boolean): void;
    cancelSearch(): void;
    resetSearch(): void;
    refreshSearch(): void;
    handleFindNextShortcut(): boolean;
    handleFindPreviousShortcut(): boolean;
    handleFindShortcut(): boolean;
    handleCancelSearchShortcut(): boolean;
    _updateSearchNavigationButtonState(enabled: boolean): void;
    _updateSearchMatchesCountAndCurrentMatchIndex(matches: number, currentMatchIndex: number): void;
    showSearchField(): void;
    _updateReplaceVisibility(): void;
    _onSearchKeyDown(ev: Event): void;
    _onReplaceKeyDown(event: KeyboardEvent): void;
    _jumpToNextSearchResult(isBackwardSearch?: boolean): void;
    _onNextButtonSearch(_event: Event): void;
    _onPrevButtonSearch(_event: Event): void;
    _onFindClick(_event: Event): void;
    _onPreviousClick(_event: Event): void;
    _clearSearch(): void;
    _performSearch(forceSearch: boolean, shouldJump: boolean, jumpBackwards?: boolean): void;
    _currentSearchConfig(): SearchConfig;
    _updateSecondRowVisibility(): void;
    _replace(): void;
    _replaceAll(): void;
    _onInput(_event: Event): void;
    _onValueChanged(): void;
}
export declare const _symbol: unique symbol;
export interface Searchable {
    searchCanceled(): void;
    performSearch(searchConfig: SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
}
export interface Replaceable {
    replaceSelectionWith(searchConfig: SearchConfig, replacement: string): void;
    replaceAllWith(searchConfig: SearchConfig, replacement: string): void;
}
export declare class SearchConfig {
    query: string;
    caseSensitive: boolean;
    isRegex: boolean;
    constructor(query: string, caseSensitive: boolean, isRegex: boolean);
    toSearchRegex(global?: boolean): RegExp;
}
