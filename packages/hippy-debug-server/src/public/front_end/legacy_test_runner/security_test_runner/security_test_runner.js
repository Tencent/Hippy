// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '../test_runner/test_runner.js';
import '../../panels/security/security-legacy.js';

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.SecurityTestRunner = self.SecurityTestRunner || {};

SecurityTestRunner.dumpSecurityPanelSidebarOrigins = function() {
  for (const key in Security.SecurityPanelSidebarTree.OriginGroup) {
    const originGroup = Security.SecurityPanelSidebarTree.OriginGroup[key];
    const element = Security.SecurityPanel._instance()._sidebarTree._originGroups.get(originGroup);

    if (element.hidden) {
      continue;
    }

    TestRunner.addResult('Group: ' + element.title);
    const originTitles = element.childrenListElement.getElementsByTagName('span');

    for (const originTitle of originTitles) {
      if (originTitle.className !== 'tree-element-title') {
        TestRunner.dumpDeepInnerHTML(originTitle);
      }
    }
  }
};

SecurityTestRunner.dispatchRequestFinished = function(request) {
  TestRunner.networkManager.dispatchEventToListeners(SDK.NetworkManager.Events.RequestFinished, request);
};
