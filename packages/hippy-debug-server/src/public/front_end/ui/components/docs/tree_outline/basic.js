// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as TreeOutline from '../../tree_outline/tree_outline.js';
import { belgraveHouse, officesAndProductsData } from './sample-data.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const component = new TreeOutline.TreeOutline.TreeOutline();
component.data = {
    defaultRenderer: TreeOutline.TreeOutline.defaultRenderer,
    tree: officesAndProductsData,
};
component.setAttribute('animated', 'animated');
component.addEventListener('treenodemouseover', (event) => {
    const evt = event;
    // eslint-disable-next-line no-console
    console.log('Node', evt.data.node, 'mouseover');
});
component.addEventListener('treenodemouseout', (event) => {
    const evt = event;
    // eslint-disable-next-line no-console
    console.log('Node', evt.data.node, 'mouseout');
});
document.getElementById('container')?.appendChild(component);
document.getElementById('recursively-expand')?.addEventListener('click', () => {
    component.expandRecursively();
});
document.getElementById('expand-to-belgrave-house')?.addEventListener('click', () => {
    component.expandToAndSelectTreeNode(belgraveHouse);
});
//# sourceMappingURL=basic.js.map