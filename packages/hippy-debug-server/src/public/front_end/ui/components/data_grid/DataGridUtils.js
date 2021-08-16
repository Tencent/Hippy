// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as DataGridRenderers from './DataGridRenderers.js';
export function getRowEntryForColumnId(row, id) {
    const rowEntry = row.cells.find(r => r.columnId === id);
    if (rowEntry === undefined) {
        throw new Error(`Found a row that was missing an entry for column ${id}.`);
    }
    return rowEntry;
}
export function renderCellValue(cell) {
    if (cell.renderer) {
        return cell.renderer(cell.value);
    }
    return DataGridRenderers.primitiveRenderer(cell.value);
}
/**
 * When the user passes in columns we want to know how wide each one should be.
 * We don't work in exact percentages, or pixel values, because it's then
 * unclear what to do in the event that one column is hidden. How do we
 * distribute up the extra space?
 *
 * Instead, each column has a weighting, which is its width proportionate to the
 * total weighting of all columns. For example:
 *
 * -> two columns both with widthWeighting: 1, will be 50% each, because the
 * total weight = 2, and each column is 1
 *
 * -> if you have two columns, the first width a weight of 2, and the second
 * with a weight of 1, the first will take up 66% and the other 33%.
 *
 * This way, when you are calculating the %, it's easy to do because if a
 * particular column becomes hidden, you ignore it / give it a weighting of 0,
 * and the space is evenly distributed amongst the remaining visible columns.
 *
 * @param allColumns
 * @param columnId
 */
export function calculateColumnWidthPercentageFromWeighting(allColumns, columnId) {
    const totalWeights = allColumns.filter(c => c.visible).reduce((sumOfWeights, col) => sumOfWeights + col.widthWeighting, 0);
    const matchingColumn = allColumns.find(c => c.id === columnId);
    if (!matchingColumn) {
        throw new Error(`Could not find column with ID ${columnId}`);
    }
    if (matchingColumn.widthWeighting < 1) {
        throw new Error(`Error with column ${columnId}: width weightings must be >= 1.`);
    }
    if (!matchingColumn.visible) {
        return 0;
    }
    return Math.round((matchingColumn.widthWeighting / totalWeights) * 100);
}
export function handleArrowKeyNavigation(options) {
    const { key, currentFocusedCell, columns, rows } = options;
    const [selectedColIndex, selectedRowIndex] = currentFocusedCell;
    switch (key) {
        case "ArrowLeft" /* LEFT */: {
            const firstVisibleColumnIndex = columns.findIndex(c => c.visible);
            if (selectedColIndex === firstVisibleColumnIndex) {
                // User is as far left as they can go, so don't move them.
                return [selectedColIndex, selectedRowIndex];
            }
            // Set the next index to first be the column we are already on, and then
            // iterate back through all columns to our left, breaking the loop if we
            // find one that's not hidden. If we don't find one, we'll stay where we
            // are.
            let nextColIndex = selectedColIndex;
            for (let i = nextColIndex - 1; i >= 0; i--) {
                const col = columns[i];
                if (col.visible) {
                    nextColIndex = i;
                    break;
                }
            }
            return [nextColIndex, selectedRowIndex];
        }
        case "ArrowRight" /* RIGHT */: {
            // Set the next index to first be the column we are already on, and then
            // iterate through all columns to our right, breaking the loop if we
            // find one that's not hidden. If we don't find one, we'll stay where we
            // are.
            let nextColIndex = selectedColIndex;
            for (let i = nextColIndex + 1; i < columns.length; i++) {
                const col = columns[i];
                if (col.visible) {
                    nextColIndex = i;
                    break;
                }
            }
            return [nextColIndex, selectedRowIndex];
        }
        case "ArrowUp" /* UP */: {
            const columnsSortable = columns.some(col => col.sortable === true);
            const minRowIndex = columnsSortable ? 0 : 1;
            if (selectedRowIndex === minRowIndex) {
                // If any columns are sortable the user can navigate into the column
                // header row, else they cannot. So if they are on the highest row they
                // can be, just return the current cell as they cannot move up.
                return [selectedColIndex, selectedRowIndex];
            }
            let rowIndexToMoveTo = selectedRowIndex;
            for (let i = selectedRowIndex - 1; i >= minRowIndex; i--) {
                // This means we got past all the body rows and therefore the user needs
                // to go into the column row.
                if (i === 0) {
                    rowIndexToMoveTo = 0;
                    break;
                }
                const matchingRow = rows[i - 1];
                if (!matchingRow.hidden) {
                    rowIndexToMoveTo = i;
                    break;
                }
            }
            return [selectedColIndex, rowIndexToMoveTo];
        }
        case "ArrowDown" /* DOWN */: {
            if (selectedRowIndex === 0) {
                // The user is on the column header. So find the first visible body row and take them there!
                const firstVisibleBodyRowIndex = rows.findIndex(row => !row.hidden);
                if (firstVisibleBodyRowIndex > -1) {
                    return [selectedColIndex, firstVisibleBodyRowIndex + 1];
                }
                // If we didn't find a single visible row, leave the user where they are.
                return [selectedColIndex, selectedRowIndex];
            }
            let rowIndexToMoveTo = selectedRowIndex;
            // Work down from our starting position to find the next visible row to move to.
            for (let i = rowIndexToMoveTo + 1; i < rows.length + 1; i++) {
                const matchingRow = rows[i - 1];
                if (!matchingRow.hidden) {
                    rowIndexToMoveTo = i;
                    break;
                }
            }
            return [selectedColIndex, rowIndexToMoveTo];
        }
        default:
            return Platform.assertNever(key, `Unknown arrow key: ${key}`);
    }
}
export const calculateFirstFocusableCell = (options) => {
    const { columns, rows } = options;
    const someColumnsSortable = columns.some(col => col.sortable === true);
    const focusableRowIndex = someColumnsSortable ? 0 : rows.findIndex(row => !row.hidden) + 1;
    const focusableColIndex = columns.findIndex(col => col.visible);
    return [focusableColIndex, focusableRowIndex];
};
export class ContextMenuColumnSortClickEvent extends Event {
    data;
    constructor(column) {
        super('contextmenucolumnsortclick');
        this.data = {
            column,
        };
    }
}
export class ContextMenuHeaderResetClickEvent extends Event {
    constructor() {
        super('contextmenuheaderresetclick');
    }
}
//# sourceMappingURL=DataGridUtils.js.map