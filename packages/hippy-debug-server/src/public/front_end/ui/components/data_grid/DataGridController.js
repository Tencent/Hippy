// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import { getRowEntryForColumnId } from './DataGridUtils.js';
import { DataGrid } from './DataGrid.js';
export class DataGridController extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-data-grid-controller`;
    shadow = this.attachShadow({ mode: 'open' });
    hasRenderedAtLeastOnce = false;
    columns = [];
    rows = [];
    contextMenus = undefined;
    /**
     * Because the controller will sort data in place (e.g. mutate it) when we get
     * new data in we store the original data separately. This is so we don't
     * mutate the data we're given, but a copy of the data. If our `get data` is
     * called, we'll return the original, not the sorted data.
     */
    originalColumns = [];
    originalRows = [];
    sortState = null;
    filters = [];
    get data() {
        return {
            columns: this.originalColumns,
            rows: this.originalRows,
            filters: this.filters,
            contextMenus: this.contextMenus,
        };
    }
    set data(data) {
        this.originalColumns = data.columns;
        this.originalRows = data.rows;
        this.contextMenus = data.contextMenus;
        this.filters = data.filters || [];
        this.contextMenus = data.contextMenus;
        this.columns = [...this.originalColumns];
        this.rows = this.cloneAndFilterRows(data.rows, this.filters);
        if (!this.hasRenderedAtLeastOnce && data.initialSort) {
            this.sortState = data.initialSort;
        }
        if (this.sortState) {
            this.sortRows(this.sortState);
        }
        this.render();
    }
    testRowWithFilter(row, filter) {
        let rowMatchesFilter = false;
        const { key, text, negative, regex } = filter;
        let dataToTest;
        if (key) {
            const cell = getRowEntryForColumnId(row, key);
            dataToTest = JSON.stringify(cell.value).toLowerCase();
        }
        else {
            dataToTest = JSON.stringify(row.cells.map(cell => cell.value)).toLowerCase();
        }
        if (regex) {
            rowMatchesFilter = regex.test(dataToTest);
        }
        else if (text) {
            rowMatchesFilter = dataToTest.includes(text.toLowerCase());
        }
        // If `negative` is set to `true`, that means we have to flip the final
        // result, because the filter is matching anything that doesn't match. e.g.
        // {text: 'foo', negative: false} matches rows that contain the text `foo`
        // but {text: 'foo', negative: true} matches rows that do NOT contain the
        // text `foo` so if a filter is marked as negative, we first match against
        // that filter, and then we flip it here.
        return negative ? !rowMatchesFilter : rowMatchesFilter;
    }
    cloneAndFilterRows(rows, filters) {
        if (filters.length === 0) {
            return [...rows];
        }
        return rows.map(row => {
            // We assume that the row should be visible by default.
            let rowShouldBeVisible = true;
            for (const filter of filters) {
                const rowMatchesFilter = this.testRowWithFilter(row, filter);
                // If there are multiple filters, if any return false we hide the row.
                // So if we get a false from testRowWithFilter, we can break early and return false.
                if (!rowMatchesFilter) {
                    rowShouldBeVisible = false;
                    break;
                }
            }
            return {
                ...row,
                hidden: !rowShouldBeVisible,
            };
        });
    }
    sortRows(state) {
        const { columnId, direction } = state;
        this.rows.sort((row1, row2) => {
            const cell1 = getRowEntryForColumnId(row1, columnId);
            const cell2 = getRowEntryForColumnId(row2, columnId);
            const value1 = typeof cell1.value === 'number' ? cell1.value : String(cell1.value).toUpperCase();
            const value2 = typeof cell2.value === 'number' ? cell2.value : String(cell2.value).toUpperCase();
            if (value1 < value2) {
                return direction === "ASC" /* ASC */ ? -1 : 1;
            }
            if (value1 > value2) {
                return direction === "ASC" /* ASC */ ? 1 : -1;
            }
            return 0;
        });
        this.render();
    }
    onColumnHeaderClick(event) {
        const { column } = event.data;
        this.applySortOnColumn(column);
    }
    applySortOnColumn(column) {
        if (this.sortState && this.sortState.columnId === column.id) {
            const { columnId, direction } = this.sortState;
            /* When users sort, we go No Sort => ASC => DESC => No sort
             * So if the current direction is DESC, we clear the state.
             */
            if (direction === "DESC" /* DESC */) {
                this.sortState = null;
            }
            else {
                /* The state is ASC, so toggle to DESC */
                this.sortState = {
                    columnId,
                    direction: "DESC" /* DESC */,
                };
            }
        }
        else {
            /* The column wasn't previously sorted, so we sort it in ASC order. */
            this.sortState = {
                columnId: column.id,
                direction: "ASC" /* ASC */,
            };
        }
        if (this.sortState) {
            this.sortRows(this.sortState);
        }
        else {
            // No sortstate = render the original rows.
            this.rows = [...this.originalRows];
            this.render();
        }
    }
    onContextMenuColumnSortClick(event) {
        this.applySortOnColumn(event.data.column);
    }
    onContextMenuHeaderResetClick() {
        this.sortState = null;
        this.rows = [...this.originalRows];
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        :host {
          display: block;
          height: 100%;
          overflow: hidden;
        }
      </style>
      <${DataGrid.litTagName} .data=${{
            columns: this.columns,
            rows: this.rows,
            activeSort: this.sortState,
            contextMenus: this.contextMenus,
        }}
        @columnheaderclick=${this.onColumnHeaderClick}
        @contextmenucolumnsortclick=${this.onContextMenuColumnSortClick}
        @contextmenuheaderresetclick=${this.onContextMenuHeaderResetClick}
     ></${DataGrid.litTagName}>
    `, this.shadow, {
            host: this,
        });
        // clang-format on
        this.hasRenderedAtLeastOnce = true;
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-data-grid-controller', DataGridController);
//# sourceMappingURL=DataGridController.js.map