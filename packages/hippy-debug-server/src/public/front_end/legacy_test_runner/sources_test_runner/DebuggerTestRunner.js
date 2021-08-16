// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.SourcesTestRunner = self.SourcesTestRunner || {};

SourcesTestRunner.startDebuggerTest = function(callback, quiet) {
  console.assert(TestRunner.debuggerModel.debuggerEnabled(), 'Debugger has to be enabled');

  if (quiet !== undefined) {
    SourcesTestRunner._quiet = quiet;
  }

  self.UI.viewManager.showView('sources');
  TestRunner.addSniffer(SDK.DebuggerModel.prototype, '_pausedScript', SourcesTestRunner._pausedScript, true);
  TestRunner.addSniffer(SDK.DebuggerModel.prototype, '_resumedScript', SourcesTestRunner._resumedScript, true);
  TestRunner.safeWrap(callback)();
};

SourcesTestRunner.startDebuggerTestPromise = function(quiet) {
  let cb;
  const p = new Promise(fullfill => {
    cb = fullfill;
  });
  SourcesTestRunner.startDebuggerTest(cb, quiet);
  return p;
};

SourcesTestRunner.completeDebuggerTest = function() {
  self.Common.settings.moduleSetting('breakpointsActive').set(true);
  SourcesTestRunner.resumeExecution(async () => {
    await TestRunner.debuggerModel.suspendModel();
    TestRunner.completeTest();
  });
};

window.addEventListener('unhandledrejection', e => {
  TestRunner.addResult('FAIL: Uncaught exception in promise: ' + e + ' ' + e.stack);
  SourcesTestRunner.completeDebuggerTest();
});

