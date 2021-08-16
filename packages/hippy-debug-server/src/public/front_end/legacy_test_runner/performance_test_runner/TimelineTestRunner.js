// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.PerformanceTestRunner = self.PerformanceTestRunner || {};

PerformanceTestRunner.timelinePropertyFormatters = {
  children: 'formatAsTypeName',
  endTime: 'formatAsTypeName',
  requestId: 'formatAsTypeName',
  startTime: 'formatAsTypeName',
  responseTime: 'formatAsTypeName',
  stackTrace: 'formatAsTypeName',
  url: 'formatAsURL',
  fileName: 'formatAsURL',
  scriptName: 'formatAsTypeName',
  scriptId: 'formatAsTypeName',
  usedHeapSizeDelta: 'skip',
  id: 'formatAsTypeName',
  timerId: 'formatAsTypeName',
  layerId: 'formatAsTypeName',
  frameId: 'formatAsTypeName',
  frame: 'formatAsTypeName',
  page: 'formatAsTypeName',
  encodedDataLength: 'formatAsTypeName',
  identifier: 'formatAsTypeName',
  clip: 'formatAsTypeName',
  root: 'formatAsTypeName',
  backendNodeId: 'formatAsTypeName',
  nodeId: 'formatAsTypeName',
  rootNode: 'formatAsTypeName',
  finishTime: 'formatAsTypeName',
  thread: 'formatAsTypeName',
  allottedMilliseconds: 'formatAsTypeName',
  timedOut: 'formatAsTypeName',
  networkTime: 'formatAsTypeName',
  timing: 'formatAsTypeName',
  streamed: 'formatAsTypeName',
  producedCacheSize: 'formatAsTypeName',
  consumedCacheSize: 'formatAsTypeName'
};

PerformanceTestRunner.InvalidationFormatters = {
  _tracingEvent: 'skip',
  cause: 'formatAsInvalidationCause',
  frame: 'skip',
  invalidatedSelectorId: 'skip',
  invalidationList: 'skip',
  invalidationSet: 'skip',
  linkedRecalcStyleEvent: 'skip',
  linkedLayoutEvent: 'skip',
  nodeId: 'skip',
  paintId: 'skip',
  startTime: 'skip'
};

TestRunner.formatters.formatAsInvalidationCause = function(cause) {
  if (!cause) {
    return '<undefined>';
  }

  let stackTrace;

  if (cause.stackTrace && cause.stackTrace.length) {
    stackTrace =
        TestRunner.formatters.formatAsURL(cause.stackTrace[0].url) + ':' + (cause.stackTrace[0].lineNumber + 1);
  }

  return '{reason: ' + cause.reason + ', stackTrace: ' + stackTrace + '}';
};

PerformanceTestRunner.createTracingModel = function(events) {
  const model = new SDK.TracingModel(new Bindings.TempFileBackingStorage('tracing'));
  model.addEvents(events);
  model.tracingComplete();
  return model;
};

PerformanceTestRunner.tracingModel = function() {
  return UI.panels.timeline._performanceModel.tracingModel();
};

PerformanceTestRunner.invokeWithTracing = function(functionName, callback, additionalCategories, enableJSSampling) {
  let categories = '-*,disabled-by-default-devtools.timeline*,devtools.timeline,blink.user_timing,' +
      SDK.TracingModel.LegacyTopLevelEventCategory;

  if (additionalCategories) {
    categories += ',' + additionalCategories;
  }

  const timelinePanel = UI.panels.timeline;
  const timelineController = PerformanceTestRunner.createTimelineController();
  timelinePanel._timelineController = timelineController;
  timelineController._startRecordingWithCategories(categories, enableJSSampling).then(tracingStarted);

  function tracingStarted() {
    timelinePanel._recordingStarted();
    TestRunner.callFunctionInPageAsync(functionName).then(onPageActionsDone);
  }

  function onPageActionsDone() {
    PerformanceTestRunner.runWhenTimelineIsReady(callback);
    timelineController.stopRecording();
  }
};

