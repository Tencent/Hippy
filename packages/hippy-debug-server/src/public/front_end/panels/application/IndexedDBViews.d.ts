import type * as Common from '../../core/common/common.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { Database, DatabaseId, Entry, Index, IndexedDBModel, ObjectStore, ObjectStoreMetadata } from './IndexedDBModel.js';
export declare class IDBDatabaseView extends UI.Widget.VBox {
    _model: IndexedDBModel;
    _database: Database;
    _reportView: UI.ReportView.ReportView;
    _securityOriginElement: HTMLElement;
    _versionElement: HTMLElement;
    _objectStoreCountElement: HTMLElement;
    _clearButton: HTMLButtonElement;
    _refreshButton: HTMLButtonElement;
    constructor(model: IndexedDBModel, database: Database | null);
    _refreshDatabase(): void;
    _refreshDatabaseButtonClicked(): void;
    update(database: Database): void;
    _updatedForTests(): void;
    _deleteDatabase(): Promise<void>;
}
export declare class IDBDataView extends UI.View.SimpleView {
    _model: IndexedDBModel;
    _databaseId: DatabaseId;
    _isIndex: boolean;
    _refreshObjectStoreCallback: () => void;
    _refreshButton: UI.Toolbar.ToolbarButton;
    _deleteSelectedButton: UI.Toolbar.ToolbarButton;
    _clearButton: UI.Toolbar.ToolbarButton;
    _needsRefresh: UI.Toolbar.ToolbarItem;
    _clearingObjectStore: boolean;
    _pageSize: number;
    _skipCount: number;
    _entries: Entry[];
    _objectStore: ObjectStore;
    _index: Index | null;
    _keyInput: UI.Toolbar.ToolbarInput;
    _dataGrid: DataGrid.DataGrid.DataGridImpl<unknown>;
    _lastPageSize: number;
    _lastSkipCount: number;
    _pageBackButton: UI.Toolbar.ToolbarButton;
    _pageForwardButton: UI.Toolbar.ToolbarButton;
    _lastKey?: any;
    _summaryBarElement?: HTMLElement;
    constructor(model: IndexedDBModel, databaseId: DatabaseId, objectStore: ObjectStore, index: Index | null, refreshObjectStoreCallback: () => void);
    _createDataGrid(): DataGrid.DataGrid.DataGridImpl<unknown>;
    _keyColumnHeaderFragment(prefix: string, keyPath: any): DocumentFragment;
    _keyPathStringFragment(keyPathString: string): DocumentFragment;
    _createEditorToolbar(): void;
    _pageBackButtonClicked(_event: Common.EventTarget.EventTargetEvent): void;
    _pageForwardButtonClicked(_event: Common.EventTarget.EventTargetEvent): void;
    _populateContextMenu(contextMenu: UI.ContextMenu.ContextMenu, gridNode: DataGrid.DataGrid.DataGridNode<unknown>): void;
    refreshData(): void;
    update(objectStore: ObjectStore, index: Index | null): void;
    _parseKey(keyString: string): any;
    _updateData(force: boolean): void;
    _updateSummaryBar(metadata: ObjectStoreMetadata | null): void;
    _updatedDataForTests(): void;
    _refreshButtonClicked(_event: Common.EventTarget.EventTargetEvent | null): void;
    _clearButtonClicked(_event: Common.EventTarget.EventTargetEvent): Promise<void>;
    markNeedsRefresh(): void;
    _deleteButtonClicked(node: DataGrid.DataGrid.DataGridNode<unknown> | null): Promise<void>;
    clear(): void;
    _updateToolbarEnablement(): void;
}
export declare class IDBDataGridNode extends DataGrid.DataGrid.DataGridNode<unknown> {
    selectable: boolean;
    valueObjectPresentation: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection | null;
    constructor(data: {
        [x: string]: any;
    });
    createCell(columnIdentifier: string): HTMLElement;
}
