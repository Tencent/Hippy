// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as LitHtml from '../../../lit-html/lit-html.js';
import * as ExpandableList from '../../expandable_list/expandable_list.js';
await FrontendHelpers.initializeGlobalVars();
const component = new ExpandableList.ExpandableList.ExpandableList();
const rows = [];
rows.push(LitHtml.html `
  <div>This is row 1. Click on the triangle icon to expand.</div>
`);
for (let rowNumber = 2; rowNumber < 11; rowNumber++) {
    rows.push(LitHtml.html `
    <div>This is row ${rowNumber}.</div>
  `);
}
component.data = {
    rows,
};
document.getElementById('container')?.appendChild(component);
//# sourceMappingURL=basic.js.map