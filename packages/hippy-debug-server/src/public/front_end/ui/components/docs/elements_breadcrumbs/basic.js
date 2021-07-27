// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Elements from '../../../../panels/elements/components/components.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import { makeCrumb } from './helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
const component = new Elements.ElementsBreadcrumbs.ElementsBreadcrumbs();
const bodyCrumb = makeCrumb({
    nodeType: Node.ELEMENT_NODE,
    id: 2,
    nodeName: 'body',
    nodeNameNicelyCased: 'body',
    highlightNode: () => {
        document.querySelector('[data-fake-crumb-1]')?.classList.add('highlight');
    },
    clearHighlight: () => {
        document.querySelector('[data-fake-crumb-1]')?.classList.remove('highlight');
    },
});
const divCrumb = makeCrumb({
    nodeType: Node.ELEMENT_NODE,
    id: 3,
    nodeName: 'div',
    nodeNameNicelyCased: 'div',
    attributes: {
        id: 'test-id',
    },
    highlightNode: () => {
        document.querySelector('[data-fake-crumb-2]')?.classList.add('highlight');
    },
    clearHighlight: () => {
        document.querySelector('[data-fake-crumb-2]')?.classList.remove('highlight');
    },
});
document.getElementById('container')?.appendChild(component);
component.data = {
    crumbs: [divCrumb, bodyCrumb],
    selectedNode: bodyCrumb,
};
component.addEventListener('breadcrumbsnodeselected', ({ data }) => {
    // eslint-disable-next-line no-console
    console.log('node selected', data);
});
//# sourceMappingURL=basic.js.map