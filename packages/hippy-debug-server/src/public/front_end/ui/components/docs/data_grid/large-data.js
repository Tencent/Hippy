// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as DataGrid from '../../data_grid/data_grid.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const component = new DataGrid.DataGrid.DataGrid();
function createRandomString() {
    let ret = '';
    for (let i = 0; i < 16; i++) {
        const letter = String.fromCharCode(Math.floor(65 + Math.random() * 26));
        ret += letter;
    }
    return ret;
}
const rows = [];
for (let i = 0; i < 1000; i++) {
    const newRow = {
        cells: [
            { columnId: 'key', value: `Row ${i + 1}` },
            { columnId: 'value', value: createRandomString() },
        ],
    };
    rows.push(newRow);
}
component.data = {
    columns: [
        { id: 'key', title: 'Key', widthWeighting: 1, visible: true, hideable: false, sortable: true },
        { id: 'value', title: 'Value', widthWeighting: 1, visible: true, hideable: true },
    ],
    rows,
    activeSort: null,
};
document.getElementById('container')?.appendChild(component);
//# sourceMappingURL=large-data.js.map