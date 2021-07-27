// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */

self.ApplicationTestRunner = self.ApplicationTestRunner || {};

ApplicationTestRunner.isStorageView = function(view) {
  return view instanceof Resources.StorageView;
};
