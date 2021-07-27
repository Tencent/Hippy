// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../../tree_outline/tree_outline.js';
export const belgraveHouse = {
    treeNodeData: 'BEL',
};
export const officesAndProductsData = [
    {
        treeNodeData: 'Offices',
        children: () => Promise.resolve([
            {
                treeNodeData: 'Europe',
                children: () => Promise.resolve([
                    {
                        treeNodeData: 'UK',
                        children: () => Promise.resolve([
                            {
                                treeNodeData: 'LON',
                                children: () => Promise.resolve([{ treeNodeData: '6PS' }, { treeNodeData: 'CSG' }, belgraveHouse]),
                            },
                        ]),
                    },
                    {
                        treeNodeData: 'Germany',
                        children: () => Promise.resolve([
                            { treeNodeData: 'MUC' },
                            { treeNodeData: 'BER' },
                        ]),
                    },
                ]),
            },
        ]),
    },
    {
        treeNodeData: 'Products',
        children: () => Promise.resolve([
            {
                treeNodeData: 'Chrome',
            },
            {
                treeNodeData: 'YouTube',
            },
            {
                treeNodeData: 'Drive',
            },
            {
                treeNodeData: 'Calendar',
            },
        ]),
    },
];
//# sourceMappingURL=sample-data.js.map