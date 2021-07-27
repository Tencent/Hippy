// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as DataGrid from '../../data_grid/data_grid.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
const component = new DataGrid.DataGrid.DataGrid();
component.data = {
    columns: [
        { id: 'key', title: 'Key', widthWeighting: 1, visible: true, hideable: false },
        { id: 'value', title: 'Value', widthWeighting: 1, visible: true, hideable: false },
    ],
    rows: Array.from({ length: 10 }, () => {
        return getRandomRow();
    }),
    activeSort: null,
};
document.getElementById('container')?.appendChild(component);
function getRandomRow() {
    const key = Math.floor(Math.random() * 10);
    const value = Math.floor(Math.random() * 10);
    const randomDataRow = {
        cells: [
            { columnId: 'key', value: `Key: ${key}`, title: `Key: ${key}` },
            { columnId: 'value', value: `Value: ${value}`, title: `Value: ${value}` },
        ],
    };
    return randomDataRow;
}
/**
 * Set so we can call this from an interaction test to emulate the user
 * interacting with the data grid whilst something is populating the grid with
 * new data - e.g. like the protocol monitor.
 */
// @ts-expect-error
window.addNewRow = function () {
    addNewRow();
};
function addNewRow() {
    const newRow = getRandomRow();
    component.data = {
        ...component.data,
        rows: [...component.data.rows, newRow],
    };
}
document.querySelector('#add')?.addEventListener('click', (event) => {
    event.preventDefault();
    addNewRow();
});
//# sourceMappingURL=adding-data.js.map