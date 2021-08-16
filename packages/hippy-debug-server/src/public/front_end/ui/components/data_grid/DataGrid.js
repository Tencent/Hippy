// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../../core/host/host.js';
import * as Platform from '../../../core/platform/platform.js';
import * as UI from '../../legacy/legacy.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import * as Coordinator from '../render_coordinator/render_coordinator.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
import { addColumnVisibilityCheckboxes, addSortableColumnItems } from './DataGridContextMenuUtils.js';
import { calculateColumnWidthPercentageFromWeighting, calculateFirstFocusableCell, ContextMenuHeaderResetClickEvent, getRowEntryForColumnId, handleArrowKeyNavigation, renderCellValue } from './DataGridUtils.js';
import * as i18n from '../../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description A context menu item in the Data Grid of a data grid
    */
    sortBy: 'Sort By',
    /**
    *@description A context menu item in data grids to reset the columns to their default weight
    */
    resetColumns: 'Reset Columns',
    /**
    *@description A context menu item in data grids to list header options.
    */
    headerOptions: 'Header Options',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/data_grid/DataGrid.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ColumnHeaderClickEvent extends Event {
    data;
    constructor(column, columnIndex) {
        super('columnheaderclick');
        this.data = {
            column,
            columnIndex,
        };
    }
}
export class NewUserFilterTextEvent extends Event {
    data;
    constructor(filterText) {
        super('newuserfiltertext', {
            composed: true,
        });
        this.data = {
            filterText,
        };
    }
}
export class BodyCellFocusedEvent extends Event {
    /**
     * Although the DataGrid cares only about the focused cell, and has no concept
     * of a focused row, many components that render a data grid want to know what
     * row is active, so on the cell focused event we also send the row that the
     * cell is part of.
     */
    data;
    constructor(cell, row) {
        super('cellfocused', {
            composed: true,
        });
        this.data = {
            cell,
            row,
        };
    }
}
const KEYS_TREATED_AS_CLICKS = new Set([' ', 'Enter']);
const ROW_HEIGHT_PIXELS = 18;
const PADDING_ROWS_COUNT = 10;
export class DataGrid extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-data-grid`;
    shadow = this.attachShadow({ mode: 'open' });
    columns = [];
    rows = [];
    sortState = null;
    isRendering = false;
    userScrollState = "NOT_SCROLLED" /* NOT_SCROLLED */;
    contextMenus = undefined;
    currentResize = null;
    // Because we only render a subset of rows, we need a way to look up the
    // actual row index from the original dataset. We could use this.rows[index]
    // but that's O(n) and will slow as the dataset grows. A weakmap makes the
    // lookup constant.
    rowIndexMap = new WeakMap();
    resizeObserver = new ResizeObserver(() => {
        this.alignScrollHandlers();
    });
    // These have to be bound as they are put onto the global document, not onto
    // this element, so LitHtml does not bind them for us.
    boundOnResizePointerUp = this.onResizePointerUp.bind(this);
    boundOnResizePointerMove = this.onResizePointerMove.bind(this);
    boundOnResizePointerDown = this.onResizePointerDown.bind(this);
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
    focusableCell = [0, 1];
    hasRenderedAtLeastOnce = false;
    userHasFocusInDataGrid = false;
    scheduleRender = false;
    constructor() {
        super();
        this.shadow.adoptedStyleSheets = [
            ...ComponentHelpers.GetStylesheet.getStyleSheets('ui/legacy/inspectorScrollbars.css', { enableLegacyPatching: false }),
        ];
    }
    connectedCallback() {
        ComponentHelpers.SetCSSProperty.set(this, '--table-row-height', `${ROW_HEIGHT_PIXELS}px`);
    }
    get data() {
        return {
            columns: this.columns,
            rows: this.rows,
            activeSort: this.sortState,
            contextMenus: this.contextMenus,
        };
    }
    set data(data) {
        this.columns = data.columns;
        this.rows = data.rows;
        this.rows.forEach((row, index) => {
            this.rowIndexMap.set(row, index);
        });
        this.sortState = data.activeSort;
        this.contextMenus = data.contextMenus;
        /**
         * On first render, now we have data, we can figure out which cell is the
         * focusable cell for the table.
         *
         * If any columns are sortable, we pick [0, 0], which is the first cell of
         * the columns row. However, if any columns are hidden, we adjust
         * accordingly. e.g., if the first column is hidden, we'll set the starting
         * index as [1, 0].
         *
         * If the columns aren't sortable, we pick the first visible body row as the
         * index.
         *
         * We only do this on the first render; otherwise if we re-render and the
         * user has focused a cell, this logic will reset it.
         */
        if (!this.hasRenderedAtLeastOnce) {
            this.focusableCell = calculateFirstFocusableCell({ columns: this.columns, rows: this.rows });
        }
        if (this.hasRenderedAtLeastOnce) {
            const [selectedColIndex, selectedRowIndex] = this.focusableCell;
            const columnOutOfBounds = selectedColIndex > this.columns.length;
            const rowOutOfBounds = selectedRowIndex > this.rows.length;
            /** If the row or column was removed, so the user is out of bounds, we
             * move them to the last focusable cell, which should be close to where
             * they were. */
            if (columnOutOfBounds || rowOutOfBounds) {
                this.focusableCell = [
                    columnOutOfBounds ? this.columns.length : selectedColIndex,
                    rowOutOfBounds ? this.rows.length : selectedRowIndex,
                ];
            }
        }
        this.render();
    }
    shouldAutoScrollToBottom() {
        /**
         * If the user's last scroll took them to the bottom, then we assume they
         * want to automatically scroll.
         */
        if (this.userScrollState === "SCROLLED_TO_BOTTOM" /* SCROLLED_TO_BOTTOM */) {
            return true;
        }
        /**
         * If the user does not have focus in the data grid (e.g. they haven't
         * selected a cell), we automatically scroll, as long as the user hasn't
         * manually scrolled the data-grid to somewhere that isn't the bottom.
         */
        if (!this.userHasFocusInDataGrid && this.userScrollState !== "MANUAL_SCROLL_NOT_BOTTOM" /* MANUAL_SCROLL_NOT_BOTTOM */) {
            return true;
        }
        /**
         * Else, the user has focused a cell, or their last scroll action took them
         * not to the bottom, so we assume that they don't want to be auto-scrolled.
         */
        return false;
    }
    scrollToBottomIfRequired() {
        if (this.hasRenderedAtLeastOnce === false || !this.shouldAutoScrollToBottom()) {
            return;
        }
        coordinator.read(() => {
            const wrapper = this.shadow.querySelector('.wrapping-container');
            if (!wrapper) {
                return;
            }
            const scrollHeight = wrapper.scrollHeight;
            coordinator.scroll(() => {
                wrapper.scrollTo(0, scrollHeight);
            });
        });
    }
    engageResizeObserver() {
        if (!this.hasRenderedAtLeastOnce) {
            this.resizeObserver.observe(this.shadow.host);
        }
    }
    getCurrentlyFocusableCellElement() {
        const [columnIndex, rowIndex] = this.focusableCell;
        const cell = this.shadow.querySelector(`[data-row-index="${rowIndex}"][data-col-index="${columnIndex}"]`);
        return cell;
    }
    focusCell([newColumnIndex, newRowIndex]) {
        const userDidNotHaveFocusPreviously = this.userHasFocusInDataGrid === false;
        this.userHasFocusInDataGrid = true;
        const [currentColumnIndex, currentRowIndex] = this.focusableCell;
        const newCellIsCurrentlyFocusedCell = (currentColumnIndex === newColumnIndex && currentRowIndex === newRowIndex);
        if (!newCellIsCurrentlyFocusedCell || userDidNotHaveFocusPreviously) {
            this.focusableCell = [newColumnIndex, newRowIndex];
            this.render();
        }
        const cellElement = this.getCurrentlyFocusableCellElement();
        if (!cellElement) {
            // Return in case the cell is out of bounds and we do nothing
            return;
        }
        /* The cell may already be focused if the user clicked into it, but we also
         * add arrow key support, so in the case where we're programatically moving the
         * focus, ensure we actually focus the cell.
         */
        coordinator.write(() => {
            cellElement.focus();
        });
    }
    onTableKeyDown(event) {
        const key = event.key;
        if (KEYS_TREATED_AS_CLICKS.has(key)) {
            const focusedCell = this.getCurrentlyFocusableCellElement();
            const [focusedColumnIndex, focusedRowIndex] = this.focusableCell;
            const activeColumn = this.columns[focusedColumnIndex];
            if (focusedCell && focusedRowIndex === 0 && activeColumn && activeColumn.sortable) {
                this.onColumnHeaderClick(activeColumn, focusedColumnIndex);
            }
        }
        if (!Platform.KeyboardUtilities.keyIsArrowKey(key)) {
            return;
        }
        const nextFocusedCell = handleArrowKeyNavigation({
            key: key,
            currentFocusedCell: this.focusableCell,
            columns: this.columns,
            rows: this.rows,
        });
        event.preventDefault();
        this.focusCell(nextFocusedCell);
    }
    onColumnHeaderClick(col, index) {
        this.dispatchEvent(new ColumnHeaderClickEvent(col, index));
    }
    /**
     * Applies the aria-sort label to a column's th.
     * Guidance on values of attribute taken from
     * https://www.w3.org/TR/wai-aria-practices/examples/grid/dataGrids.html.
     */
    ariaSortForHeader(col) {
        if (col.sortable && (!this.sortState || this.sortState.columnId !== col.id)) {
            // Column is sortable but is not currently sorted
            return 'none';
        }
        if (this.sortState && this.sortState.columnId === col.id) {
            return this.sortState.direction === "ASC" /* ASC */ ? 'ascending' : 'descending';
        }
        // Column is not sortable, so don't apply any label
        return undefined;
    }
    renderEmptyFillerRow() {
        const emptyCells = this.columns.map((col, colIndex) => {
            if (!col.visible) {
                return LitHtml.nothing;
            }
            const emptyCellClasses = LitHtml.Directives.classMap({
                firstVisibleColumn: colIndex === 0,
            });
            return LitHtml.html `<td tabindex="-1" class=${emptyCellClasses} data-filler-row-column-index=${colIndex}></td>`;
        });
        return LitHtml.html `<tr tabindex="-1" class="filler-row padding-row">${emptyCells}</tr>`;
    }
    cleanUpAfterResizeColumnComplete() {
        if (!this.currentResize) {
            return;
        }
        this.currentResize.documentForCursorChange.body.style.cursor = this.currentResize.cursorToRestore;
        this.currentResize = null;
        // Realign the scroll handlers now the table columns have been resized.
        this.alignScrollHandlers();
    }
    onResizePointerDown(event) {
        if (event.buttons !== 1 || (Host.Platform.isMac() && event.ctrlKey)) {
            // Ensure we only react to a left click drag mouse down event.
            // On Mac we ignore Ctrl-click which can be used to bring up context menus, etc.
            return;
        }
        event.preventDefault();
        const resizerElement = event.target;
        if (!resizerElement) {
            return;
        }
        const leftColumnIndex = resizerElement.dataset.columnIndex;
        if (!leftColumnIndex) {
            return;
        }
        const leftColumnIndexAsNumber = globalThis.parseInt(leftColumnIndex, 10);
        /* To find the cell to the right we can't just go +1 as it might be hidden,
         * so find the next index that is visible.
         */
        const rightColumnIndexAsNumber = this.columns.findIndex((column, index) => {
            return index > leftColumnIndexAsNumber && column.visible === true;
        });
        const leftCell = this.shadow.querySelector(`td[data-filler-row-column-index="${leftColumnIndexAsNumber}"]`);
        const rightCell = this.shadow.querySelector(`td[data-filler-row-column-index="${rightColumnIndexAsNumber}"]`);
        if (!leftCell || !rightCell) {
            return;
        }
        // We query for the <col> elements as they are the elements that we put the actual width on.
        const leftCellCol = this.shadow.querySelector(`col[data-col-column-index="${leftColumnIndexAsNumber}"]`);
        const rightCellCol = this.shadow.querySelector(`col[data-col-column-index="${rightColumnIndexAsNumber}"]`);
        if (!leftCellCol || !rightCellCol) {
            return;
        }
        const targetDocumentForCursorChange = event.target.ownerDocument;
        if (!targetDocumentForCursorChange) {
            return;
        }
        // We now store values that we'll make use of in the mousemouse event to calculate how much to resize the table by.
        this.currentResize = {
            leftCellCol,
            rightCellCol,
            leftCellColInitialPercentageWidth: globalThis.parseInt(leftCellCol.style.width, 10),
            rightCellColInitialPercentageWidth: globalThis.parseInt(rightCellCol.style.width, 10),
            initialLeftCellWidth: leftCell.clientWidth,
            initialRightCellWidth: rightCell.clientWidth,
            initialMouseX: event.x,
            documentForCursorChange: targetDocumentForCursorChange,
            cursorToRestore: resizerElement.style.cursor,
        };
        targetDocumentForCursorChange.body.style.cursor = 'col-resize';
        resizerElement.setPointerCapture(event.pointerId);
        resizerElement.addEventListener('pointermove', this.boundOnResizePointerMove);
    }
    onResizePointerMove(event) {
        event.preventDefault();
        if (!this.currentResize) {
            return;
        }
        const MIN_CELL_WIDTH_PERCENTAGE = 10;
        const MAX_CELL_WIDTH_PERCENTAGE = (this.currentResize.leftCellColInitialPercentageWidth + this.currentResize.rightCellColInitialPercentageWidth) -
            MIN_CELL_WIDTH_PERCENTAGE;
        const deltaOfMouseMove = event.x - this.currentResize.initialMouseX;
        const absoluteDelta = Math.abs(deltaOfMouseMove);
        const percentageDelta = (absoluteDelta / (this.currentResize.initialLeftCellWidth + this.currentResize.initialRightCellWidth)) * 100;
        let newLeftColumnPercentage;
        let newRightColumnPercentage;
        if (deltaOfMouseMove > 0) {
            /**
             * A positive delta means the user moved their mouse to the right, so we
             * want to make the right column smaller, and the left column larger.
             */
            newLeftColumnPercentage = Platform.NumberUtilities.clamp(this.currentResize.leftCellColInitialPercentageWidth + percentageDelta, MIN_CELL_WIDTH_PERCENTAGE, MAX_CELL_WIDTH_PERCENTAGE);
            newRightColumnPercentage = Platform.NumberUtilities.clamp(this.currentResize.rightCellColInitialPercentageWidth - percentageDelta, MIN_CELL_WIDTH_PERCENTAGE, MAX_CELL_WIDTH_PERCENTAGE);
        }
        else if (deltaOfMouseMove < 0) {
            /**
             * Negative delta means the user moved their mouse to the left, which
             * means we want to make the right column larger, and the left column
             * smaller.
             */
            newLeftColumnPercentage = Platform.NumberUtilities.clamp(this.currentResize.leftCellColInitialPercentageWidth - percentageDelta, MIN_CELL_WIDTH_PERCENTAGE, MAX_CELL_WIDTH_PERCENTAGE);
            newRightColumnPercentage = Platform.NumberUtilities.clamp(this.currentResize.rightCellColInitialPercentageWidth + percentageDelta, MIN_CELL_WIDTH_PERCENTAGE, MAX_CELL_WIDTH_PERCENTAGE);
        }
        if (!newLeftColumnPercentage || !newRightColumnPercentage) {
            // The delta was 0, so nothing to do.
            return;
        }
        // We limit the values to two decimal places to not work with huge decimals.
        // It also prevents stuttering if the user barely moves the mouse, as the
        // browser won't try to move the column by 0.0000001% or similar.
        this.currentResize.leftCellCol.style.width = newLeftColumnPercentage.toFixed(2) + '%';
        this.currentResize.rightCellCol.style.width = newRightColumnPercentage.toFixed(2) + '%';
    }
    onResizePointerUp(event) {
        event.preventDefault();
        const resizer = event.target;
        if (!resizer) {
            return;
        }
        resizer.releasePointerCapture(event.pointerId);
        resizer.removeEventListener('pointermove', this.boundOnResizePointerMove);
        this.cleanUpAfterResizeColumnComplete();
    }
    renderResizeForCell(column, position) {
        /**
         * A resizer for a column is placed at the far right of the _previous column
         * cell_. So when we get called with [1, 0] that means this dragger is
         * resizing column 1, but the dragger itself is located within column 0. We
         * need the column to the left because when you resize a column you're not
         * only resizing it but also the column to its left.
         */
        const [columnIndex] = position;
        const lastVisibleColumnIndex = this.getIndexOfLastVisibleColumn();
        // If we are in the very last column, there is no column to the right to resize, so don't render a resizer.
        if (columnIndex === lastVisibleColumnIndex || !column.visible) {
            return LitHtml.nothing;
        }
        return LitHtml.html `<span class="cell-resize-handle"
     @pointerdown=${this.boundOnResizePointerDown}
     @pointerup=${this.boundOnResizePointerUp}
     data-column-index=${columnIndex}
    ></span>`;
    }
    getIndexOfLastVisibleColumn() {
        let index = this.columns.length - 1;
        for (; index > -1; index--) {
            const col = this.columns[index];
            if (col.visible) {
                break;
            }
        }
        return index;
    }
    /**
     * This function is called when the user right clicks on the header row of the
     * data grid.
     */
    onHeaderContextMenu(event) {
        if (event.button !== 2) {
            // 2 = secondary button = right click. We only show context menus if the
            // user has right clicked.
            return;
        }
        const menu = new UI.ContextMenu.ContextMenu(event);
        addColumnVisibilityCheckboxes(this, menu);
        const sortMenu = menu.defaultSection().appendSubMenuItem(i18nString(UIStrings.sortBy));
        addSortableColumnItems(this, sortMenu);
        menu.defaultSection().appendItem(i18nString(UIStrings.resetColumns), () => {
            this.dispatchEvent(new ContextMenuHeaderResetClickEvent());
        });
        if (this.contextMenus && this.contextMenus.headerRow) {
            // Let the user append things to the menu
            this.contextMenus.headerRow(menu, this.columns);
        }
        menu.show();
    }
    onBodyRowContextMenu(event) {
        if (event.button !== 2) {
            // 2 = secondary button = right click. We only show context menus if the
            // user has right clicked.
            return;
        }
        /**
         * We now make sure that the event came from an HTML element with a
         * data-row-index attribute, else we bail.
         */
        if (!event.target || !(event.target instanceof HTMLElement)) {
            return;
        }
        const rowIndexAttribute = event.target.dataset.rowIndex;
        if (!rowIndexAttribute) {
            return;
        }
        const rowIndex = parseInt(rowIndexAttribute, 10);
        // rowIndex - 1 here because in the UI the 0th row is the column headers.
        const rowThatWasClicked = this.rows[rowIndex - 1];
        const menu = new UI.ContextMenu.ContextMenu(event);
        const sortMenu = menu.defaultSection().appendSubMenuItem(i18nString(UIStrings.sortBy));
        addSortableColumnItems(this, sortMenu);
        const headerOptionsMenu = menu.defaultSection().appendSubMenuItem(i18nString(UIStrings.headerOptions));
        addColumnVisibilityCheckboxes(this, headerOptionsMenu);
        headerOptionsMenu.defaultSection().appendItem(i18nString(UIStrings.resetColumns), () => {
            this.dispatchEvent(new ContextMenuHeaderResetClickEvent());
        });
        if (this.contextMenus && this.contextMenus.bodyRow) {
            this.contextMenus.bodyRow(menu, this.columns, rowThatWasClicked);
        }
        menu.show();
    }
    onScroll(event) {
        const wrapper = event.target;
        if (!wrapper) {
            return;
        }
        // Need to Math.round because on high res screens we can end up with decimal
        // point numbers for scroll positions.
        const userIsAtBottom = Math.round(wrapper.scrollTop + wrapper.clientHeight) === Math.round(wrapper.scrollHeight);
        this.userScrollState =
            userIsAtBottom ? "SCROLLED_TO_BOTTOM" /* SCROLLED_TO_BOTTOM */ : "MANUAL_SCROLL_NOT_BOTTOM" /* MANUAL_SCROLL_NOT_BOTTOM */;
        this.render();
    }
    alignScrollHandlers() {
        return coordinator.read(() => {
            const columnHeaders = this.shadow.querySelectorAll('th:not(.hidden)');
            const handlers = this.shadow.querySelectorAll('.cell-resize-handle');
            const table = this.shadow.querySelector('table');
            if (!table) {
                return;
            }
            columnHeaders.forEach(async (header, index) => {
                const columnWidth = header.clientWidth;
                const columnLeftOffset = header.offsetLeft;
                if (handlers[index]) {
                    const handlerWidth = handlers[index].clientWidth;
                    coordinator.write(() => {
                        /**
                         * Render the resizer at the far right of the column; we subtract
                         * its width so it sits on the inner edge of the column.
                         */
                        handlers[index].style.left = `${columnLeftOffset + columnWidth - handlerWidth}px`;
                    });
                }
            });
        });
    }
    /**
     * Calculates the index of the first row we want to render, and the last row we want to render.
     * Pads in each direction by PADDING_ROWS_COUNT so we render some rows that are off scren.
     */
    calculateTopAndBottomRowIndexes() {
        return coordinator.read(() => {
            const wrapper = this.shadow.querySelector('.wrapping-container');
            // On first render we don't have a wrapper, so we can't get at its
            // scroll/height values. So we default to the inner height of the window as
            // the limit for rendering. This means we may over-render by a few rows, but
            // better that than either render everything, or rendering too few rows.
            let scrollTop = 0;
            let clientHeight = window.innerHeight;
            if (wrapper) {
                scrollTop = wrapper.scrollTop;
                clientHeight = wrapper.clientHeight;
            }
            const padding = ROW_HEIGHT_PIXELS * PADDING_ROWS_COUNT;
            let topVisibleRow = Math.floor((scrollTop - padding) / ROW_HEIGHT_PIXELS);
            let bottomVisibleRow = Math.ceil((scrollTop + clientHeight + padding) / ROW_HEIGHT_PIXELS);
            topVisibleRow = Math.max(0, topVisibleRow);
            bottomVisibleRow = Math.min(this.rows.filter(r => !r.hidden).length, bottomVisibleRow);
            return {
                topVisibleRow,
                bottomVisibleRow,
            };
        });
    }
    onFocusOut() {
        /**
         * When any element in the data-grid loses focus, we set this to false. If
         * the user then focuses another cell, that code will set the focus to true.
         * We need to know if the user is focused because if they are and they've
         * scrolled their focused cell out of rendering view and back in, we want to
         * refocus it. But if they aren't focused and that happens, we don't, else
         * we can steal focus away from the user if they are typing into an input
         * box to filter the data-grid, for example.
         */
        this.userHasFocusInDataGrid = false;
    }
    /**
     * Renders the data-grid table. Note that we do not render all rows; the
     * performance cost are too high once you have a large enough table. Instead
     * we calculate the size of the container we are rendering into, and then
     * render only the rows required to fill that table (plus a bit extra for
     * padding).
     */
    async render() {
        if (this.isRendering) {
            // If we receive a request to render during a previous render call, we block
            // the newly requested render (since we could receive a lot of them in quick
            // succession), but we do ensure that at the end of the current render we
            // go again with the latest data.
            this.scheduleRender = true;
            return;
        }
        this.isRendering = true;
        const { topVisibleRow, bottomVisibleRow } = await this.calculateTopAndBottomRowIndexes();
        const nonHiddenRows = this.rows.filter(row => !row.hidden);
        const renderableRows = nonHiddenRows.filter((_, idx) => idx >= topVisibleRow && idx <= bottomVisibleRow);
        const indexOfFirstVisibleColumn = this.columns.findIndex(col => col.visible);
        const anyColumnsSortable = this.columns.some(col => col.sortable === true);
        await coordinator.write(() => {
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            LitHtml.render(LitHtml.html `
      <style>
        :host {
          height: 100%;
          display: block;
          position: relative;
        }
        /* Ensure that vertically we don't overflow */
        .wrapping-container {
          overflow-y: scroll;
          /* Use max-height instead of height to ensure that the
            table does not use more space than necessary. */
          height: 100%;
        }

        table {
          border-spacing: 0;
          width: 100%;
          height: 100%;
          /* To make sure that we properly hide overflowing text
            when horizontal space is too narrow. */
          table-layout: fixed;
        }

        tr {
          outline: none;
        }

        tbody tr {
          background-color: var(--override-data-grid-row-background-color, --color-background);
        }

        tbody tr.selected {
          background-color: var(--color-background-elevation-1);
        }

        td,
        th {
          padding: 1px 4px;
          /* Divider between each cell, except the first one (see below) */
          border-left: 1px solid var(--color-details-hairline);
          color: var(--color-text-primary);
          line-height: var(--table-row-height);
          height: var(--table-row-height);
          user-select: text;
          /* Ensure that text properly cuts off if horizontal space is too narrow */
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        th {
          font-weight: normal;
          text-align: left;
          border-bottom: 1px solid var(--color-details-hairline);
          position: sticky;
          top: 0;
          z-index: 2;
          background-color: var(--color-background-elevation-1);
        }

        td:focus,
        th:focus {
          outline: var(--color-primary) auto 1px;
        }

        .cell-resize-handle {
          top: 0;
          height: 100%;
          z-index: 3;
          width: 20px;
          cursor: col-resize;
          position: absolute;
        }
        /* There is no divider before the first cell */
        td.firstVisibleColumn,
        th.firstVisibleColumn {
          border-left: none;
        }

        .hidden {
          display: none;
        }

        .filler-row td {
          /* By making the filler row cells 100% they take up any extra height,
          * leaving the cells with content to be the regular height, and the
          * final filler row to be as high as it needs to be to fill the empty
          * space.
          */
          height: 100%;
          pointer-events: none;
        }

        [aria-sort]:hover {
          cursor: pointer;
        }

        [aria-sort="descending"]::after {
          content: " ";
          border-left: 0.3em solid transparent;
          border-right: 0.3em solid transparent;
          border-top: 0.3em solid var(--color-text-primary);
          position: absolute;
          right: 0.5em;
          top: 0.6em;
        }

        [aria-sort="ascending"]::after {
          content: " ";
          border-bottom: 0.3em solid var(--color-text-primary);
          border-left: 0.3em solid transparent;
          border-right: 0.3em solid transparent;
          position: absolute;
          right: 0.5em;
          top: 0.6em;
        }
      </style>
      ${this.columns.map((col, columnIndex) => {
                /**
                * We render the resizers outside of the table. One is rendered for each
                * column, and they are positioned absolutely at the right position. They
                * have 100% height so they sit over the entire table and can be grabbed
                * by the user.
                */
                return this.renderResizeForCell(col, [columnIndex, 0]);
            })}
      <div class="wrapping-container" @scroll=${this.onScroll} @focusout=${this.onFocusOut}>
        <table
          aria-rowcount=${this.rows.length}
          aria-colcount=${this.columns.length}
          @keydown=${this.onTableKeyDown}
        >
          <colgroup>
            ${this.columns.map((col, colIndex) => {
                const width = calculateColumnWidthPercentageFromWeighting(this.columns, col.id);
                const style = `width: ${width}%`;
                if (!col.visible) {
                    return LitHtml.nothing;
                }
                return LitHtml.html `<col style=${style} data-col-column-index=${colIndex}>`;
            })}
          </colgroup>
          <thead>
            <tr @contextmenu=${this.onHeaderContextMenu}>
              ${this.columns.map((col, columnIndex) => {
                const thClasses = LitHtml.Directives.classMap({
                    hidden: !col.visible,
                    firstVisibleColumn: columnIndex === indexOfFirstVisibleColumn,
                });
                const cellIsFocusableCell = anyColumnsSortable && columnIndex === this.focusableCell[0] && this.focusableCell[1] === 0;
                return LitHtml.html `<th class=${thClasses}
                  data-grid-header-cell=${col.id}
                  @click=${() => {
                    this.focusCell([columnIndex, 0]);
                    this.onColumnHeaderClick(col, columnIndex);
                }}
                  title=${col.title}
                  aria-sort=${LitHtml.Directives.ifDefined(this.ariaSortForHeader(col))}
                  aria-colindex=${columnIndex + 1}
                  data-row-index='0'
                  data-col-index=${columnIndex}
                  tabindex=${LitHtml.Directives.ifDefined(anyColumnsSortable ? (cellIsFocusableCell ? '0' : '-1') : undefined)}
                >${col.title}</th>`;
            })}
            </tr>
          </thead>
          <tbody>
            <tr class="filler-row-top padding-row" style=${LitHtml.Directives.styleMap({
                height: `${topVisibleRow * ROW_HEIGHT_PIXELS}px`,
            })}></tr>
            ${LitHtml.Directives.repeat(renderableRows, row => this.rowIndexMap.get(row), (row) => {
                const rowIndex = this.rowIndexMap.get(row);
                if (rowIndex === undefined) {
                    throw new Error('Trying to render a row that has no index in the rowIndexMap');
                }
                const [, focusableCellRowIndex] = this.focusableCell;
                // Remember that row 0 is considered the header row, so the first tbody row is row 1.
                const tableRowIndex = rowIndex + 1;
                // Check for hasFocusInDataGrid so that we don't highlight the
                // active cell before they've even clicked it.
                const rowIsSelected = this.userHasFocusInDataGrid && tableRowIndex === focusableCellRowIndex;
                const rowClasses = LitHtml.Directives.classMap({
                    selected: rowIsSelected,
                    hidden: row.hidden === true,
                });
                return LitHtml.html `
                <tr
                  aria-rowindex=${rowIndex + 1}
                  class=${rowClasses}
                  style=${LitHtml.Directives.ifDefined(row.styles ? LitHtml.Directives.styleMap(row.styles) : undefined)}
                  @contextmenu=${this.onBodyRowContextMenu}
                >${this.columns.map((col, columnIndex) => {
                    const cell = getRowEntryForColumnId(row, col.id);
                    const cellClasses = LitHtml.Directives.classMap({
                        hidden: !col.visible,
                        firstVisibleColumn: columnIndex === indexOfFirstVisibleColumn,
                    });
                    const cellIsFocusableCell = columnIndex === this.focusableCell[0] && tableRowIndex === this.focusableCell[1];
                    const cellOutput = col.visible ? renderCellValue(cell) : null;
                    return LitHtml.html `<td
                    class=${cellClasses}
                    tabindex=${cellIsFocusableCell ? '0' : '-1'}
                    aria-colindex=${columnIndex + 1}
                    title=${cell.title || String(cell.value).substr(0, 20)}
                    data-row-index=${tableRowIndex}
                    data-col-index=${columnIndex}
                    data-grid-value-cell-for-column=${col.id}
                    @focus=${() => {
                        this.dispatchEvent(new BodyCellFocusedEvent(cell, row));
                    }}
                    @click=${() => {
                        this.focusCell([columnIndex, tableRowIndex]);
                    }}
                  >${cellOutput}</td>`;
                })}
              `;
            })}
            ${this.renderEmptyFillerRow()}
            <tr class="filler-row-bottom padding-row" style=${LitHtml.Directives.styleMap({
                height: `${Math.max(0, nonHiddenRows.length - bottomVisibleRow) * ROW_HEIGHT_PIXELS}px`,
            })}></tr>
          </tbody>
        </table>
      </div>
      `, this.shadow, {
                host: this,
            });
        });
        // clang-format on
        // This ensures if the user has a cell focused, but then scrolls so that
        // the focused cell is now not rendered, that when it then gets scrolled
        // back in, that it becomes rendered.
        // However, if the cell is a column header, we don't do this, as that
        // can never be not-rendered.
        const currentlyFocusedRowIndex = this.focusableCell[1];
        if (this.userHasFocusInDataGrid && currentlyFocusedRowIndex > 0) {
            this.focusCell(this.focusableCell);
        }
        this.scrollToBottomIfRequired();
        this.engageResizeObserver();
        this.isRendering = false;
        this.hasRenderedAtLeastOnce = true;
        // If we've received more data mid-render we will do one extra render at
        // the end with the most recent data.
        if (this.scheduleRender) {
            this.scheduleRender = false;
            this.render();
        }
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-data-grid', DataGrid);
//# sourceMappingURL=DataGrid.js.map