PerformanceTestRunner.performanceModel = function() {
  return UI.panels.timeline._performanceModel;
};

PerformanceTestRunner.timelineModel = function() {
  return PerformanceTestRunner.performanceModel().timelineModel();
};

PerformanceTestRunner.timelineFrameModel = function() {
  return PerformanceTestRunner.performanceModel().frameModel();
};

PerformanceTestRunner.createPerformanceModelWithEvents = function(events) {
  const tracingModel = new SDK.TracingModel(new Bindings.TempFileBackingStorage('tracing'));
  tracingModel.addEvents(events);
  tracingModel.tracingComplete();
  const performanceModel = new Timeline.PerformanceModel();
  performanceModel.setTracingModel(tracingModel);
  UI.panels.timeline._performanceModel = performanceModel;
  UI.panels.timeline._applyFilters(performanceModel);
  return performanceModel;
};

PerformanceTestRunner.createTimelineController = function() {
  const controller = new Timeline.TimelineController(self.SDK.targetManager.mainTarget(), UI.panels.timeline);
  controller._tracingManager = TestRunner.tracingManager;
  return controller;
};

PerformanceTestRunner.runWhenTimelineIsReady = function(callback) {
  TestRunner.addSniffer(UI.panels.timeline, 'loadingComplete', () => callback());
};

PerformanceTestRunner.startTimeline = function() {
  const panel = UI.panels.timeline;
  panel._toggleRecording();
  return TestRunner.addSnifferPromise(panel, '_recordingStarted');
};

PerformanceTestRunner.stopTimeline = function() {
  return new Promise(resolve => {
    PerformanceTestRunner.runWhenTimelineIsReady(resolve);
    UI.panels.timeline._toggleRecording();
  });
};

PerformanceTestRunner.runPerfTraceWithReload = async function() {
  await PerformanceTestRunner.startTimeline();
  await TestRunner.reloadPagePromise();
  await PerformanceTestRunner.stopTimeline();
};

PerformanceTestRunner.getTimelineWidget = async function() {
  return await self.UI.viewManager.view('timeline').widget();
};

PerformanceTestRunner.getNetworkFlameChartElement = async function() {
  const widget = await PerformanceTestRunner.getTimelineWidget();
  return widget._flameChart._networkFlameChart.contentElement;
};

PerformanceTestRunner.getMainFlameChartElement = async function() {
  const widget = await PerformanceTestRunner.getTimelineWidget();
  return widget._flameChart._mainFlameChart.contentElement;
};

PerformanceTestRunner.evaluateWithTimeline = async function(actions) {
  await PerformanceTestRunner.startTimeline();
  await TestRunner.evaluateInPageAnonymously(actions);
  await PerformanceTestRunner.stopTimeline();
};

PerformanceTestRunner.invokeAsyncWithTimeline = async function(functionName) {
  await PerformanceTestRunner.startTimeline();
  await TestRunner.callFunctionInPageAsync(functionName);
  await PerformanceTestRunner.stopTimeline();
};

PerformanceTestRunner.performActionsAndPrint = async function(actions, typeName, includeTimeStamps) {
  await PerformanceTestRunner.evaluateWithTimeline(actions);
  await PerformanceTestRunner.printTimelineRecordsWithDetails(typeName);
  if (includeTimeStamps) {
    TestRunner.addResult('Timestamp records: ');
    PerformanceTestRunner.printTimestampRecords(typeName);
  }
  TestRunner.completeTest();
};

PerformanceTestRunner.printTimelineRecords = function(name) {
  for (const event of PerformanceTestRunner.timelineModel().inspectedTargetEvents()) {
    if (event.name === name) {
      PerformanceTestRunner.printTraceEventProperties(event);
    }
  }
};

PerformanceTestRunner.printTimelineRecordsWithDetails = async function(name) {
  for (const event of PerformanceTestRunner.timelineModel().inspectedTargetEvents()) {
    if (name === event.name) {
      await PerformanceTestRunner.printTraceEventPropertiesWithDetails(event);
    }
  }
};

