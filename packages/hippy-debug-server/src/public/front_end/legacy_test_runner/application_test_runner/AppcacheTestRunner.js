// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */

self.ApplicationTestRunner = self.ApplicationTestRunner || {};

ApplicationTestRunner.createAndNavigateIFrame = function(url, callback) {
  TestRunner.addSniffer(SDK.ResourceTreeModel.prototype, '_frameNavigated', frameNavigated);
  TestRunner.evaluateInPageAnonymously('createAndNavigateIFrame(unescape(\'' + escape(url) + '\'))');

  function frameNavigated(frame) {
    callback(frame.id);
  }
};

ApplicationTestRunner.navigateIFrame = function(frameId, url, callback) {
  const frame = TestRunner.resourceTreeModel.frameForId(frameId);
  TestRunner.evaluateInPageAnonymously(
      'navigateIFrame(unescape(\'' + escape(frame.name) + '\'), unescape(\'' + escape(url) + '\'))');
  TestRunner.addSniffer(SDK.ResourceTreeModel.prototype, '_frameNavigated', frameNavigated);

  function frameNavigated(frame) {
    callback(frame.id);
  }
};

ApplicationTestRunner.removeIFrame = function(frameId, callback) {
  const frame = TestRunner.resourceTreeModel.frameForId(frameId);
  TestRunner.evaluateInPageAnonymously('removeIFrame(unescape(\'' + escape(frame.name) + '\'))');
  TestRunner.addSniffer(SDK.ResourceTreeModel.prototype, '_frameDetached', frameDetached);

  function frameDetached(frame) {
    callback(frame.id);
  }
};

ApplicationTestRunner.swapFrameCache = function(frameId) {
  const frame = TestRunner.resourceTreeModel.frameForId(frameId);
  TestRunner.evaluateInPageAnonymously('swapFrameCache(unescape(\'' + escape(frame.name) + '\'))');
};

ApplicationTestRunner.dumpApplicationCache = function() {
  ApplicationTestRunner.dumpApplicationCacheTree();
  ApplicationTestRunner.dumpApplicationCacheModel();
  TestRunner.addResult('');
};

ApplicationTestRunner.dumpApplicationCacheTree = function() {
  TestRunner.addResult('Dumping application cache tree:');
  const applicationCacheTreeElement = UI.panels.resources._sidebar.applicationCacheListTreeElement;

  if (!applicationCacheTreeElement.childCount()) {
    TestRunner.addResult('    (empty)');
    return;
  }

  for (let i = 0; i < applicationCacheTreeElement.childCount(); ++i) {
    const manifestTreeElement = applicationCacheTreeElement.childAt(i);
    TestRunner.addResult('    Manifest URL: ' + manifestTreeElement.manifestURL);

    if (!manifestTreeElement.childCount()) {
      TestRunner.addResult('    (no frames)');
      continue;
    }

    for (let j = 0; j < manifestTreeElement.childCount(); ++j) {
      const frameTreeElement = manifestTreeElement.childAt(j);
      TestRunner.addResult('        Frame: ' + frameTreeElement.title);
    }
  }
};

ApplicationTestRunner.frameIdToString = function(frameId) {
  if (!ApplicationTestRunner.framesByFrameId) {
    ApplicationTestRunner.framesByFrameId = {};
  }

  let frame = TestRunner.resourceTreeModel.frameForId(frameId);

  if (!frame) {
    frame = ApplicationTestRunner.framesByFrameId[frameId];
  }

  ApplicationTestRunner.framesByFrameId[frameId] = frame;
  return frame.name;
};

ApplicationTestRunner.applicationCacheStatusToString = function(status) {
  const statusInformation = {};
  statusInformation[applicationCache.UNCACHED] = 'UNCACHED';
  statusInformation[applicationCache.IDLE] = 'IDLE';
  statusInformation[applicationCache.CHECKING] = 'CHECKING';
  statusInformation[applicationCache.DOWNLOADING] = 'DOWNLOADING';
  statusInformation[applicationCache.UPDATEREADY] = 'UPDATEREADY';
  statusInformation[applicationCache.OBSOLETE] = 'OBSOLETE';
  return statusInformation[status] || statusInformation[applicationCache.UNCACHED];
};