SourcesTestRunner.runDebuggerTestSuite = function(testSuite) {
  const testSuiteTests = testSuite.slice();

  function runner() {
    if (!testSuiteTests.length) {
      SourcesTestRunner.completeDebuggerTest();
      return;
    }

    const nextTest = testSuiteTests.shift();
    TestRunner.addResult('');
    TestRunner.addResult(
        'Running: ' +
        /function\s([^(]*)/.exec(nextTest)[1]);
    TestRunner.safeWrap(nextTest)(runner, runner);
  }

  SourcesTestRunner.startDebuggerTest(runner);
};

SourcesTestRunner.runTestFunction = function() {
  TestRunner.evaluateInPageAnonymously('scheduleTestFunction()');
  TestRunner.addResult('Set timer for test function.');
};

SourcesTestRunner.runTestFunctionAndWaitUntilPaused = function(callback) {
  SourcesTestRunner.runTestFunction();
  SourcesTestRunner.waitUntilPaused(callback);
};

SourcesTestRunner.runTestFunctionAndWaitUntilPausedPromise = function() {
  return new Promise(SourcesTestRunner.runTestFunctionAndWaitUntilPaused);
};

SourcesTestRunner.runAsyncCallStacksTest = function(totalDebuggerStatements, maxAsyncCallStackDepth) {
  const defaultMaxAsyncCallStackDepth = 32;
  SourcesTestRunner.setQuiet(true);
  SourcesTestRunner.startDebuggerTest(step1);

  async function step1() {
    await TestRunner.DebuggerAgent.setAsyncCallStackDepth(maxAsyncCallStackDepth || defaultMaxAsyncCallStackDepth);
    SourcesTestRunner.runTestFunctionAndWaitUntilPaused(didPause);
  }

  let step = 0;
  const callStacksOutput = [];

  async function didPause(callFrames, reason, breakpointIds, asyncStackTrace) {
    ++step;
    callStacksOutput.push(await SourcesTestRunner.captureStackTraceIntoString(callFrames, asyncStackTrace) + '\n');

    if (step < totalDebuggerStatements) {
      SourcesTestRunner.resumeExecution(SourcesTestRunner.waitUntilPaused.bind(SourcesTestRunner, didPause));
    } else {
      TestRunner.addResult('Captured call stacks in no particular order:');
      callStacksOutput.sort();
      TestRunner.addResults(callStacksOutput);
      SourcesTestRunner.completeDebuggerTest();
    }
  }
};

SourcesTestRunner.dumpSourceFrameMessages = function(sourceFrame, dumpFullURL) {
  const messages = [];

  for (const bucket of sourceFrame._rowMessageBuckets.values()) {
    for (const rowMessage of bucket._messages) {
      const message = rowMessage.getMessage();
      messages.push(String.sprintf(
          '  %d:%d [%s] %s', message.lineNumber(), message.columnNumber(), message.level(), message.text()));
    }
  }

  const name = (dumpFullURL ? sourceFrame.uiSourceCode().url() : sourceFrame.uiSourceCode().displayName());
  TestRunner.addResult('SourceFrame ' + name + ': ' + messages.length + ' message(s)');
  TestRunner.addResult(messages.join('\n'));
};

SourcesTestRunner.waitUntilPausedNextTime = function(callback) {
  SourcesTestRunner._waitUntilPausedCallback = TestRunner.safeWrap(callback);
};

SourcesTestRunner.waitUntilPaused = function(callback) {
  callback = TestRunner.safeWrap(callback);

  if (SourcesTestRunner._pausedScriptArguments) {
    callback.apply(callback, SourcesTestRunner._pausedScriptArguments);
  } else {
    SourcesTestRunner._waitUntilPausedCallback = callback;
  }
};

SourcesTestRunner.waitUntilPausedPromise = function() {
  return new Promise(resolve => SourcesTestRunner.waitUntilPaused(resolve));
};

SourcesTestRunner.waitUntilResumedNextTime = function(callback) {
  SourcesTestRunner._waitUntilResumedCallback = TestRunner.safeWrap(callback);
};

SourcesTestRunner.waitUntilResumed = function(callback) {
  callback = TestRunner.safeWrap(callback);

  if (!SourcesTestRunner._pausedScriptArguments) {
    callback();
  } else {
    SourcesTestRunner._waitUntilResumedCallback = callback;
  }
};

SourcesTestRunner.waitUntilResumedPromise = function() {
  return new Promise(resolve => SourcesTestRunner.waitUntilResumed(resolve));
};

SourcesTestRunner.resumeExecution = function(callback) {
  if (UI.panels.sources.paused()) {
    UI.panels.sources._togglePause();
  }

  SourcesTestRunner.waitUntilResumed(callback);
};

SourcesTestRunner.waitUntilPausedAndDumpStackAndResume = function(callback, options) {
  SourcesTestRunner.waitUntilPaused(paused);
  TestRunner.addSniffer(Sources.SourcesPanel.prototype, '_updateDebuggerButtonsAndStatusForTest', setStatus);
  let caption;
  let callFrames;
  let asyncStackTrace;

  function setStatus() {
    const statusElement = this.element.querySelector('.paused-message');
    caption = statusElement.deepTextContent();

    if (callFrames) {
      step1();
    }
  }

  async function paused(frames, reason, breakpointIds, async) {
    callFrames = frames;
    asyncStackTrace = async;

    if (typeof caption === 'string') {
      await step1();
    }
  }

  async function step1() {
    await SourcesTestRunner.captureStackTrace(callFrames, asyncStackTrace, options);
    TestRunner.addResult(TestRunner.clearSpecificInfoFromStackFrames(caption));
    TestRunner.deprecatedRunAfterPendingDispatches(step2);
  }

  function step2() {
    SourcesTestRunner.resumeExecution(TestRunner.safeWrap(callback));
  }
};

SourcesTestRunner.stepOver = function() {
  Promise.resolve().then(function() {
    UI.panels.sources._stepOver();
  });
};

SourcesTestRunner.stepInto = function() {
  Promise.resolve().then(function() {
    UI.panels.sources._stepInto();
  });
};

SourcesTestRunner.stepIntoAsync = function() {
  Promise.resolve().then(function() {
    UI.panels.sources._stepIntoAsync();
  });
};

SourcesTestRunner.stepOut = function() {
  Promise.resolve().then(function() {
    UI.panels.sources._stepOut();
  });
};

SourcesTestRunner.togglePause = function() {
  Promise.resolve().then(function() {
    UI.panels.sources._togglePause();
  });
};

SourcesTestRunner.waitUntilPausedAndPerformSteppingActions = function(actions, callback) {
  callback = TestRunner.safeWrap(callback);
  SourcesTestRunner.waitUntilPaused(didPause);

  async function didPause(callFrames, reason, breakpointIds, asyncStackTrace) {
    let action = actions.shift();

    if (action === 'Print') {
      await SourcesTestRunner.captureStackTrace(callFrames, asyncStackTrace);
      TestRunner.addResult('');

      while (action === 'Print') {
        action = actions.shift();
      }
    }

    if (!action) {
      callback();
      return;
    }

    TestRunner.addResult('Executing ' + action + '...');

    switch (action) {
      case 'StepInto':
        SourcesTestRunner.stepInto();
        break;
      case 'StepOver':
        SourcesTestRunner.stepOver();
        break;
      case 'StepOut':
        SourcesTestRunner.stepOut();
        break;
      case 'Resume':
        SourcesTestRunner.togglePause();
        break;
      default:
        TestRunner.addResult('FAIL: Unknown action: ' + action);
        callback();
        return;
    }

    SourcesTestRunner.waitUntilResumed(
        (actions.length ? SourcesTestRunner.waitUntilPaused.bind(SourcesTestRunner, didPause) : callback));
  }
};

SourcesTestRunner.captureStackTrace = async function(callFrames, asyncStackTrace, options) {
  TestRunner.addResult(await SourcesTestRunner.captureStackTraceIntoString(callFrames, asyncStackTrace, options));
};

SourcesTestRunner.captureStackTraceIntoString = async function(callFrames, asyncStackTrace, options) {
  const results = [];
  options = options || {};

  async function printCallFrames(callFrames, locationFunction, returnValueFunction) {
    let printed = 0;

    for (let i = 0; i < callFrames.length; i++) {
      const frame = callFrames[i];
      const location = locationFunction.call(frame);
      const script = location.script();
      const uiLocation = await self.Bindings.debuggerWorkspaceBinding.rawLocationToUILocation(location);
      const isFramework =
          uiLocation ? self.Bindings.ignoreListManager.isIgnoreListedUISourceCode(uiLocation.uiSourceCode) : false;

      if (options.dropFrameworkCallFrames && isFramework) {
        continue;
      }

      let url;
      let lineNumber;

      if (uiLocation && uiLocation.uiSourceCode.project().type() !== Workspace.projectTypes.Debugger) {
        url = uiLocation.uiSourceCode.name();
        lineNumber = uiLocation.lineNumber + 1;
      } else {
        url = Bindings.displayNameForURL(script.sourceURL);
        lineNumber = location.lineNumber + 1;
      }

      let s = ((isFramework ? '  * ' : '    ')) + printed++ + ') ' + frame.functionName + ' (' + url +
          ((options.dropLineNumbers ? '' : ':' + lineNumber)) + ')';
      s = s.replace(/scheduleTestFunction.+$/, 'scheduleTestFunction <omitted>');
      results.push(s);

      if (options.printReturnValue && returnValueFunction && returnValueFunction.call(frame)) {
        results.push('       <return>: ' + returnValueFunction.call(frame).description);
      }

      if (frame.functionName === 'scheduleTestFunction') {
        const remainingFrames = callFrames.length - 1 - i;

        if (remainingFrames) {
          results.push('    <... skipped remaining frames ...>');
        }

        break;
      }
    }

    return printed;
  }

  function runtimeCallFramePosition() {
    return new SDK.DebuggerModel.Location(TestRunner.debuggerModel, this.scriptId, this.lineNumber, this.columnNumber);
  }

  results.push('Call stack:');
  await printCallFrames(
      callFrames, SDK.DebuggerModel.CallFrame.prototype.location, SDK.DebuggerModel.CallFrame.prototype.returnValue);

  while (asyncStackTrace) {
    results.push('    [' + (asyncStackTrace.description || 'Async Call') + ']');
    const printed = await printCallFrames(asyncStackTrace.callFrames, runtimeCallFramePosition);

    if (!printed) {
      results.pop();
    }

    asyncStackTrace = asyncStackTrace.parent;
  }

  return results.join('\n');
};

SourcesTestRunner.dumpSourceFrameContents = function(sourceFrame) {
  TestRunner.addResult('==Source frame contents start==');
  const textEditor = sourceFrame._textEditor;

  for (let i = 0; i < textEditor.linesCount; ++i) {
    TestRunner.addResult(textEditor.line(i));
  }

  TestRunner.addResult('==Source frame contents end==');
};

SourcesTestRunner._pausedScript = function(callFrames, reason, auxData, breakpointIds, asyncStackTrace) {
  if (!SourcesTestRunner._quiet) {
    TestRunner.addResult('Script execution paused.');
  }

  const debuggerModel = this.target().model(SDK.DebuggerModel);
  SourcesTestRunner._pausedScriptArguments = [
    SDK.DebuggerModel.CallFrame.fromPayloadArray(debuggerModel, callFrames), reason, breakpointIds, asyncStackTrace,
    auxData
  ];

  if (SourcesTestRunner._waitUntilPausedCallback) {
    const callback = SourcesTestRunner._waitUntilPausedCallback;
    delete SourcesTestRunner._waitUntilPausedCallback;
    setTimeout(() => callback.apply(callback, SourcesTestRunner._pausedScriptArguments));
  }
};

SourcesTestRunner._resumedScript = function() {
  if (!SourcesTestRunner._quiet) {
    TestRunner.addResult('Script execution resumed.');
  }

  delete SourcesTestRunner._pausedScriptArguments;

  if (SourcesTestRunner._waitUntilResumedCallback) {
    const callback = SourcesTestRunner._waitUntilResumedCallback;
    delete SourcesTestRunner._waitUntilResumedCallback;
    callback();
  }
};

SourcesTestRunner.showUISourceCode = function(uiSourceCode, callback) {
  const panel = UI.panels.sources;
  panel.showUISourceCode(uiSourceCode);
  const sourceFrame = panel.visibleView;

  if (sourceFrame.loaded) {
    callback(sourceFrame);
  } else {
    TestRunner.addSniffer(sourceFrame, 'setContent', callback && callback.bind(null, sourceFrame));
  }
};

SourcesTestRunner.showUISourceCodePromise = function(uiSourceCode) {
  let fulfill;
  const promise = new Promise(x => {
    fulfill = x;
  });
  SourcesTestRunner.showUISourceCode(uiSourceCode, fulfill);
  return promise;
};

SourcesTestRunner.showScriptSource = function(scriptName, callback) {
  SourcesTestRunner.waitForScriptSource(scriptName, onScriptSource);

  function onScriptSource(uiSourceCode) {
    SourcesTestRunner.showUISourceCode(uiSourceCode, callback);
  }
};

SourcesTestRunner.showScriptSourcePromise = function(scriptName) {
  return new Promise(resolve => SourcesTestRunner.showScriptSource(scriptName, resolve));
};

SourcesTestRunner.waitForScriptSource = function(scriptName, callback) {
  const panel = UI.panels.sources;
  const uiSourceCodes = panel._workspace.uiSourceCodes();

  for (let i = 0; i < uiSourceCodes.length; ++i) {
    if (uiSourceCodes[i].project().type() === Workspace.projectTypes.Service) {
      continue;
    }

    if (uiSourceCodes[i].name() === scriptName) {
      callback(uiSourceCodes[i]);
      return;
    }
  }

  TestRunner.addSniffer(
      Sources.SourcesView.prototype, '_addUISourceCode',
      SourcesTestRunner.waitForScriptSource.bind(SourcesTestRunner, scriptName, callback));
};

SourcesTestRunner.objectForPopover = function(sourceFrame, lineNumber, columnNumber) {
  const debuggerPlugin = SourcesTestRunner.debuggerPlugin(sourceFrame);
  const {x, y} = debuggerPlugin._textEditor.cursorPositionToCoordinates(lineNumber, columnNumber);
  const promise = TestRunner.addSnifferPromise(ObjectUI.ObjectPopoverHelper, 'buildObjectPopover');
  debuggerPlugin._getPopoverRequest({x, y}).show(new UI.GlassPane());
  return promise;
};

SourcesTestRunner.setBreakpoint = async function(sourceFrame, lineNumber, condition, enabled) {
  const debuggerPlugin = SourcesTestRunner.debuggerPlugin(sourceFrame);
  if (!debuggerPlugin._muted) {
    await debuggerPlugin._setBreakpoint(lineNumber, 0, condition, enabled);
  }
};

SourcesTestRunner.removeBreakpoint = function(sourceFrame, lineNumber) {
  const debuggerPlugin = SourcesTestRunner.debuggerPlugin(sourceFrame);
  const breakpointLocations = debuggerPlugin._breakpointManager.allBreakpointLocations();
  const breakpointLocation = breakpointLocations.find(
      breakpointLocation => breakpointLocation.uiLocation.uiSourceCode === sourceFrame._uiSourceCode &&
          breakpointLocation.uiLocation.lineNumber === lineNumber);
  breakpointLocation.breakpoint.remove();
};

SourcesTestRunner.createNewBreakpoint = async function(sourceFrame, lineNumber, condition, enabled) {
  const debuggerPlugin = SourcesTestRunner.debuggerPlugin(sourceFrame);
  const promise =
      new Promise(resolve => TestRunner.addSniffer(debuggerPlugin.__proto__, '_breakpointWasSetForTest', resolve));
  await debuggerPlugin._createNewBreakpoint(lineNumber, condition, enabled);
  return promise;
};

SourcesTestRunner.toggleBreakpoint = async function(sourceFrame, lineNumber, disableOnly) {
  const debuggerPlugin = SourcesTestRunner.debuggerPlugin(sourceFrame);
  if (!debuggerPlugin._muted) {
    await debuggerPlugin._toggleBreakpoint(lineNumber, disableOnly);
  }
};

SourcesTestRunner.waitBreakpointSidebarPane = function(waitUntilResolved) {
  return new Promise(
             resolve => TestRunner.addSniffer(
                 Sources.JavaScriptBreakpointsSidebarPane.prototype, '_didUpdateForTest', resolve))
      .then(checkIfReady);

  function checkIfReady() {
    if (!waitUntilResolved) {
      return;
    }

    for (const {breakpoint} of self.Bindings.breakpointManager.allBreakpointLocations()) {
      if (breakpoint._uiLocations.size === 0 && breakpoint.enabled()) {
        return SourcesTestRunner.waitBreakpointSidebarPane();
      }
    }
  }
};

SourcesTestRunner.breakpointsSidebarPaneContent = function() {
  const pane = Sources.JavaScriptBreakpointsSidebarPane.instance();
  const empty = pane._emptyElement;

  if (!empty.classList.contains('hidden')) {
    return TestRunner.textContentWithLineBreaks(empty);
  }

  const entries = Array.from(pane.contentElement.querySelectorAll('.breakpoint-entry'));
  return entries.map(TestRunner.textContentWithLineBreaks).join('\n');
};

SourcesTestRunner.dumpBreakpointSidebarPane = function(title) {
  TestRunner.addResult('Breakpoint sidebar pane ' + (title || ''));
  TestRunner.addResult(SourcesTestRunner.breakpointsSidebarPaneContent());
};

SourcesTestRunner.dumpScopeVariablesSidebarPane = function() {
  TestRunner.addResult('Scope variables sidebar pane:');
  const sections = SourcesTestRunner.scopeChainSections();

  SourcesTestRunner.dumpSectionsWithIndent(sections, 0);
};

SourcesTestRunner.dumpSectionsWithIndent = function(treeElements, depth) {
  if (!treeElements || treeElements.length === 0) {
    return;
  }

  for (const treeElement of treeElements) {
    const textContent = TestRunner.textContentWithLineBreaks(treeElement.listItemElement);
    const text = TestRunner.clearSpecificInfoFromStackFrames(textContent);
    if (text.length > 0) {
      TestRunner.addResult('    '.repeat(depth) + text);
    }
    if (!treeElement.expanded && depth === 0) {
      TestRunner.addResult('    <section collapsed>');
    }
    SourcesTestRunner.dumpSectionsWithIndent(treeElement.children(), depth + 1);
  }
};

SourcesTestRunner.scopeChainSections = function() {
  return Sources.ScopeChainSidebarPane.instance()._treeOutline.rootElement().children();
};

SourcesTestRunner.expandScopeVariablesSidebarPane = function(callback) {
  const sections = SourcesTestRunner.scopeChainSections();

  for (let i = 0; i < sections.length - 1; ++i) {
    sections[i].expand();
  }

  setTimeout(() => {
    TestRunner.deprecatedRunAfterPendingDispatches(callback);
  }, 1000);
};

SourcesTestRunner.expandProperties = function(properties, callback) {
  let index = 0;

  function expandNextPath() {
    if (index === properties.length) {
      TestRunner.safeWrap(callback)();
      return;
    }

    const parentTreeElement = properties[index++];
    const path = properties[index++];
    SourcesTestRunner._expandProperty(parentTreeElement, path, 0, expandNextPath);
  }

  TestRunner.deprecatedRunAfterPendingDispatches(expandNextPath);
};

SourcesTestRunner._expandProperty = function(parentTreeElement, path, pathIndex, callback) {
  if (pathIndex === path.length) {
    TestRunner.addResult('Expanded property: ' + path.join('.'));
    callback();
    return;
  }

  const name = path[pathIndex++];
  const propertyTreeElement = SourcesTestRunner._findChildPropertyTreeElement(parentTreeElement, name);

  if (!propertyTreeElement) {
    TestRunner.addResult('Failed to expand property: ' + path.slice(0, pathIndex).join('.'));
    SourcesTestRunner.completeDebuggerTest();
    return;
  }

  propertyTreeElement.expand();
  TestRunner.deprecatedRunAfterPendingDispatches(
      SourcesTestRunner._expandProperty.bind(SourcesTestRunner, propertyTreeElement, path, pathIndex, callback));
};

SourcesTestRunner._findChildPropertyTreeElement = function(parent, childName) {
  const children = parent.children();

  for (let i = 0; i < children.length; i++) {
    const treeElement = children[i];
    const property = treeElement.property;

    if (property.name === childName) {
      return treeElement;
    }
  }
};

SourcesTestRunner.setQuiet = function(quiet) {
  SourcesTestRunner._quiet = quiet;
};

SourcesTestRunner.queryScripts = function(filter) {
  const scripts = TestRunner.debuggerModel.scripts();
  return (filter ? scripts.filter(filter) : scripts);
};

SourcesTestRunner.createScriptMock = function(
    url, startLine, startColumn, isContentScript, source, target, preRegisterCallback) {
  target = target || self.SDK.targetManager.mainTarget();
  const debuggerModel = target.model(SDK.DebuggerModel);
  const scriptId = String(++SourcesTestRunner._lastScriptId);
  const sourceLineEndings = TestRunner.findLineEndingIndexes(source);
  const lineCount = sourceLineEndings.length;
  const endLine = startLine + lineCount - 1;
  const endColumn = (lineCount === 1 ? startColumn + source.length : source.length - sourceLineEndings[lineCount - 2]);
  const hasSourceURL = Boolean(source.match(/\/\/#\ssourceURL=\s*(\S*?)\s*$/m)) ||
      Boolean(source.match(/\/\/@\ssourceURL=\s*(\S*?)\s*$/m));

  const script = new SDK.Script(
      debuggerModel, scriptId, url, startLine, startColumn, endLine, endColumn, 0, '', isContentScript, false,
      undefined, hasSourceURL, source.length);

  script.requestContent = function() {
    const trimmedSource = SDK.Script._trimSourceURLComment(source);
    return Promise.resolve({content: trimmedSource, isEncoded: false});
  };

  if (preRegisterCallback) {
    preRegisterCallback(script);
  }

  debuggerModel._registerScript(script);
  return script;
};

SourcesTestRunner._lastScriptId = 0;

SourcesTestRunner.checkRawLocation = function(script, lineNumber, columnNumber, location) {
  TestRunner.assertEquals(script.scriptId, location.scriptId, 'Incorrect scriptId');
  TestRunner.assertEquals(lineNumber, location.lineNumber, 'Incorrect lineNumber');
  TestRunner.assertEquals(columnNumber, location.columnNumber, 'Incorrect columnNumber');
};

SourcesTestRunner.checkUILocation = function(uiSourceCode, lineNumber, columnNumber, location) {
  TestRunner.assertEquals(
      uiSourceCode, location.uiSourceCode,
      'Incorrect uiSourceCode, expected \'' + ((uiSourceCode ? uiSourceCode.url() : null)) + '\',' +
          ' but got \'' + ((location.uiSourceCode ? location.uiSourceCode.url() : null)) + '\'');

  TestRunner.assertEquals(
      lineNumber, location.lineNumber,
      'Incorrect lineNumber, expected \'' + lineNumber + '\', but got \'' + location.lineNumber + '\'');

  TestRunner.assertEquals(
      columnNumber, location.columnNumber,
      'Incorrect columnNumber, expected \'' + columnNumber + '\', but got \'' + location.columnNumber + '\'');
};

SourcesTestRunner.scriptFormatter = function() {
  return Promise.resolve(Sources.ScriptFormatterEditorAction.instance());
};

SourcesTestRunner.waitForExecutionContextInTarget = function(target, callback) {
  const runtimeModel = target.model(SDK.RuntimeModel);

  if (runtimeModel.executionContexts().length) {
    callback(runtimeModel.executionContexts()[0]);
    return;
  }

  runtimeModel.addEventListener(SDK.RuntimeModel.Events.ExecutionContextCreated, contextCreated);

  function contextCreated() {
    runtimeModel.removeEventListener(SDK.RuntimeModel.Events.ExecutionContextCreated, contextCreated);
    callback(runtimeModel.executionContexts()[0]);
  }
};

SourcesTestRunner.selectThread = function(target) {
  self.UI.context.setFlavor(SDK.Target, target);
};

SourcesTestRunner.evaluateOnCurrentCallFrame = function(code) {
  return TestRunner.debuggerModel.evaluateOnSelectedCallFrame({expression: code, objectGroup: 'console'});
};

SourcesTestRunner.waitDebuggerPluginDecorations = function(sourceFrame) {
  return TestRunner.addSnifferPromise(Sources.DebuggerPlugin.prototype, '_breakpointDecorationsUpdatedForTest');
};

SourcesTestRunner.waitDebuggerPluginBreakpoints = function(sourceFrame) {
  return SourcesTestRunner.waitDebuggerPluginDecorations().then(checkIfReady);

  function checkIfReady() {
    for (const {breakpoint} of self.Bindings.breakpointManager.allBreakpointLocations()) {
      if (breakpoint._uiLocations.size === 0 && breakpoint.enabled()) {
        return SourcesTestRunner.waitDebuggerPluginDecorations().then(checkIfReady);
      }
    }

    return Promise.resolve();
  }
};

/**
 * Useful for tests that want to run some breakpoint action like setting, toggling, adding a condition, etc.
 * and dumping the set breakpoint decorations afterwards.
 * See {SourcesTestRunner.waitForExactBreakpointDecorations} for the format of the {expectedDecorations} paramter.
 */
SourcesTestRunner.runActionAndWaitForExactBreakpointDecorations =
    async function(sourceFrame, expectedDecorations, action, skipFirstWait = false) {
  const waitPromise =
      SourcesTestRunner.waitForExactBreakpointDecorations(sourceFrame, expectedDecorations, skipFirstWait);
  await action();
  await waitPromise;
  SourcesTestRunner.dumpDebuggerPluginBreakpoints(sourceFrame);
};

/**
 * Waits for breakpoint decoration updates until specific decorations are met.
 *
 * @param expectedDecorations An array of key/value pairs where the key is a line number
 *    and the value is the number of decorations in the given line, e.g.:
 *
 *      expectedDecorations = [[5, 1], [10, 2]]
 *
 *    waits until line 5 has one breakpoint decoration and line 10 has two decorations.
 * @param skipFirstWait Check decorations immediately without waiting for the
 *                      "decorations updated" event.
 */
SourcesTestRunner.waitForExactBreakpointDecorations = function(
    sourceFrame, expectedDecorations, skipFirstWait = false) {
  if (skipFirstWait) {
    return checkIfDecorationsReady();
  }
  return SourcesTestRunner.waitDebuggerPluginDecorations().then(checkIfDecorationsReady);

  function checkIfDecorationsReady() {
    const currentDecorations = collectCurrentDecorationsFromDebuggerPlugin();
    const expectedDecorationsMap = new Map(expectedDecorations);
    if (decorationsAreEqual(currentDecorations, expectedDecorationsMap)) {
      return Promise.resolve();
    }
    return SourcesTestRunner.waitForExactBreakpointDecorations(sourceFrame, expectedDecorations);
  }

  function collectCurrentDecorationsFromDebuggerPlugin() {
    const currentDecorationCountPerLine = new Map();
    for (const decoration of SourcesTestRunner.debuggerPlugin(sourceFrame)._breakpointDecorations.values()) {
      const lineNumber = (decoration.handle.resolve() || {}).lineNumber;
      if (lineNumber) {
        const count = currentDecorationCountPerLine.get(lineNumber) || 0;
        currentDecorationCountPerLine.set(lineNumber, count + 1);
      }
    }
    return currentDecorationCountPerLine;
  }

  function decorationsAreEqual(map1, map2) {
    if (map1.size !== map2.size) {
      return false;
    }
    for (const [line1, count1] of map1) {
      if (map2.get(line1) !== count1) {
        return false;
      }
    }
    return true;
  }
};

SourcesTestRunner.dumpDebuggerPluginBreakpoints = function(sourceFrame) {
  const textEditor = sourceFrame._textEditor;

  for (let lineNumber = 0; lineNumber < textEditor.linesCount; ++lineNumber) {
    if (!textEditor.hasLineClass(lineNumber, 'cm-breakpoint')) {
      continue;
    }

    const disabled = textEditor.hasLineClass(lineNumber, 'cm-breakpoint-disabled');
    const conditional = textEditor.hasLineClass(lineNumber, 'cm-breakpoint-conditional');
    TestRunner.addResult(
        'breakpoint at ' + lineNumber + ((disabled ? ' disabled' : '')) + ((conditional ? ' conditional' : '')));
    const range = new TextUtils.TextRange(lineNumber, 0, lineNumber, textEditor.line(lineNumber).length);
    let bookmarks = textEditor.bookmarks(range, Sources.DebuggerPlugin.BreakpointDecoration.bookmarkSymbol);
    bookmarks = bookmarks.filter(bookmark => Boolean(bookmark.position()));
    bookmarks.sort((bookmark1, bookmark2) => bookmark1.position().startColumn - bookmark2.position().startColumn);

    for (const bookmark of bookmarks) {
      const position = bookmark.position();
      const element = bookmark[Sources.DebuggerPlugin.BreakpointDecoration._elementSymbolForTest];
      const disabled = element.classList.contains('cm-inline-disabled');
      const conditional = element.classList.contains('cm-inline-conditional');

      TestRunner.addResult(
          '  inline breakpoint at (' + position.startLine + ', ' + position.startColumn + ')' +
          ((disabled ? ' disabled' : '')) + ((conditional ? ' conditional' : '')));
    }
  }
};

SourcesTestRunner.clickDebuggerPluginBreakpoint = function(sourceFrame, lineNumber, index, next) {
  const textEditor = sourceFrame._textEditor;
  const lineLength = textEditor.line(lineNumber).length;
  const lineRange = new TextUtils.TextRange(lineNumber, 0, lineNumber, lineLength);
  const bookmarks = textEditor.bookmarks(lineRange, Sources.DebuggerPlugin.BreakpointDecoration.bookmarkSymbol);
  bookmarks.sort((bookmark1, bookmark2) => bookmark1.position().startColumn - bookmark2.position().startColumn);
  const bookmark = bookmarks[index];

  if (bookmark) {
    bookmark[Sources.DebuggerPlugin.BreakpointDecoration._elementSymbolForTest].click();
  } else {
    TestRunner.addResult(`Could not click on Javascript breakpoint - lineNumber: ${lineNumber}, index: ${index}`);
    next();
  }
};

SourcesTestRunner.debuggerPlugin = function(sourceFrame) {
  return sourceFrame._plugins.find(plugin => plugin instanceof Sources.DebuggerPlugin);
};

SourcesTestRunner.waitUntilDebuggerPluginLoaded = async function(sourceFrame) {
  while (!SourcesTestRunner.debuggerPlugin(sourceFrame)) {
    await TestRunner.addSnifferPromise(sourceFrame, '_ensurePluginsLoaded');
  }
  return SourcesTestRunner.debuggerPlugin(sourceFrame);
};

SourcesTestRunner.setEventListenerBreakpoint = function(id, enabled, targetName) {
  const pane = BrowserDebugger.EventListenerBreakpointsSidebarPane.instance();

  const auxData = {'eventName': id};

  if (targetName) {
    auxData.targetName = targetName;
  }

  const breakpoint = self.SDK.domDebuggerManager.resolveEventListenerBreakpoint(auxData);

  if (breakpoint.enabled() !== enabled) {
    pane._breakpoints.get(breakpoint).checkbox.checked = enabled;
    pane._breakpointCheckboxClicked(breakpoint);
  }
};

TestRunner.deprecatedInitAsync(`
  function scheduleTestFunction() {
    setTimeout(testFunction, 0);
  }
`);
