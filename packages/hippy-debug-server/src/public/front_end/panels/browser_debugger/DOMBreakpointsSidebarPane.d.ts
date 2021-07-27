import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class DOMBreakpointsSidebarPane extends UI.Widget.VBox implements UI.ContextFlavorListener.ContextFlavorListener, UI.ListControl.ListDelegate<SDK.DOMDebuggerModel.DOMBreakpoint> {
    elementToCheckboxes: WeakMap<Element, HTMLInputElement>;
    _emptyElement: HTMLElement;
    _breakpoints: UI.ListModel.ListModel<SDK.DOMDebuggerModel.DOMBreakpoint>;
    _list: UI.ListControl.ListControl<SDK.DOMDebuggerModel.DOMBreakpoint>;
    _highlightedBreakpoint: SDK.DOMDebuggerModel.DOMBreakpoint | null;
    private constructor();
    static instance(): DOMBreakpointsSidebarPane;
    createElementForItem(item: SDK.DOMDebuggerModel.DOMBreakpoint): Element;
    heightForItem(_item: SDK.DOMDebuggerModel.DOMBreakpoint): number;
    isItemSelectable(_item: SDK.DOMDebuggerModel.DOMBreakpoint): boolean;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    selectedItemChanged(from: SDK.DOMDebuggerModel.DOMBreakpoint | null, to: SDK.DOMDebuggerModel.DOMBreakpoint | null, fromElement: HTMLElement | null, toElement: HTMLElement | null): void;
    _breakpointAdded(event: Common.EventTarget.EventTargetEvent): void;
    _breakpointToggled(event: Common.EventTarget.EventTargetEvent): void;
    _breakpointsRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _addBreakpoint(breakpoint: SDK.DOMDebuggerModel.DOMBreakpoint): void;
    _contextMenu(breakpoint: SDK.DOMDebuggerModel.DOMBreakpoint, event: Event): void;
    _checkboxClicked(breakpoint: SDK.DOMDebuggerModel.DOMBreakpoint, event: Event): void;
    flavorChanged(_object: Object | null): void;
    _update(): void;
}
export declare class ContextMenuProvider implements UI.ContextMenu.Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ContextMenuProvider;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, object: Object): void;
}
