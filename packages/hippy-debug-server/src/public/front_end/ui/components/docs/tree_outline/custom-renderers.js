// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as LitHtml from '../../../lit-html/lit-html.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as TreeOutline from '../../tree_outline/tree_outline.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const data = {
    defaultRenderer: (node, state) => {
        const { cssProperty, cssValue } = node.treeNodeData;
        const valueStyles = LitHtml.Directives.styleMap({
            paddingLeft: '10px',
            fontStyle: 'italic',
            color: 'var(--color-syntax-1)',
        });
        return LitHtml.html `<code>${cssProperty}</code>:${state.isExpanded ? LitHtml.nothing : LitHtml.html `<code style=${valueStyles}>${cssValue}</code>`}`;
    },
    tree: [
        {
            treeNodeData: { cssProperty: 'border', cssValue: '1px solid red' },
        },
        {
            treeNodeData: { cssProperty: 'font-size', cssValue: '20px' },
        },
        {
            treeNodeData: { cssProperty: 'margin', cssValue: '10px 5px' },
            async children() {
                return Promise.resolve([
                    { treeNodeData: { cssProperty: 'margin-left', cssValue: '5px' } },
                    { treeNodeData: { cssProperty: 'margin-right', cssValue: '5px' } },
                    { treeNodeData: { cssProperty: 'margin-top', cssValue: '10px' } },
                    { treeNodeData: { cssProperty: 'margin-bottom', cssValue: '10px' } },
                ]);
            },
        },
    ],
};
const component = new TreeOutline.TreeOutline.TreeOutline();
component.data = data;
document.getElementById('container')?.appendChild(component);
document.getElementById('recursively-expand')?.addEventListener('click', () => {
    component.expandRecursively();
});
//# sourceMappingURL=custom-renderers.js.map