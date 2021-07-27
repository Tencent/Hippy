import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class DeveloperResourcesListView extends UI.Widget.VBox {
    _nodeForItem: Map<SDK.PageResourceLoader.PageResource, GridNode>;
    _isVisibleFilter: (arg0: SDK.PageResourceLoader.PageResource) => boolean;
    _highlightRegExp: RegExp | null;
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<GridNode>;
    constructor(isVisibleFilter: (arg0: SDK.PageResourceLoader.PageResource) => boolean);
    _populateContextMenu(contextMenu: UI.ContextMenu.ContextMenu, gridNode: DataGrid.DataGrid.DataGridNode<DataGrid.ViewportDataGrid.ViewportDataGridNode<DataGrid.SortableDataGrid.SortableDataGridNode<GridNode>>>): void;
    update(items: Iterable<SDK.PageResourceLoader.PageResource>): void;
    reset(): void;
    updateFilterAndHighlight(highlightRegExp: RegExp | null): void;
    _sortingChanged(): void;
}
declare class GridNode extends DataGrid.SortableDataGrid.SortableDataGridNode<GridNode> {
    item: SDK.PageResourceLoader.PageResource;
    _highlightRegExp: RegExp | null;
    constructor(item: SDK.PageResourceLoader.PageResource);
    _setHighlight(highlightRegExp: RegExp | null): void;
    _refreshIfNeeded(): boolean;
    createCell(columnId: string): HTMLElement;
    _highlight(element: Element, textContent: string): void;
    static sortFunctionForColumn(columnId: string): ((arg0: GridNode, arg1: GridNode) => number) | null;
}
export {};
