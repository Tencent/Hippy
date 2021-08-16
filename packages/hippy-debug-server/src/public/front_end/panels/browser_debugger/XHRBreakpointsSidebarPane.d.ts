import * as UI from '../../ui/legacy/legacy.js';
export declare class XHRBreakpointsSidebarPane extends UI.Widget.VBox implements UI.ContextFlavorListener.ContextFlavorListener, UI.Toolbar.ItemsProvider, UI.ListControl.ListDelegate<string> {
    _breakpoints: UI.ListModel.ListModel<string>;
    _list: UI.ListControl.ListControl<string>;
    _emptyElement: HTMLElement;
    _breakpointElements: Map<string, Element>;
    _addButton: UI.Toolbar.ToolbarButton;
    _hitBreakpoint?: any;
    private constructor();
    static instance(): XHRBreakpointsSidebarPane;
    toolbarItems(): UI.Toolbar.ToolbarItem[];
    _emptyElementContextMenu(event: Event): void;
    _addButtonClicked(): Promise<void>;
    heightForItem(_item: string): number;
    isItemSelectable(_item: string): boolean;
    _setBreakpoint(url: string): void;
    createElementForItem(item: string): Element;
    selectedItemChanged(from: string | null, to: string | null, fromElement: HTMLElement | null, toElement: HTMLElement | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    _removeBreakpoint(url: string): void;
    _addListElement(element: Element, beforeNode: Node | null): void;
    _removeListElement(element: Element): void;
    _contextMenu(url: string, event: Event): void;
    _checkboxClicked(url: string, checked: boolean): void;
    _labelClicked(url: string): void;
    flavorChanged(_object: Object | null): void;
    _update(): void;
    _restoreBreakpoints(): void;
}
