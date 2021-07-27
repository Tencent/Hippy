import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
/**
 * @abstract
 */
export declare class CategorizedBreakpointsSidebarPane extends UI.Widget.VBox {
    _categoriesTreeOutline: UI.TreeOutline.TreeOutlineInShadow;
    _viewId: string;
    _detailsPausedReason: Protocol.Debugger.PausedEventReason;
    _categories: Map<string, Item>;
    _breakpoints: Map<SDK.DOMDebuggerModel.CategorizedBreakpoint, Item>;
    _highlightedElement?: HTMLLIElement;
    constructor(categories: string[], breakpoints: SDK.DOMDebuggerModel.CategorizedBreakpoint[], viewId: string, detailsPausedReason: Protocol.Debugger.PausedEventReason);
    focus(): void;
    _createCategory(name: string): void;
    _createBreakpoint(breakpoint: SDK.DOMDebuggerModel.CategorizedBreakpoint): void;
    _getBreakpointFromPausedDetails(_details: SDK.DebuggerModel.DebuggerPausedDetails): SDK.DOMDebuggerModel.CategorizedBreakpoint | null;
    _update(): void;
    _categoryCheckboxClicked(category: string): void;
    _toggleBreakpoint(breakpoint: SDK.DOMDebuggerModel.CategorizedBreakpoint, enabled: boolean): void;
    _breakpointCheckboxClicked(breakpoint: SDK.DOMDebuggerModel.CategorizedBreakpoint): void;
}
export interface Item {
    element: UI.TreeOutline.TreeElement;
    checkbox: HTMLInputElement;
}