PerformanceTestRunner.walkTimelineEventTree = async function(callback) {
  const view = new Timeline.EventsTimelineTreeView(UI.panels.timeline._filters, null);
  view.setModel(PerformanceTestRunner.performanceModel(), PerformanceTestRunner.mainTrack());
  const selection = Timeline.TimelineSelection.fromRange(
      PerformanceTestRunner.timelineModel().minimumRecordTime(),
      PerformanceTestRunner.timelineModel().maximumRecordTime());
  view.updateContents(selection);
  await PerformanceTestRunner.walkTimelineEventTreeUnderNode(callback, view._currentTree, 0);
};

PerformanceTestRunner.walkTimelineEventTreeUnderNode = async function(callback, root, level) {
  const event = root.event;

  if (event) {
    await callback(event, level, root);
  }

  for (const child of root.children().values()) {
    await PerformanceTestRunner.walkTimelineEventTreeUnderNode(callback, child, (level || 0) + 1);
  }
};

PerformanceTestRunner.printTimestampRecords = function(typeName) {
  const dividers = PerformanceTestRunner.timelineModel().timeMarkerEvents();

  for (const event of dividers) {
    if (event.name === typeName) {
      PerformanceTestRunner.printTraceEventProperties(event);
    }
  }
};

PerformanceTestRunner.forAllEvents = async function(events, callback) {
  const eventStack = [];

  for (const event of events) {
    while (eventStack.length && eventStack[eventStack.length - 1].endTime <= event.startTime) {
      eventStack.pop();
    }

    await callback(event, eventStack);

    if (event.endTime) {
      eventStack.push(event);
    }
  }
};

PerformanceTestRunner.printTraceEventProperties = function(traceEvent) {
  TestRunner.addResult(traceEvent.name + ' Properties:');
  const data = traceEvent.args['beginData'] || traceEvent.args['data'];
  const frameId = data && data['frame'];

  const object = {
    data: traceEvent.args['data'] || traceEvent.args,
    endTime: traceEvent.endTime || traceEvent.startTime,
    frameId: frameId,
    stackTrace: TimelineModel.TimelineData.forEvent(traceEvent).stackTrace,
    startTime: traceEvent.startTime,
    type: traceEvent.name
  };

  for (const field in object) {
    if (object[field] === null || object[field] === undefined) {
      delete object[field];
    }
  }

  TestRunner.addObject(object, PerformanceTestRunner.timelinePropertyFormatters);
};

PerformanceTestRunner.printTraceEventPropertiesWithDetails = async function(event) {
  PerformanceTestRunner.printTraceEventProperties(event);
  const details = await Timeline.TimelineUIUtils.buildDetailsTextForTraceEvent(
      event, self.SDK.targetManager.mainTarget(), new Components.Linkifier());
  TestRunner.waitForPendingLiveLocationUpdates();
  TestRunner.addResult(`Text details for ${event.name}: ${details}`);

  if (TimelineModel.TimelineData.forEvent(event).warning) {
    TestRunner.addResult(`${event.name} has a warning`);
  }
};

PerformanceTestRunner.mainTrack = function() {
  let mainTrack;
  for (const track of PerformanceTestRunner.timelineModel().tracks()) {
    if (track.type === TimelineModel.TimelineModel.TrackType.MainThread && track.forMainFrame) {
      mainTrack = track;
    }
  }
  return mainTrack;
};

PerformanceTestRunner.mainTrackEvents = function() {
  return PerformanceTestRunner.mainTrack().events;
};

PerformanceTestRunner.findTimelineEvent = function(name, index) {
  return PerformanceTestRunner.mainTrackEvents().filter(e => e.name === name)[index || 0];
};

PerformanceTestRunner.findChildEvent = function(events, parentIndex, name) {
  const endTime = events[parentIndex].endTime;

  for (let i = parentIndex + 1; i < events.length && (!events[i].endTime || events[i].endTime <= endTime); ++i) {
    if (events[i].name === name) {
      return events[i];
    }
  }

  return null;
};

