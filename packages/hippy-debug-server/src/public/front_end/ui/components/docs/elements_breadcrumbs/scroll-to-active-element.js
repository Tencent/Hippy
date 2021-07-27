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
    id: 1,
    nodeName: 'body',
    nodeNameNicelyCased: 'body',
    attributes: { class: 'body-class1 body-class2' },
});
const divCrumb = makeCrumb({
    nodeType: Node.ELEMENT_NODE,
    id: 2,
    nodeName: 'div',
    nodeNameNicelyCased: 'div',
    attributes: {
        id: 'test-id',
        class: 'wrapper-div',
    },
});
const spanCrumb = makeCrumb({
    nodeType: Node.ELEMENT_NODE,
    id: 3,
    nodeName: 'span',
    nodeNameNicelyCased: 'span',
    attributes: {
        id: 'my-span-has-a-long-id',
    },
});
const strongCrumb = makeCrumb({
    nodeType: Node.ELEMENT_NODE,
    id: 4,
    nodeName: 'strong',
    nodeNameNicelyCased: 'strong',
    attributes: {
        id: 'gotta-be-bold',
    },
});
const emCrumb = makeCrumb({
    nodeType: Node.ELEMENT_NODE,
    id: 5,
    nodeName: 'em',
    nodeNameNicelyCased: 'em',
    attributes: { id: 'my-em-has-a-long-id', class: 'and-a-very-long-class' },
});
document.getElementById('container')?.appendChild(component);
component.data = {
    crumbs: [emCrumb, strongCrumb, spanCrumb, divCrumb, bodyCrumb],
    selectedNode: bodyCrumb,
};
const button = component.shadowRoot?.querySelector?.('button.overflow.right');
button?.dispatchEvent(new MouseEvent('click'));
// Each subsequent click is timed out to allow the smooth scroll to finish.
window.setTimeout(() => {
    button?.dispatchEvent(new MouseEvent('click'));
    window.setTimeout(() => {
        button?.dispatchEvent(new MouseEvent('click'));
    }, 200);
}, 200);
const btn = document.querySelector('button');
btn?.addEventListener('click', () => {
    component.data = {
        crumbs: [emCrumb, strongCrumb, spanCrumb, divCrumb, bodyCrumb],
        selectedNode: divCrumb,
    };
});
//# sourceMappingURL=scroll-to-active-element.js.map