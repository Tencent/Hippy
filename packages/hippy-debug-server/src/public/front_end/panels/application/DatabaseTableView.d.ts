import * as Common from '../../core/common/common.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { Database } from './DatabaseModel.js';
export interface VisibleColumnsSetting {
    [tableName: string]: string;
}
export declare class DatabaseTableView extends UI.View.SimpleView {
    database: Database;
    tableName: string;
    _lastVisibleColumns: string;
    _columnsMap: Map<string, string>;
    _visibleColumnsSetting: Common.Settings.Setting<VisibleColumnsSetting>;
    refreshButton: UI.Toolbar.ToolbarButton;
    _visibleColumnsInput: UI.Toolbar.ToolbarInput;
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<DataGrid.SortableDataGrid.SortableDataGridNode<unknown>> | null;
    _emptyWidget?: UI.EmptyWidget.EmptyWidget;
    constructor(database: Database, tableName: string);
    wasShown(): void;
    toolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    _escapeTableName(tableName: string): string;
    update(): void;
    _queryFinished(columnNames: string[], values: any[]): void;
    _onVisibleColumnsChanged(): void;
    _queryError(): void;
    _refreshButtonClicked(_event: Common.EventTarget.EventTargetEvent): void;
}
