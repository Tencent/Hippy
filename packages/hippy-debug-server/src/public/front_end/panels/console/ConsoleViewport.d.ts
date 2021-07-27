interface SelectionModel {
    item: number;
    node: Node;
    offset: number;
}
export declare class ConsoleViewport {
    element: HTMLElement;
    _topGapElement: HTMLElement;
    _topGapElementActive: boolean;
    _contentElement: HTMLElement;
    _bottomGapElement: HTMLElement;
    _bottomGapElementActive: boolean;
    _provider: ConsoleViewportProvider;
    _virtualSelectedIndex: number;
    _firstActiveIndex: number;
    _lastActiveIndex: number;
    _renderedItems: ConsoleViewportElement[];
    _anchorSelection: SelectionModel | null;
    _headSelection: SelectionModel | null;
    _itemCount: number;
    _cumulativeHeights: Int32Array;
    _muteCopyHandler: boolean;
    _observer: MutationObserver;
    _observerConfig: {
        childList: boolean;
        subtree: boolean;
    };
    _stickToBottom: boolean;
    _selectionIsBackward: boolean;
    _lastSelectedElement?: HTMLElement | null;
    _cachedProviderElements?: (ConsoleViewportElement | null)[];
    constructor(provider: ConsoleViewportProvider);
    stickToBottom(): boolean;
    setStickToBottom(value: boolean): void;
    hasVirtualSelection(): boolean;
    copyWithStyles(): void;
    _onCopy(event: ClipboardEvent): void;
    _onFocusIn(event: FocusEvent): void;
    _onFocusOut(event: FocusEvent): void;
    _isOutsideViewport(element: Element | null): boolean;
    _onDragStart(event: DragEvent): boolean;
    _onKeyDown(event: KeyboardEvent): void;
    _updateFocusedItem(focusLastChild?: boolean): void;
    contentElement(): Element;
    invalidate(): void;
    _providerElement(index: number): ConsoleViewportElement | null;
    _rebuildCumulativeHeights(): void;
    _rebuildCumulativeHeightsIfNeeded(): void;
    _cachedItemHeight(index: number): number;
    _isSelectionBackwards(selection: Selection | null): boolean;
    _createSelectionModel(itemIndex: number, node: Node, offset: number): {
        item: number;
        node: Node;
        offset: number;
    };
    _updateSelectionModel(selection: Selection | null): boolean;
    _restoreSelection(selection: Selection | null): void;
    _selectionContainsTable(): boolean;
    refresh(): void;
    _innerRefresh(): void;
    _partialViewportUpdate(prepare: () => void): void;
    _selectedText(): string | null;
    _textOffsetInNode(itemElement: Element, selectionNode: Node, offset: number): number;
    _onScroll(_event: Event): void;
    firstVisibleIndex(): number;
    lastVisibleIndex(): number;
    renderedElementAt(index: number): HTMLElement | null;
    scrollItemIntoView(index: number, makeLast?: boolean): void;
    forceScrollItemToBeFirst(index: number): void;
    forceScrollItemToBeLast(index: number): void;
    _visibleHeight(): number;
}
export interface ConsoleViewportProvider {
    fastHeight(index: number): number;
    itemCount(): number;
    minimumRowHeight(): number;
    itemElement(index: number): ConsoleViewportElement | null;
}
export interface ConsoleViewportElement {
    willHide(): void;
    wasShown(): void;
    element(): HTMLElement;
    focusLastChildOrSelf(): void;
}
export {};
