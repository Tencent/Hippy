import { ContextMenuColumnSortClickEvent } from './DataGridUtils.js';
function toggleColumnVisibility(dataGrid, column) {
    const newVisibility = !column.visible;
    const newColumns = dataGrid.data.columns.map(col => {
        if (col === column) {
            col.visible = newVisibility;
        }
        return col;
    });
    dataGrid.data = {
        ...dataGrid.data,
        columns: newColumns,
    };
}
/**
 * This adds a checkbox to the context menu for each column in the datagrid that
 * is hideable. Columns that are visible will have a tick next to them, and
 * hidden ones will not. Upon clicking by the user the selected column's
 * visibility will be toggled.
 */
export function addColumnVisibilityCheckboxes(dataGrid, contextMenu) {
    const { columns } = dataGrid.data;
    for (const column of columns) {
        if (!column.hideable) {
            continue;
        }
        /**
           * Append checkboxes for each column that is hideable; these will show
           * with checkboxes if the column is visible and allow the user to click in
           * the context menu to toggle an individual column's visibility.
           */
        contextMenu.defaultSection().appendCheckboxItem(column.title, () => {
            toggleColumnVisibility(dataGrid, column);
        }, column.visible);
    }
}
/**
 * This adds an entry to the context menu for each column in the data grid that
 * is considered sortable, so the user can click on the context menu item to
 * change the data grid's sorting.
 *
 * This is also achieved by clicking on the column headers in the grid directly,
 * but we also support doing so via the context menu items.
 */
export function addSortableColumnItems(dataGrid, contextMenu) {
    const sortableColumns = dataGrid.data.columns.filter(col => col.sortable === true);
    if (sortableColumns.length > 0) {
        for (const column of sortableColumns) {
            contextMenu.defaultSection().appendItem(column.title, () => {
                dataGrid.dispatchEvent(new ContextMenuColumnSortClickEvent(column));
            });
        }
    }
}
//# sourceMappingURL=DataGridContextMenuUtils.js.map