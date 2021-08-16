// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '../test_runner/test_runner.js';
import '../../ui/legacy/components/data_grid/data_grid-legacy.js';

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.DataGridTestRunner = self.DataGridTestRunner || {};

DataGridTestRunner.dumpDataGrid = function(root, descentIntoCollapsed, prefix) {
  if (!prefix) {
    prefix = '';
  }
  const suffix = root.selected ? ' <- selected' : '';
  const columnKeys = root.dataGrid._columnsArray.map(column => column.id);
  const outputColumns = [];
  for (const key of columnKeys) {
    if (key in root.data) {
      outputColumns.push(root.data[key]);
    }
  }
  if (outputColumns.length) {
    TestRunner.addResult(prefix + outputColumns.join(' | ') + suffix);
  }

  if (!descentIntoCollapsed && !root.expanded) {
    return;
  }
  for (const child of root.children) {
    DataGridTestRunner.dumpDataGrid(child, descentIntoCollapsed, prefix + ' ');
  }
};

DataGridTestRunner.validateDataGrid = function(root) {
  const children = root.children;

  for (let i = 0; i < children.length; ++i) {
    const child = children[i];

    if (child.parent !== root) {
      throw 'Wrong parent for child ' + child.data.id + ' of ' + root.data.id;
    }

    if (child.nextSibling !== ((i + 1 === children.length ? null : children[i + 1]))) {
      throw 'Wrong child.nextSibling for ' + child.data.id + ' (' + i + ' of ' + children.length + ') ';
    }

    if (child.previousSibling !== ((i ? children[i - 1] : null))) {
      throw 'Wrong child.previousSibling for ' + child.data.id + ' (' + i + ' of ' + children.length + ') ';
    }

    if (child.parent && !child.parent._isRoot && child.depth !== root.depth + 1) {
      throw 'Wrong depth for ' + child.data.id + ' expected ' + (root.depth + 1) + ' but got ' + child.depth;
    }

    DataGridTestRunner.validateDataGrid(child);
  }

  const selectedNode = root.dataGrid.selectedNode;

  if (!root.parent && selectedNode) {
    if (!selectedNode.selectable) {
      throw 'Selected node is not selectable';
    }
    let node = selectedNode;
    for (; node && node !== root; node = node.parent) {
    }

    if (!node) {
      throw 'Selected node (' + selectedNode.data.id + ') is not within the DataGrid';
    }
  }
};

DataGridTestRunner.dumpAndValidateDataGrid = function(root) {
  DataGridTestRunner.dumpDataGrid(root);
  DataGridTestRunner.validateDataGrid(root);
};
