import * as UI from '../../ui/legacy/legacy.js';
export declare class CSSOverviewSidebarPanel extends UI.Widget.VBox {
    static get ITEM_CLASS_NAME(): string;
    static get SELECTED(): string;
    constructor();
    addItem(name: string, id: string): void;
    _reset(): void;
    _deselectAllItems(): void;
    _onItemClick(event: Event): void;
    select(id: string): void;
}
export declare const enum SidebarEvents {
    ItemSelected = "ItemSelected",
    Reset = "Reset"
}
