// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '../../panels/profiler/profiler-legacy.js';
import '../test_runner/test_runner.js';

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.CPUProfilerTestRunner = self.CPUProfilerTestRunner || {};

CPUProfilerTestRunner.startProfilerTest = function(callback) {
  TestRunner.addResult('Profiler was enabled.');
  TestRunner.addSniffer(UI.panels.js_profiler, '_addProfileHeader', CPUProfilerTestRunner._profileHeaderAdded, true);
  TestRunner.addSniffer(Profiler.ProfileView.prototype, 'refresh', CPUProfilerTestRunner._profileViewRefresh, true);
  TestRunner.safeWrap(callback)();
};

CPUProfilerTestRunner.completeProfilerTest = function() {
  TestRunner.addResult('');
  TestRunner.addResult('Profiler was disabled.');
  TestRunner.completeTest();
};

CPUProfilerTestRunner.runProfilerTestSuite = function(testSuite) {
  const testSuiteTests = testSuite.slice();

  function runner() {
    if (!testSuiteTests.length) {
      CPUProfilerTestRunner.completeProfilerTest();
      return;
    }

    const nextTest = testSuiteTests.shift();
    TestRunner.addResult('');
    TestRunner.addResult(
        'Running: ' +
        /function\s([^(]*)/.exec(nextTest)[1]);
    TestRunner.safeWrap(nextTest)(runner, runner);
  }

  CPUProfilerTestRunner.startProfilerTest(runner);
};

CPUProfilerTestRunner.showProfileWhenAdded = function(title) {
  CPUProfilerTestRunner._showProfileWhenAdded = title;
};

CPUProfilerTestRunner._profileHeaderAdded = function(profile) {
  if (CPUProfilerTestRunner._showProfileWhenAdded === profile.title) {
    UI.panels.js_profiler.showProfile(profile);
  }
};

CPUProfilerTestRunner.waitUntilProfileViewIsShown = function(title, callback) {
  callback = TestRunner.safeWrap(callback);
  const profilesPanel = UI.panels.js_profiler;

  if (profilesPanel.visibleView && profilesPanel.visibleView.profile &&
      profilesPanel.visibleView.profileHeader.title === title) {
    callback(profilesPanel.visibleView);
  } else {
    CPUProfilerTestRunner._waitUntilProfileViewIsShownCallback = {title: title, callback: callback};
  }
};

CPUProfilerTestRunner._profileViewRefresh = function() {
  if (CPUProfilerTestRunner._waitUntilProfileViewIsShownCallback &&
      CPUProfilerTestRunner._waitUntilProfileViewIsShownCallback.title === this.profileHeader.title) {
    const callback = CPUProfilerTestRunner._waitUntilProfileViewIsShownCallback;
    delete CPUProfilerTestRunner._waitUntilProfileViewIsShownCallback;
    callback.callback(this);
  }
};
