// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as DiffModule from './diff.js';
self.Diff = self.Diff || {};
Diff = Diff || {};
Diff.Diff = DiffModule.Diff.DiffWrapper;
/** @enum {number} */
Diff.Diff.Operation = DiffModule.Diff.Operation;
//# sourceMappingURL=diff-legacy.js.map