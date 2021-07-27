// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as DataGrid from '../../data_grid/data_grid.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
const component = new DataGrid.DataGrid.DataGrid();
component.data = {
    columns: [
        { id: 'key', title: 'Key', sortable: true, widthWeighting: 1, visible: true, hideable: false },
        { id: 'value', title: 'Value', sortable: false, widthWeighting: 1, visible: true, hideable: false },
    ],
    rows: [
        // Each key is the ID of a column, and the value is the value for that column
        { cells: [{ columnId: 'key', value: 'Bravo' }, { columnId: 'value', value: 'foobar' }] },
        { cells: [{ columnId: 'key', value: 'Alpha' }, { columnId: 'value', value: 'bazbar' }] },
        { cells: [{ columnId: 'key', value: 'Charlie' }, { columnId: 'value', value: 'bazbar' }] },
        { cells: [{ columnId: 'key', value: 'Delta' }, { columnId: 'value', value: 'bazbar' }] },
        { cells: [{ columnId: 'key', value: 'Echo' }, { columnId: 'value', value: 'bazbar' }] },
        { cells: [{ columnId: 'key', value: 'Foxtrot' }, { columnId: 'value', value: 'bazbar' }] },
    ],
    activeSort: null,
};
document.getElementById('container')?.appendChild(component);
window.setInterval(() => {
    const key = Math.floor(Math.random() * 10);
    const value = Math.floor(Math.random() * 10);
    const randomDataRow = {
        cells: [
            { columnId: 'key', value: `Key: ${key}`, title: `Key: ${key}` },
            { columnId: 'value', value: `Value: ${value}`, title: `Value: ${value}` },
        ],
    };
    component.data = {
        ...component.data,
        rows: [...component.data.rows, randomDataRow],
    };
}, 2000);
//# sourceMappingURL=sticky-headers.js.map