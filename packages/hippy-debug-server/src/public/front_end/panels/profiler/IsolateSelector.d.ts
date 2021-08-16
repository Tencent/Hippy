import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class IsolateSelector extends UI.Widget.VBox implements UI.ListControl.ListDelegate<ListItem>, SDK.IsolateManager.Observer {
    _items: UI.ListModel.ListModel<ListItem>;
    _list: UI.ListControl.ListControl<ListItem>;
    _itemByIsolate: Map<SDK.IsolateManager.Isolate, ListItem>;
    _totalElement: HTMLDivElement;
    _totalValueDiv: HTMLElement;
    _totalTrendDiv: HTMLElement;
    constructor();
    wasShown(): void;
    willHide(): void;
    isolateAdded(isolate: SDK.IsolateManager.Isolate): void;
    isolateChanged(isolate: SDK.IsolateManager.Isolate): void;
    isolateRemoved(isolate: SDK.IsolateManager.Isolate): void;
    _targetChanged(event: Common.EventTarget.EventTargetEvent): void;
    _heapStatsChanged(event: Common.EventTarget.EventTargetEvent): void;
    _updateTotal(): void;
    static _formatTrendElement(trendValueMs: number, element: Element): void;
    totalMemoryElement(): Element;
    createElementForItem(item: ListItem): Element;
    heightForItem(_item: ListItem): number;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    isItemSelectable(_item: ListItem): boolean;
    selectedItemChanged(_from: ListItem | null, to: ListItem | null, fromElement: Element | null, toElement: Element | null): void;
    _update(): void;
}
export declare class ListItem {
    _isolate: SDK.IsolateManager.Isolate;
    element: HTMLDivElement;
    _heapDiv: HTMLElement;
    _trendDiv: HTMLElement;
    _nameDiv: HTMLElement;
    constructor(isolate: SDK.IsolateManager.Isolate);
    model(): SDK.RuntimeModel.RuntimeModel | null;
    updateStats(): void;
    updateTitle(): void;
}
