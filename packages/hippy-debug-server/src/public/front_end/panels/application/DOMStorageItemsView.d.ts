import * as Common from '../../core/common/common.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DOMStorage } from './DOMStorageModel.js';
import { StorageItemsView } from './StorageItemsView.js';
export declare class DOMStorageItemsView extends StorageItemsView {
    _domStorage: DOMStorage;
    _dataGrid: DataGrid.DataGrid.DataGridImpl<unknown>;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _previewPanel: UI.Widget.VBox;
    _preview: UI.Widget.Widget | null;
    _previewValue: string | null;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    constructor(domStorage: DOMStorage);
    setStorage(domStorage: DOMStorage): void;
    _domStorageItemsCleared(): void;
    _domStorageItemRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _domStorageItemAdded(event: Common.EventTarget.EventTargetEvent): void;
    _domStorageItemUpdated(event: Common.EventTarget.EventTargetEvent): void;
    _showDOMStorageItems(items: string[][]): void;
    deleteSelectedItem(): void;
    refreshItems(): void;
    deleteAllItems(): void;
    _editingCallback(editingNode: DataGrid.DataGrid.DataGridNode<unknown>, columnIdentifier: string, oldText: string, newText: string): void;
    _removeDupes(masterNode: DataGrid.DataGrid.DataGridNode<unknown>): void;
    _deleteCallback(node: DataGrid.DataGrid.DataGridNode<unknown>): void;
    _showPreview(preview: UI.Widget.Widget | null, value: string | null): void;
    _previewEntry(entry: DataGrid.DataGrid.DataGridNode<unknown> | null): Promise<void>;
}
