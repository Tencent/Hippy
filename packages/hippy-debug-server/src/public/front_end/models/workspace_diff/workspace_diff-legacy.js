// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as WorkspaceDiffModule from './workspace_diff.js';
self.WorkspaceDiff = self.WorkspaceDiff || {};
WorkspaceDiff = WorkspaceDiff || {};
/** @constructor */
WorkspaceDiff.WorkspaceDiff = WorkspaceDiffModule.WorkspaceDiff.WorkspaceDiffImpl;
/** @constructor */
WorkspaceDiff.WorkspaceDiff.UISourceCodeDiff = WorkspaceDiffModule.WorkspaceDiff.UISourceCodeDiff;
WorkspaceDiff.WorkspaceDiff.UpdateTimeout = WorkspaceDiffModule.WorkspaceDiff.UpdateTimeout;
/** @enum {symbol} */
WorkspaceDiff.Events = WorkspaceDiffModule.WorkspaceDiff.Events;
WorkspaceDiff.workspaceDiff = WorkspaceDiffModule.WorkspaceDiff.workspaceDiff;
/** @constructor */
WorkspaceDiff.DiffUILocation = WorkspaceDiffModule.WorkspaceDiff.DiffUILocation;
//# sourceMappingURL=workspace_diff-legacy.js.map