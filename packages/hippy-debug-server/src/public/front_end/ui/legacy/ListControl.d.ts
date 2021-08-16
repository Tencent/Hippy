import type * as Common from '../../core/common/common.js';
import type { ListModel } from './ListModel.js';
export interface ListDelegate<T> {
    createElementForItem(item: T): Element;
    /**
     * This method is not called in NonViewport mode.
     * Return zero to make list measure the item (only works in SameHeight mode).
     */
    heightForItem(item: T): number;
    isItemSelectable(item: T): boolean;
    selectedItemChanged(from: T | null, to: T | null, fromElement: HTMLElement | null, toElement: HTMLElement | null): void;
    updateSelectedItemARIA(fromElement: Element | null, toElement: Element | null): boolean;
}
export declare enum ListMode {
    NonViewport = "UI.ListMode.NonViewport",
    EqualHeightItems = "UI.ListMode.EqualHeightItems",
    VariousHeightItems = "UI.ListMode.VariousHeightItems"
}
export declare class ListControl<T> {
    element: HTMLDivElement;
    _topElement: HTMLElement;
    _bottomElement: HTMLElement;
    _firstIndex: number;
    _lastIndex: number;
    _renderedHeight: number;
    _topHeight: number;
    _bottomHeight: number;
    _model: ListModel<T>;
    _itemToElement: Map<T, Element>;
    _selectedIndex: number;
    _selectedItem: T | null;
    _delegate: ListDelegate<T>;
    _mode: ListMode;
    _fixedHeight: number;
    _variableOffsets: Int32Array;
    constructor(model: ListModel<T>, delegate: ListDelegate<T>, mode?: ListMode);
    setModel(model: ListModel<T>): void;
    _replacedItemsInRange(event: Common.EventTarget.EventTargetEvent): void;
    refreshItem(item: T): void;
    refreshItemByIndex(index: number): void;
    refreshAllItems(): void;
    invalidateRange(from: number, to: number): void;
    viewportResized(): void;
    invalidateItemHeight(): void;
    itemForNode(node: Node | null): T | null;
    scrollItemIntoView(item: T, center?: boolean): void;
    selectedItem(): T | null;
    selectedIndex(): number;
    selectItem(item: T | null, center?: boolean, dontScroll?: boolean): void;
    selectPreviousItem(canWrap?: boolean, center?: boolean): boolean;
    selectNextItem(canWrap?: boolean, center?: boolean): boolean;
    selectItemPreviousPage(center?: boolean): boolean;
    selectItemNextPage(center?: boolean): boolean;
    _scrollIntoView(index: number, center?: boolean): void;
    _onClick(event: Event): void;
    _onKeyDown(ev: Event): void;
    _totalHeight(): number;
    _indexAtOffset(offset: number): number;
    _elementAtIndex(index: number): Element;
    _refreshARIA(): void;
    _updateElementARIA(element: Element, index: number): void;
    _offsetAtIndex(index: number): number;
    _measureHeight(): void;
    _select(index: number, oldItem?: T | null, oldElement?: Element | null): void;
    _findFirstSelectable(index: number, direction: number, canWrap: boolean): number;
    _findPageSelectable(index: number, direction: number): number;
    _reallocateVariableOffsets(length: number, copyTo: number): void;
    _invalidate(from: number, to: number, inserted: number): void;
    _invalidateNonViewportMode(start: number, remove: number, add: number): void;
    _clearViewport(): void;
    _clearContents(): void;
    _updateViewport(scrollTop: number, viewportHeight: number): void;
}
