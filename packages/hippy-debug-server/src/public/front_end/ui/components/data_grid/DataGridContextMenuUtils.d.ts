import type * as UI from '../../legacy/legacy.js';
import type { DataGrid } from './DataGrid.js';
/**
 * This adds a checkbox to the context menu for each column in the datagrid that
 * is hideable. Columns that are visible will have a tick next to them, and
 * hidden ones will not. Upon clicking by the user the selected column's
 * visibility will be toggled.
 */
export declare function addColumnVisibilityCheckboxes(dataGrid: DataGrid, contextMenu: UI.ContextMenu.ContextMenu | UI.ContextMenu.SubMenu): void;
/**
 * This adds an entry to the context menu for each column in the data grid that
 * is considered sortable, so the user can click on the context menu item to
 * change the data grid's sorting.
 *
 * This is also achieved by clicking on the column headers in the grid directly,
 * but we also support doing so via the context menu items.
 */
export declare function addSortableColumnItems(dataGrid: DataGrid, contextMenu: UI.ContextMenu.ContextMenu | UI.ContextMenu.SubMenu): void;
