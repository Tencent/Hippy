import type * as TextUtils from '../../../models/text_utils/text_utils.js';
import type { SortState, Column, Row } from './DataGridUtils.js';
import type { DataGridContextMenusConfiguration } from './DataGrid.js';
export interface DataGridControllerData {
    columns: Column[];
    rows: Row[];
    filters?: readonly TextUtils.TextUtils.ParsedFilter[];
    /**
     * Sets an initial sort state for the data grid. Is only used if the component
     * hasn't rendered yet. If you pass this in on subsequent renders, it is
     * ignored.
     */
    initialSort?: SortState;
    contextMenus?: DataGridContextMenusConfiguration;
}
export declare class DataGridController extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private hasRenderedAtLeastOnce;
    private columns;
    private rows;
    private contextMenus?;
    /**
     * Because the controller will sort data in place (e.g. mutate it) when we get
     * new data in we store the original data separately. This is so we don't
     * mutate the data we're given, but a copy of the data. If our `get data` is
     * called, we'll return the original, not the sorted data.
     */
    private originalColumns;
    private originalRows;
    private sortState;
    private filters;
    get data(): DataGridControllerData;
    set data(data: DataGridControllerData);
    private testRowWithFilter;
    private cloneAndFilterRows;
    private sortRows;
    private onColumnHeaderClick;
    private applySortOnColumn;
    private onContextMenuColumnSortClick;
    private onContextMenuHeaderResetClick;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-data-grid-controller': DataGridController;
    }
}