PerformanceTestRunner.dumpFrame = function(frame) {
  const fieldsToDump = [
    'cpuTime', 'duration', 'startTime', 'endTime', 'id', 'mainThreadFrameId', 'timeByCategory', 'other', 'scripting',
    'painting', 'rendering', 'committedFrom', 'idle'
  ];

  function formatFields(object) {
    const result = {};

    for (const key in object) {
      if (fieldsToDump.indexOf(key) < 0) {
        continue;
      }

      let value = object[key];

      if (typeof value === 'number') {
        value = Number(value.toFixed(7));
      } else if (typeof value === 'object' && value) {
        value = formatFields(value);
      }

      result[key] = value;
    }

    return result;
  }

  TestRunner.addObject(formatFields(frame));
};

PerformanceTestRunner.dumpInvalidations = function(recordType, index, comment) {
  const event = PerformanceTestRunner.findTimelineEvent(recordType, index || 0);

  TestRunner.addArray(
      TimelineModel.InvalidationTracker.invalidationEventsFor(event), PerformanceTestRunner.InvalidationFormatters, '',
      comment);
};

PerformanceTestRunner.dumpFlameChartProvider = function(provider, includeGroups) {
  const includeGroupsSet = includeGroups && new Set(includeGroups);
  const timelineData = provider.timelineData();
  const stackDepth = provider.maxStackDepth();
  const entriesByLevel = new Platform.MapUtilities.Multimap();

  for (let i = 0; i < timelineData.entryLevels.length; ++i) {
    entriesByLevel.set(timelineData.entryLevels[i], i);
  }

  for (let groupIndex = 0; groupIndex < timelineData.groups.length; ++groupIndex) {
    const group = timelineData.groups[groupIndex];

    if (includeGroupsSet && !includeGroupsSet.has(group.name)) {
      continue;
    }

    const maxLevel =
        (groupIndex + 1 < timelineData.groups.length ? timelineData.groups[groupIndex + 1].startLevel : stackDepth);
    TestRunner.addResult(`Group: ${group.name}`);

    for (let level = group.startLevel; level < maxLevel; ++level) {
      TestRunner.addResult(`Level ${level - group.startLevel}`);
      const entries = entriesByLevel.get(level);

      for (const index of entries) {
        const title = provider.entryTitle(index);
        const color = provider.entryColor(index);
        TestRunner.addResult(`${title} (${color})`);
      }
    }
  }
};

PerformanceTestRunner.dumpTimelineFlameChart = function(includeGroups) {
  const provider = UI.panels.timeline._flameChart._mainDataProvider;
  TestRunner.addResult('Timeline Flame Chart');
  PerformanceTestRunner.dumpFlameChartProvider(provider, includeGroups);
};

PerformanceTestRunner.loadTimeline = function(timelineData) {
  const promise = new Promise(fulfill => PerformanceTestRunner.runWhenTimelineIsReady(fulfill));

  UI.panels.timeline._loadFromFile(new Blob([timelineData], {type: 'text/plain'}));

  return promise;
};

TestRunner.deprecatedInitAsync(`
  function wrapCallFunctionForTimeline(f) {
    let script = document.createElement('script');
    script.textContent = '(' + f.toString() + ')()\\n//# sourceURL=wrapCallFunctionForTimeline.js';
    document.body.appendChild(script);
  }

  function generateFrames(count) {
    let promise = Promise.resolve();

    for (let i = count; i > 0; --i)
      promise = promise.then(changeBackgroundAndWaitForFrame.bind(null, i));

    return promise;

    function changeBackgroundAndWaitForFrame(i) {
      document.body.style.backgroundColor = (i & 1 ? 'rgb(200, 200, 200)' : 'rgb(240, 240, 240)');
      return waitForFrame();
    }
  }

  function waitForFrame() {
    let callback;
    let promise = new Promise(fulfill => callback = fulfill);

    if (window.testRunner)
      testRunner.updateAllLifecyclePhasesAndCompositeThen(callback);
    else
      window.requestAnimationFrame(callback);

    return promise;
  }
`);
