// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.SourcesTestRunner = self.SourcesTestRunner || {};

/**
 * @param {!Sources.NavigatorView} navigatorView
 * @param {boolean=} dumpIcons
 */
SourcesTestRunner.dumpNavigatorView = function(navigatorView, dumpIcons) {
  dumpNavigatorTreeOutline(navigatorView._scriptsTree);

  /**
   * @param {string} prefix
   * @param {!UI.TreeElement} treeElement
   */
  function dumpNavigatorTreeElement(prefix, treeElement) {
    let titleText = '';
    if (treeElement._leadingIconsElement && dumpIcons) {
      let icons = treeElement._leadingIconsElement.querySelectorAll('[is=ui-icon]');
      icons = Array.prototype.slice.call(icons);
      const iconTypes = icons.map(icon => icon._iconType);
      if (iconTypes.length) {
        titleText = titleText + '[' + iconTypes.join(', ') + '] ';
      }
    }
    titleText += treeElement.title;
    if (treeElement._nodeType === Sources.NavigatorView.Types.FileSystem ||
        treeElement._nodeType === Sources.NavigatorView.Types.FileSystemFolder) {
      const hasMappedFiles = treeElement.listItemElement.classList.contains('has-mapped-files');
      if (!hasMappedFiles) {
        titleText += ' [dimmed]';
      }
    }
    TestRunner.addResult(prefix + titleText);
    treeElement.expand();
    const children = treeElement.children();
    for (let i = 0; i < children.length; ++i) {
      dumpNavigatorTreeElement(prefix + '  ', children[i]);
    }
  }

  /**
   * @param {!UI.TreeOutline} treeOutline
   */
  function dumpNavigatorTreeOutline(treeOutline) {
    const children = treeOutline.rootElement().children();
    for (let i = 0; i < children.length; ++i) {
      dumpNavigatorTreeElement('', children[i]);
    }
  }
};

/**
 * @param {!Sources.NavigatorView} view
 */
SourcesTestRunner.dumpNavigatorViewInAllModes = function(view) {
  ['frame', 'frame/domain', 'frame/domain/folder', 'domain', 'domain/folder'].forEach(
      SourcesTestRunner.dumpNavigatorViewInMode.bind(TestRunner, view));
};

/**
 * @param {!Sources.NavigatorView} view
 * @param {string} mode
 */
SourcesTestRunner.dumpNavigatorViewInMode = function(view, mode) {
  TestRunner.addResult(view instanceof Sources.NetworkNavigatorView ? 'Sources:' : 'Content Scripts:');
  view._groupByFrame = mode.includes('frame');
  view._groupByDomain = mode.includes('domain');
  view._groupByFolder = mode.includes('folder');
  view._resetForTest();
  TestRunner.addResult('-------- Setting mode: [' + mode + ']');
  SourcesTestRunner.dumpNavigatorView(view);
};

/**
 * @param {string} url
 * @param {string} content
 * @param {boolean=} isContentScript
 * @param {number=} worldId
 * @return {!Promise}
 */
SourcesTestRunner.addScriptUISourceCode = function(url, content, isContentScript, worldId) {
  content += '\n//# sourceURL=' + url;
  if (isContentScript) {
    content = `testRunner.evaluateScriptInIsolatedWorld(${worldId}, \`${content}\`)`;
  }
  TestRunner.evaluateInPageAnonymously(content);
  return TestRunner.waitForUISourceCode(url);
};

function testSourceMapping(text1, text2, mapping, testToken) {
  const originalPosition = text1.indexOf(testToken);
  TestRunner.assertTrue(originalPosition !== -1);

  const text1LineEndings = TestRunner.findLineEndingIndexes(text1);
  const text2LineEndings = TestRunner.findLineEndingIndexes(text2);

  const originalLocation = Formatter.Formatter.positionToLocation(text1LineEndings, originalPosition);
  const formattedLocation = mapping.originalToFormatted(originalLocation[0], originalLocation[1]);
  const formattedPosition =
      Formatter.Formatter.locationToPosition(text2LineEndings, formattedLocation[0], formattedLocation[1]);
  const expectedFormattedPosition = text2.indexOf(testToken);

  if (expectedFormattedPosition === formattedPosition) {
    TestRunner.addResult(String.sprintf('Correct mapping for <%s>', testToken));
  } else {
    TestRunner.addResult(String.sprintf('ERROR: Wrong mapping for <%s>', testToken));
  }
}

SourcesTestRunner.testPrettyPrint = function(mimeType, text, mappingQueries, next) {
  new Formatter.ScriptFormatter(mimeType, text, didFormatContent);

  function didFormatContent(formattedSource, mapping) {
    TestRunner.addResult('====== 8< ------');
    TestRunner.addResult(formattedSource);
    TestRunner.addResult('------ >8 ======');

    while (mappingQueries && mappingQueries.length) {
      testSourceMapping(text, formattedSource, mapping, mappingQueries.shift());
    }

    next();
  }
};

SourcesTestRunner.dumpSwatchPositions = function(sourceFrame, bookmarkType) {
  const textEditor = sourceFrame.textEditor;
  const markers = textEditor.bookmarks(textEditor.fullRange(), bookmarkType);

  for (let i = 0; i < markers.length; i++) {
    const position = markers[i].position();
    const swatch = markers[i]._marker.widgetNode.firstChild;
    let text = swatch.textContent;
    if (swatch.localName === 'devtools-color-swatch') {
      text = swatch.color.asString(swatch.format);
    }
    TestRunner.addResult('Line ' + position.startLine + ', Column ' + position.startColumn + ': ' + text);
  }
};
