import type * as Common from '../../core/common/common.js';
import { GlassPane } from './GlassPane.js';
import type { ListDelegate } from './ListControl.js';
import { ListControl } from './ListControl.js';
import type { ListModel } from './ListModel.js';
export declare class SoftDropDown<T> implements ListDelegate<T> {
    _delegate: Delegate<T>;
    _selectedItem: T | null;
    _model: ListModel<T>;
    _placeholderText: Common.UIString.LocalizedString;
    element: HTMLButtonElement;
    _titleElement: HTMLElement;
    _glassPane: GlassPane;
    _list: ListControl<T>;
    _rowHeight: number;
    _width: number;
    _listWasShowing200msAgo: boolean;
    constructor(model: ListModel<T>, delegate: Delegate<T>);
    _show(event: Event): void;
    _updateGlasspaneSize(): void;
    _hide(event: Event): void;
    _onKeyDownButton(ev: Event): void;
    _onKeyDownList(ev: Event): void;
    setWidth(width: number): void;
    setRowHeight(rowHeight: number): void;
    setPlaceholderText(text: Common.UIString.LocalizedString): void;
    _itemsReplaced(event: Common.EventTarget.EventTargetEvent): void;
    selectItem(item: T | null): void;
    createElementForItem(item: T): Element;
    heightForItem(_item: T): number;
    isItemSelectable(item: T): boolean;
    selectedItemChanged(from: T | null, to: T | null, fromElement: Element | null, toElement: Element | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    _selectHighlightedItem(): void;
    refreshItem(item: T): void;
}
export interface Delegate<T> {
    titleFor(item: T): string;
    createElementForItem(item: T): Element;
    isItemSelectable(item: T): boolean;
    itemSelected(item: T | null): void;
    highlightedItemChanged(from: T | null, to: T | null, fromElement: Element | null, toElement: Element | null): void;
}
