// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as EnvironmentHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as DataGrid from '../../data_grid/data_grid.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await EnvironmentHelpers.initializeGlobalVars();
await ComponentHelpers.ComponentServerSetup.setup();
const component = new DataGrid.DataGridController.DataGridController();
component.data = {
    columns: [
        { id: 'key', title: 'Key', sortable: true, widthWeighting: 1, visible: true, hideable: false },
        { id: 'value', title: 'Value', sortable: true, widthWeighting: 1, visible: true, hideable: true },
    ],
    rows: [
        // Each key is the ID of a column, and the value is the value for that column
        { cells: [{ columnId: 'key', value: 'Bravo', title: 'Bravo' }, { columnId: 'value', value: 'Letter B' }] },
        { cells: [{ columnId: 'key', value: 'Alpha', title: 'Alpha' }, { columnId: 'value', value: 'Letter A' }] },
        { cells: [{ columnId: 'key', value: 'Charlie', title: 'Charlie' }, { columnId: 'value', value: 'Letter C' }] },
    ],
};
document.getElementById('container')?.appendChild(component);
function createRandomString() {
    let ret = '';
    for (let i = 0; i < 16; i++) {
        const letter = String.fromCharCode(Math.floor(65 + Math.random() * 26));
        ret += letter;
    }
    return ret;
}
document.getElementById('add')?.addEventListener('click', () => {
    const newRow = {
        cells: [{ columnId: 'key', value: createRandomString() }, { columnId: 'value', value: createRandomString() }],
    };
    component.data = {
        ...component.data,
        rows: [...component.data.rows, newRow],
    };
});
//# sourceMappingURL=basic.js.map