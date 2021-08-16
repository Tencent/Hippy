import * as UI from '../../legacy/legacy.js';
import type { Cell, Column, Row, SortState } from './DataGridUtils.js';
export interface DataGridContextMenusConfiguration {
    headerRow?: (menu: UI.ContextMenu.ContextMenu, columns: readonly Column[]) => void;
    bodyRow?: (menu: UI.ContextMenu.ContextMenu, columns: readonly Column[], row: Readonly<Row>) => void;
}
export interface DataGridData {
    columns: Column[];
    rows: Row[];
    activeSort: SortState | null;
    contextMenus?: DataGridContextMenusConfiguration;
}
export declare class ColumnHeaderClickEvent extends Event {
    data: {
        column: Column;
        columnIndex: number;
    };
    constructor(column: Column, columnIndex: number);
}
export declare class NewUserFilterTextEvent extends Event {
    data: {
        filterText: string;
    };
    constructor(filterText: string);
}
export declare class BodyCellFocusedEvent extends Event {
    /**
     * Although the DataGrid cares only about the focused cell, and has no concept
     * of a focused row, many components that render a data grid want to know what
     * row is active, so on the cell focused event we also send the row that the
     * cell is part of.
     */
    data: {
        cell: Cell;
        row: Row;
    };
    constructor(cell: Cell, row: Row);
}
export declare class DataGrid extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private columns;
    private rows;
    private sortState;
    private isRendering;
    private userScrollState;
    private contextMenus?;
    private currentResize;
    private readonly rowIndexMap;
    private readonly resizeObserver;
    private boundOnResizePointerUp;
    private boundOnResizePointerMove;
    private boundOnResizePointerDown;
    /**
     * Following guidance from
     * https://www.w3.org/TR/wai-aria-practices/examples/grid/dataGrids.html, we
     * allow a single cell inside the table to be focusable, such that when a user
     * tabs in they select that cell. IMPORTANT: if the data-grid has sortable
     * columns, the user has to be able to navigate to the headers to toggle the
     * sort. [0,0] is considered the first cell INCLUDING the column header
     * Therefore if a user is on the first header cell, the position is considered [0, 0],
     * and if a user is on the first body cell, the position is considered [0, 1].
     *
     * We set the selectable cell to the first tbody value by default, but then on the
     * first render if any of the columns are sortable we'll set the active cell
     * to [0, 0].
     */
    private focusableCell;
    private hasRenderedAtLeastOnce;
    private userHasFocusInDataGrid;
    private scheduleRender;
    constructor();
    connectedCallback(): void;
    get data(): DataGridData;
    set data(data: DataGridData);
    private shouldAutoScrollToBottom;
    private scrollToBottomIfRequired;
    private engageResizeObserver;
    private getCurrentlyFocusableCellElement;
    private focusCell;
    private onTableKeyDown;
    private onColumnHeaderClick;
    /**
     * Applies the aria-sort label to a column's th.
     * Guidance on values of attribute taken from
     * https://www.w3.org/TR/wai-aria-practices/examples/grid/dataGrids.html.
     */
    private ariaSortForHeader;
    private renderEmptyFillerRow;
    private cleanUpAfterResizeColumnComplete;
    private onResizePointerDown;
    private onResizePointerMove;
    private onResizePointerUp;
    private renderResizeForCell;
    private getIndexOfLastVisibleColumn;
    /**
     * This function is called when the user right clicks on the header row of the
     * data grid.
     */
    private onHeaderContextMenu;
    private onBodyRowContextMenu;
    private onScroll;
    private alignScrollHandlers;
    /**
     * Calculates the index of the first row we want to render, and the last row we want to render.
     * Pads in each direction by PADDING_ROWS_COUNT so we render some rows that are off scren.
     */
    private calculateTopAndBottomRowIndexes;
    private onFocusOut;
    /**
     * Renders the data-grid table. Note that we do not render all rows; the
     * performance cost are too high once you have a large enough table. Instead
     * we calculate the size of the container we are rendering into, and then
     * render only the rows required to fill that table (plus a bit extra for
     * padding).
     */
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-data-grid': DataGrid;
    }
}