ApplicationTestRunner.dumpApplicationCacheModel = function() {
  TestRunner.addResult('Dumping application cache model:');
  const model = UI.panels.resources._sidebar._applicationCacheModel;
  const frameIds = [];

  for (const frameId in model._manifestURLsByFrame) {
    frameIds.push(frameId);
  }

  function compareFunc(a, b) {
    return ApplicationTestRunner.frameIdToString(a).localeCompare(ApplicationTestRunner.frameIdToString(b));
  }

  frameIds.sort(compareFunc);

  if (!frameIds.length) {
    TestRunner.addResult('    (empty)');
    return;
  }

  for (let i = 0; i < frameIds.length; ++i) {
    const frameId = frameIds[i];
    const manifestURL = model.frameManifestURL(frameId);
    const status = model.frameManifestStatus(frameId);
    TestRunner.addResult('    Frame: ' + ApplicationTestRunner.frameIdToString(frameId));
    TestRunner.addResult('        manifest url: ' + manifestURL);
    TestRunner.addResult('        status:       ' + ApplicationTestRunner.applicationCacheStatusToString(status));
  }
};

ApplicationTestRunner.waitForFrameManifestURLAndStatus = function(frameId, manifestURL, status, callback) {
  const frameManifestStatus = UI.panels.resources._sidebar._applicationCacheModel.frameManifestStatus(frameId);
  const frameManifestURL = UI.panels.resources._sidebar._applicationCacheModel.frameManifestURL(frameId);

  if (frameManifestStatus === status && frameManifestURL.indexOf(manifestURL) !== -1) {
    callback();
    return;
  }

  const handler =
      ApplicationTestRunner.waitForFrameManifestURLAndStatus.bind(this, frameId, manifestURL, status, callback);
  TestRunner.addSniffer(Resources.ApplicationCacheModel.prototype, '_frameManifestUpdated', handler);
};

ApplicationTestRunner.startApplicationCacheStatusesRecording = function() {
  if (ApplicationTestRunner.applicationCacheStatusesRecords) {
    ApplicationTestRunner.applicationCacheStatusesRecords = {};
    return;
  }

  ApplicationTestRunner.applicationCacheStatusesRecords = {};

  function addRecord(frameId, manifestURL, status) {
    const record = {};
    record.manifestURL = manifestURL;
    record.status = status;

    if (!ApplicationTestRunner.applicationCacheStatusesRecords[frameId]) {
      ApplicationTestRunner.applicationCacheStatusesRecords[frameId] = [];
    }

    ApplicationTestRunner.applicationCacheStatusesRecords[frameId].push(record);

    if (ApplicationTestRunner.awaitedFrameStatusEventsCount &&
        ApplicationTestRunner.awaitedFrameStatusEventsCount[frameId]) {
      ApplicationTestRunner.awaitedFrameStatusEventsCount[frameId].count--;

      if (!ApplicationTestRunner.awaitedFrameStatusEventsCount[frameId].count) {
        ApplicationTestRunner.awaitedFrameStatusEventsCount[frameId].callback();
      }
    }
  }

  TestRunner.addSniffer(Resources.ApplicationCacheModel.prototype, '_frameManifestUpdated', addRecord, true);
};

ApplicationTestRunner.ensureFrameStatusEventsReceived = function(frameId, count, callback) {
  const records = ApplicationTestRunner.applicationCacheStatusesRecords[frameId] || [];
  const eventsLeft = count - records.length;

  if (!eventsLeft) {
    callback();
    return;
  }

  if (!ApplicationTestRunner.awaitedFrameStatusEventsCount) {
    ApplicationTestRunner.awaitedFrameStatusEventsCount = {};
  }

  ApplicationTestRunner.awaitedFrameStatusEventsCount[frameId] = {count: eventsLeft, callback: callback};
};

TestRunner.deprecatedInitAsync(`
  let framesCount = 0;

  function createAndNavigateIFrame(url) {
    let iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.name = 'frame' + ++framesCount;
    iframe.id = iframe.name;
    document.body.appendChild(iframe);
  }

  function removeIFrame(name) {
    let iframe = document.querySelector('#' + name);
    iframe.parentElement.removeChild(iframe);
  }

  function navigateIFrame(name, url) {
    let iframe = document.querySelector('#' + name);
    iframe.src = url;
  }

  function swapFrameCache(name) {
    let iframe = document.querySelector('#' + name);
    iframe.contentWindow.applicationCache.swapCache();
  }
`);
