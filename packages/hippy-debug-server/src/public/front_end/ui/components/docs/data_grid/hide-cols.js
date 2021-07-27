// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as DataGrid from '../../data_grid/data_grid.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
const component = new DataGrid.DataGrid.DataGrid();
component.data = {
    columns: [
        { id: 'key', title: 'Key', sortable: true, widthWeighting: 2, visible: true, hideable: false },
        { id: 'value', title: 'Value', sortable: false, widthWeighting: 2, visible: true, hideable: true },
        { id: 'number', title: 'Number', sortable: false, widthWeighting: 1, visible: true, hideable: false },
    ],
    rows: [
        {
            cells: [
                { columnId: 'key', value: 'Bravo' },
                { columnId: 'value', value: 'Letter B' },
                { columnId: 'number', value: '1' },
            ],
        },
        {
            cells: [
                { columnId: 'key', value: 'Alpha' },
                { columnId: 'value', value: 'Letter A' },
                { columnId: 'number', value: '2' },
            ],
        },
        {
            cells: [
                { columnId: 'key', value: 'Charlie' },
                { columnId: 'value', value: 'Letter C' },
                { columnId: 'number', value: '3' },
            ],
        },
    ],
    activeSort: null,
};
document.getElementById('container')?.appendChild(component);
const btn = document.querySelector('button');
btn?.addEventListener('click', () => {
    const { columns } = component.data;
    const isVisible = columns[1].visible === true;
    const newColumns = [...columns];
    newColumns[1].visible = !isVisible;
    component.data = {
        ...component.data,
        columns: newColumns,
        rows: component.data.rows,
    };
});
//# sourceMappingURL=hide-cols.js.map