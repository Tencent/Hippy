import type * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class StorageItemsView extends UI.Widget.VBox {
    _filterRegex: RegExp | null;
    _refreshButton: UI.Toolbar.ToolbarButton;
    _mainToolbar: UI.Toolbar.Toolbar;
    _filterItem: UI.Toolbar.ToolbarInput;
    _deleteAllButton: UI.Toolbar.ToolbarButton;
    _deleteSelectedButton: UI.Toolbar.ToolbarButton;
    constructor(_title: string, _filterName: string);
    setDeleteAllTitle(title: string): void;
    setDeleteAllGlyph(glyph: string): void;
    appendToolbarItem(item: UI.Toolbar.ToolbarItem): void;
    _addButton(label: string, glyph: string, callback: (arg0: Common.EventTarget.EventTargetEvent) => void): UI.Toolbar.ToolbarButton;
    _filterChanged(event: Common.EventTarget.EventTargetEvent): void;
    filter<T>(items: T[], keyFunction: (arg0: T) => string): T[];
    hasFilter(): boolean;
    wasShown(): void;
    setCanDeleteAll(enabled: boolean): void;
    setCanDeleteSelected(enabled: boolean): void;
    setCanRefresh(enabled: boolean): void;
    setCanFilter(enabled: boolean): void;
    deleteAllItems(): void;
    deleteSelectedItem(): void;
    refreshItems(): void;
}
