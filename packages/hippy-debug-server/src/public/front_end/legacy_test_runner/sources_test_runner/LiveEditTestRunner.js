// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.SourcesTestRunner = self.SourcesTestRunner || {};

SourcesTestRunner.replaceInSource = function(sourceFrame, string, replacement) {
  sourceFrame._textEditor.setReadOnly(false);

  for (let i = 0; i < sourceFrame._textEditor.linesCount; ++i) {
    const line = sourceFrame._textEditor.line(i);
    const column = line.indexOf(string);

    if (column === -1) {
      continue;
    }

    const range = new TextUtils.TextRange(i, column, i, column + string.length);
    sourceFrame._textEditor.editRange(range, replacement);
    break;
  }
};

SourcesTestRunner.commitSource = function(sourceFrame) {
  sourceFrame.commitEditing();
};

SourcesTestRunner.undoSourceEditing = function(sourceFrame) {
  sourceFrame._textEditor.undo();
};
