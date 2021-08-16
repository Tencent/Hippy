// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ChangesModule from './changes.js';
self.Changes = self.Changes || {};
Changes = Changes || {};
Changes.ChangesHighlighter = ChangesModule.ChangesHighlighter.ChangesHighlighter;
/**
 * @constructor
 */
Changes.ChangesSidebar = ChangesModule.ChangesSidebar.ChangesSidebar;
/**
 * @constructor
 */
Changes.ChangesView = ChangesModule.ChangesView.ChangesView;
/** @enum {string} */
Changes.ChangesView.RowType = ChangesModule.ChangesView.RowType;
/**
 * @implements {Common.Revealer}
 */
Changes.ChangesView.DiffUILocationRevealer = ChangesModule.ChangesView.DiffUILocationRevealer;
//# sourceMappingURL=changes-legacy.js.map