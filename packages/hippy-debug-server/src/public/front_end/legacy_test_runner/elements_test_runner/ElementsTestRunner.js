// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as EventListeners from '../../panels/event_listeners/event_listeners.js';

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.ElementsTestRunner = self.ElementsTestRunner || {};

/**
 * @param {string} idValue
 * @param {!Function} callback
 */
ElementsTestRunner.selectNodeWithId = function(idValue, callback) {
  callback = TestRunner.safeWrap(callback);
  function onNodeFound(node) {
    ElementsTestRunner.selectNode(node).then(callback.bind(null, node));
  }
  ElementsTestRunner.nodeWithId(idValue, onNodeFound);
};

/**
 * @param {!Object} node
 * @return {!Promise.<undefined>}
 */
ElementsTestRunner.selectNode = function(node) {
  return Common.Revealer.reveal(node);
};

/**
 * @param {string} idValue
 * @param {!Function} callback
 */
ElementsTestRunner.nodeWithId = function(idValue, callback) {
  ElementsTestRunner.findNode(node => node.getAttribute('id') === idValue, callback);
};

/**
 * @param {string} idValue
 * @param {!Function} callback
 */
ElementsTestRunner.nodeWithIdPromise = function(idValue) {
  return new Promise(resolve => ElementsTestRunner.findNode(node => node.getAttribute('id') === idValue, resolve));
};

/**
 * @param {function(!Element): boolean} matchFunction
 * @param {!Function} callback
 */
ElementsTestRunner.findNode = async function(matchFunction, callback) {
  callback = TestRunner.safeWrap(callback);
  let result = null;
  let pendingRequests = 0;
  async function processChildren(node) {
    try {
      if (result) {
        return;
      }

      if (node._childDocumentPromiseForTesting) {
        await node._childDocumentPromiseForTesting;
      }

      const pseudoElementsMap = node.pseudoElements();
      const pseudoElements = pseudoElementsMap ? [...pseudoElementsMap.values()] : [];
      const children = (node.children() || []).concat(node.shadowRoots()).concat(pseudoElements);
      if (node.templateContent()) {
        children.push(node.templateContent());
      } else if (node.contentDocument()) {
        children.push(node.contentDocument());
      }

      for (let i = 0; i < children.length; ++i) {
        const childNode = children[i];
        if (matchFunction(childNode)) {
          result = childNode;
          callback(result);
          return;
        }
        pendingRequests++;
        childNode.getChildNodes(processChildren.bind(null, childNode));
      }
    } finally {
      pendingRequests--;
    }

    if (!result && !pendingRequests) {
      callback(null);
    }
  }

  const doc = TestRunner.domModel.existingDocument() || await TestRunner.domModel.requestDocument();
  pendingRequests++;
  doc.getChildNodes(processChildren.bind(null, doc));
};

/**
 * @param {function(!Element): boolean} matchFunction
 * @param {!Promise}
 */
ElementsTestRunner.findNodePromise = function(matchFunction) {
  return new Promise(resolve => ElementsTestRunner.findNode(matchFunction, resolve));
};


/**
 * @param {!UI.TreeOutline.TreeElement} treeElement
 */
function dumpObjectPropertyTreeElement(treeElement) {
  const expandedSubstring = treeElement.expanded ? '[expanded]' : '[collapsed]';
  TestRunner.addResult(expandedSubstring + ' ' + treeElement.listItemElement.deepTextContent());

  for (const child of treeElement.children()) {
    const property = /** @type {!ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement} */ (child).property;
    const key = property.name;
    const value = /** @type {!SDK.RemoteObject.RemoteObjectImpl} */ (property.value)._description;
    TestRunner.addResult('    ' + key + ': ' + value);
  }
}

/**
 * @param {!EventListeners.EventListenersView.EventListenersView} eventListenersView
 * @param {function():void} callback
 * @param {boolean=} force
 */
ElementsTestRunner.expandAndDumpEventListeners = function(eventListenersView, callback, force) {
  function listenersArrived() {
    const listenerTypes = eventListenersView._treeOutline.rootElement().children();
    for (let i = 0; i < listenerTypes.length; ++i) {
      listenerTypes[i].expand();
      const listenerItems = listenerTypes[i].children();
      for (let j = 0; j < listenerItems.length; ++j) {
        listenerItems[j].expand();
      }
    }
    TestRunner.deprecatedRunAfterPendingDispatches(objectsExpanded);
  }

  function objectsExpanded() {
    const listenerTypes = eventListenersView._treeOutline.rootElement().children();
    for (let i = 0; i < listenerTypes.length; ++i) {
      if (!listenerTypes[i].children().length) {
        continue;
      }
      const eventType = listenerTypes[i]._title;
      TestRunner.addResult('');
      TestRunner.addResult('======== ' + eventType + ' ========');
      const listenerItems = listenerTypes[i].children();
      for (let j = 0; j < listenerItems.length; ++j) {
        TestRunner.addResult('== ' + listenerItems[j].eventListener().origin());
        dumpObjectPropertyTreeElement(listenerItems[j]);
      }
    }
    callback();
  }

  if (force) {
    listenersArrived();
  } else {
    TestRunner.addSniffer(
        EventListeners.EventListenersView.EventListenersView.prototype, '_eventListenersArrivedForTest',
        listenersArrived);
  }
};

/**
 * @param {!EventListeners.EventListenersView.EventListenersView} eventListenersView
 * @param {boolean=} force
 * @return {!Promise}
 */
ElementsTestRunner.expandAndDumpEventListenersPromise = function(eventListenersView, force) {
  return new Promise(resolve => ElementsTestRunner.expandAndDumpEventListeners(eventListenersView, resolve, force));
};

ElementsTestRunner.inlineStyleSection = function() {
  return UI.panels.elements._stylesWidget._sectionBlocks[0].sections[0];
};

ElementsTestRunner.computedStyleWidget = function() {
  return UI.panels.elements._computedStyleWidget;
};

ElementsTestRunner.dumpComputedStyle = async function(doNotAutoExpand, printInnerText) {
  const computed = ElementsTestRunner.computedStyleWidget();
  const treeOutline = computed._propertiesOutline;
  const children = treeOutline.rootElement().children();

  for (const treeElement of children) {
    const property = computed._propertyByTreeElement.get(treeElement);
    if (!property || property.name === 'width' || property.name === 'height') {
      continue;
    }

    const propertyName = text(treeElement.title.querySelector('.webkit-css-property'));
    const propertyValue = text(treeElement.title.querySelector('.value'));
    TestRunner.addResult(`${propertyName}: ${propertyValue};`);

    if (doNotAutoExpand && !treeElement.expanded) {
      continue;
    }

    for (const traceTreeElement of treeElement.children()) {
      const trace = traceTreeElement.title;
      let dumpText = '';

      if (trace.shadowRoot.querySelector('.computed-style-trace.inactive')) {
        dumpText += 'OVERLOADED ';
      }

      dumpText += text(trace.querySelector('.value'));
      dumpText += ' - ';
      dumpText += text(trace.shadowRoot.querySelector('.trace-selector'));
      const link = trace.querySelector('[slot="trace-link"]');

      if (link) {
        dumpText += ' ' + await extractLinkText(link);
      }

      TestRunner.addResult('    ' + dumpText);
    }
  }

  function text(node) {
    return printInnerText ? node.innerText : node.textContent;
  }
};

ElementsTestRunner.findComputedPropertyWithName = function(name) {
  const computed = ElementsTestRunner.computedStyleWidget();
  const treeOutline = computed._propertiesOutline;
  const children = treeOutline.rootElement().children();

  for (const treeElement of children) {
    const property = computed._propertyByTreeElement.get(treeElement);
    if (!property) {
      continue;
    }
    if (property.name === name) {
      return treeElement;
    }
  }

  return null;
};

ElementsTestRunner.firstMatchedStyleSection = function() {
  return UI.panels.elements._stylesWidget._sectionBlocks[0].sections[1];
};

ElementsTestRunner.firstMediaTextElementInSection = function(section) {
  return section.element.querySelector('.media-text');
};

ElementsTestRunner.querySelector = async function(selector, callback) {
  const doc = await TestRunner.domModel.requestDocument();
  const nodeId = await TestRunner.domModel.querySelector(doc.id, selector);
  callback(TestRunner.domModel.nodeForId(nodeId));
};

ElementsTestRunner.shadowRootByHostId = function(idValue, callback) {
  function shadowRootMatches(node) {
    return node.isShadowRoot() && node.parentNode.getAttribute('id') === idValue;
  }

  ElementsTestRunner.findNode(shadowRootMatches, callback);
};

ElementsTestRunner.nodeWithClass = function(classValue, callback) {
  function nodeClassMatches(node) {
    const classAttr = node.getAttribute('class');
    return classAttr && classAttr.indexOf(classValue) > -1;
  }

  ElementsTestRunner.findNode(nodeClassMatches, callback);
};

ElementsTestRunner.expandedNodeWithId = function(idValue) {
  let result;
  ElementsTestRunner.nodeWithId(idValue, node => {
    result = node;
  });
  return result;
};

globalThis.waitForStylesRebuild = function(matchFunction, callback, requireRebuild) {
  (function sniff(node, rebuild) {
    if ((rebuild || !requireRebuild) && node && matchFunction(node)) {
      callback();
      return;
    }

    TestRunner.addSniffer(Elements.StylesSidebarPane.prototype, '_nodeStylesUpdatedForTest', sniff);
  })(null);
};

ElementsTestRunner.waitForStyles = function(idValue, callback, requireRebuild) {
  callback = TestRunner.safeWrap(callback);

  function nodeWithId(node) {
    return node.getAttribute('id') === idValue;
  }

  globalThis.waitForStylesRebuild(nodeWithId, callback, requireRebuild);
};

ElementsTestRunner.waitForStyleCommitted = function(next) {
  TestRunner.addSniffer(Elements.StylePropertyTreeElement.prototype, '_editingCommitted', (...args) => {
    Promise.all(args).then(next);
  });
};

ElementsTestRunner.waitForStylesForClass = function(classValue, callback, requireRebuild) {
  callback = TestRunner.safeWrap(callback);

  function nodeWithClass(node) {
    const classAttr = node.getAttribute('class');
    return classAttr && classAttr.indexOf(classValue) > -1;
  }

  globalThis.waitForStylesRebuild(nodeWithClass, callback, requireRebuild);
};

ElementsTestRunner.waitForSelectorCommitted = function(callback) {
  TestRunner.addSniffer(Elements.StylePropertiesSection.prototype, '_editingSelectorCommittedForTest', callback);
};

ElementsTestRunner.waitForMediaTextCommitted = function(callback) {
  TestRunner.addSniffer(Elements.StylePropertiesSection.prototype, '_editingMediaTextCommittedForTest', callback);
};

ElementsTestRunner.waitForStyleApplied = function(callback) {
  TestRunner.addSniffer(Elements.StylePropertyTreeElement.prototype, 'styleTextAppliedForTest', callback);
};

ElementsTestRunner.waitForStyleAppliedPromise = function() {
  return new Promise(resolve => ElementsTestRunner.waitForStyleApplied(resolve));
};

ElementsTestRunner.selectNodeAndWaitForStyles = function(idValue, callback) {
  callback = TestRunner.safeWrap(callback);
  let targetNode;
  ElementsTestRunner.waitForStyles(idValue, stylesUpdated, true);
  ElementsTestRunner.selectNodeWithId(idValue, nodeSelected);

  function nodeSelected(node) {
    targetNode = node;
  }

  function stylesUpdated() {
    callback(targetNode);
  }
};

ElementsTestRunner.selectNodeAndWaitForStylesPromise = function(idValue) {
  return new Promise(x => ElementsTestRunner.selectNodeAndWaitForStyles(idValue, x));
};

ElementsTestRunner.selectPseudoElementAndWaitForStyles = function(parentId, pseudoType, callback) {
  callback = TestRunner.safeWrap(callback);
  let targetNode;
  globalThis.waitForStylesRebuild(isPseudoElement, stylesUpdated, true);
  ElementsTestRunner.findNode(isPseudoElement, nodeFound);

  function nodeFound(node) {
    targetNode = node;
    Common.Revealer.reveal(node);
  }

  function stylesUpdated() {
    callback(targetNode);
  }

  function isPseudoElement(node) {
    return node.parentNode && node.parentNode.getAttribute('id') === parentId && node.pseudoType() === pseudoType;
  }
};

ElementsTestRunner.selectNodeAndWaitForStylesWithComputed = function(idValue, callback) {
  callback = TestRunner.safeWrap(callback);
  ElementsTestRunner.selectNodeAndWaitForStyles(idValue, onSidebarRendered);

  async function onSidebarRendered(node) {
    await ElementsTestRunner.computedStyleWidget().doUpdate().then(callback.bind(null, node));
  }
};

ElementsTestRunner.firstElementsTreeOutline = function() {
  return UI.panels.elements._treeOutlines.values().next().value;
};

ElementsTestRunner.filterMatchedStyles = function(text) {
  const regex = (text ? new RegExp(text, 'i') : null);
  TestRunner.addResult('Filtering styles by: ' + text);
  UI.panels.elements._stylesWidget._onFilterChanged(regex);
};

ElementsTestRunner.dumpRenderedMatchedStyles = function() {
  const sectionBlocks = UI.panels.elements._stylesWidget._sectionBlocks;

  for (const block of sectionBlocks) {
    for (const section of block.sections) {
      if (section.element.classList.contains('hidden')) {
        continue;
      }

      dumpRenderedSection(section);
    }
  }

  function dumpRenderedSection(section) {
    TestRunner.addResult(section._selectorElement.textContent + ' {');
    const rootElement = section.propertiesTreeOutline.rootElement();

    for (let i = 0; i < rootElement.childCount(); ++i) {
      dumpRenderedProperty(rootElement.childAt(i));
    }

    TestRunner.addResult('}');
  }

  function dumpRenderedProperty(property) {
    let text = new Array(4).join(' ');
    text += property.nameElement.textContent;
    text += ':';

    if (property.isExpandable()) {
      text += (property.expanded ? 'v' : '>');
    } else {
      text += ' ';
    }

    text += property.valueElement.textContent;

    if (property.listItemElement.classList.contains('filter-match')) {
      text = 'F' + text.substring(1);
    }

    TestRunner.addResult(text);

    if (!property.expanded) {
      return;
    }

    const indent = new Array(8).join(' ');

    for (let i = 0; i < property.childCount(); ++i) {
      const childProperty = property.childAt(i);
      let text = indent;
      text += String.sprintf('%s: %s', childProperty.nameElement.textContent, childProperty.valueElement.textContent);

      if (childProperty.listItemElement.classList.contains('filter-match')) {
        text = 'F' + text.substring(1);
      }

      TestRunner.addResult(text);
    }
  }
};

ElementsTestRunner.dumpSelectedElementStyles =
    async function(excludeComputed, excludeMatched, omitLonghands, includeSelectorGroupMarks, printInnerText) {
  const sectionBlocks = UI.panels.elements._stylesWidget._sectionBlocks;

  if (!excludeComputed) {
    await ElementsTestRunner.dumpComputedStyle(false /* doNotAutoExpand */, printInnerText);
  }

  for (const block of sectionBlocks) {
    for (const section of block.sections) {
      if (section.style().parentRule && excludeMatched) {
        continue;
      }

      if (section.element.previousSibling && section.element.previousSibling.className === 'sidebar-separator') {
        let nodeDescription = '';

        if (section.element.previousSibling.firstElementChild) {
          nodeDescription = text(section.element.previousSibling.firstElementChild.shadowRoot.lastChild);
        }

        TestRunner.addResult('======== ' + text(section.element.previousSibling) + nodeDescription + ' ========');
      }

      await printStyleSection(section, omitLonghands, includeSelectorGroupMarks, printInnerText);
    }
  }

  function text(node) {
    return printInnerText ? node.innerText : node.textContent;
  }
};

async function printStyleSection(section, omitLonghands, includeSelectorGroupMarks, printInnerText) {
  if (!section) {
    return;
  }

  TestRunner.addResult(
      '[expanded] ' + ((section.propertiesTreeOutline.element.classList.contains('no-affect') ? '[no-affect] ' : '')));
  const medias = section._titleElement.querySelectorAll('.media-list .media');

  for (let i = 0; i < medias.length; ++i) {
    const media = medias[i];
    TestRunner.addResult(text(media));
  }

  const selector =
      section._titleElement.querySelector('.selector') || section._titleElement.querySelector('.keyframe-key');
  let selectorText = (includeSelectorGroupMarks ? buildMarkedSelectors(selector) : text(selector));
  selectorText += text(selector.nextSibling);
  const anchor = section._titleElement.querySelector('.styles-section-subtitle');

  if (anchor) {
    const anchorText = await extractLinkText(anchor);
    selectorText += String.sprintf(' (%s)', anchorText);
  }

  TestRunner.addResult(selectorText);
  ElementsTestRunner.dumpStyleTreeOutline(section.propertiesTreeOutline, (omitLonghands ? 1 : 2), printInnerText);
  if (!section._showAllButton.classList.contains('hidden')) {
    TestRunner.addResult(text(section._showAllButton));
  }
  TestRunner.addResult('');

  function text(node) {
    return printInnerText ? node.innerText : node.textContent;
  }
}

async function extractLinkText(element) {
  // Links can contain live locations.
  await TestRunner.waitForPendingLiveLocationUpdates();
  const anchor = element.querySelector('.devtools-link');

  if (!anchor) {
    return element.textContent;
  }

  const anchorText = anchor.textContent;
  const info = Components.Linkifier.linkInfo(anchor);
  const uiLocation = info && info.uiLocation;
  const anchorTarget =
      (uiLocation ?
           uiLocation.uiSourceCode.name() + ':' + (uiLocation.lineNumber + 1) + ':' + (uiLocation.columnNumber + 1) :
           '');
  return anchorText + ' -> ' + anchorTarget;
}

function buildMarkedSelectors(element) {
  let result = '';

  for (let node = element.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('selector-matches')) {
      result += '[$' + node.textContent + '$]';
    } else {
      result += node.textContent;
    }
  }

  return result;
}

ElementsTestRunner.toggleStyleProperty = function(propertyName, checked) {
  const treeItem = ElementsTestRunner.getElementStylePropertyTreeItem(propertyName);

  treeItem._toggleDisabled(!checked);
};

ElementsTestRunner.toggleMatchedStyleProperty = function(propertyName, checked) {
  const treeItem = ElementsTestRunner.getMatchedStylePropertyTreeItem(propertyName);

  treeItem._toggleDisabled(!checked);
};

ElementsTestRunner.eventListenersWidget = function() {
  self.UI.viewManager.showView('elements.eventListeners');
  return Elements.EventListenersWidget.instance();
};

ElementsTestRunner.showEventListenersWidget = function() {
  return self.UI.viewManager.showView('elements.eventListeners');
};

/**
 * @return {Promise}
 */
ElementsTestRunner.showComputedStyles = function() {
  UI.panels.elements.sidebarPaneView.tabbedPane().selectTab('Computed', true);
  return ElementsTestRunner.computedStyleWidget().doUpdate();
};

ElementsTestRunner.expandAndDumpSelectedElementEventListeners = function(callback, force) {
  ElementsTestRunner.expandAndDumpEventListeners(
      ElementsTestRunner.eventListenersWidget()._eventListenersView, callback, force);
};

ElementsTestRunner.removeFirstEventListener = function() {
  const treeOutline = ElementsTestRunner.eventListenersWidget()._eventListenersView._treeOutline;
  const listenerTypes = treeOutline.rootElement().children();

  for (let i = 0; i < listenerTypes.length; i++) {
    const listeners = listenerTypes[i].children();

    if (listeners.length && !listenerTypes[i].hidden) {
      listeners[0].eventListener().remove();
      listeners[0]._removeListenerBar();
      break;
    }
  }
};

ElementsTestRunner.dumpObjectPropertySectionDeep = function(section) {
  function domNodeToString(node) {
    if (node) {
      return '\'' + node.textContent + '\'';
    }
    return 'null';
  }

  function dumpTreeElementRecursively(treeElement, prefix) {
    if ('nameElement' in treeElement) {
      TestRunner.addResult(
          prefix + domNodeToString(treeElement.nameElement) + ' => ' + domNodeToString(treeElement.valueElement));
    } else {
      TestRunner.addResult(prefix + treeElement.title);
    }

    for (let i = 0; i < treeElement.childCount(); i++) {
      dumpTreeElementRecursively(treeElement.childAt(i), prefix + '    ');
    }
  }

  const childNodes = section.propertiesTreeOutline.rootElement().children();

  for (let i = 0; i < childNodes.length; i++) {
    dumpTreeElementRecursively(childNodes[i], '');
  }
};

ElementsTestRunner.getElementStylePropertyTreeItem = function(propertyName) {
  return ElementsTestRunner.getFirstPropertyTreeItemForSection(ElementsTestRunner.inlineStyleSection(), propertyName);
};

ElementsTestRunner.getMatchedStylePropertyTreeItem = function(propertyName) {
  const sectionBlocks = UI.panels.elements._stylesWidget._sectionBlocks;

  for (const block of sectionBlocks) {
    for (const section of block.sections) {
      const treeItem = ElementsTestRunner.getFirstPropertyTreeItemForSection(section, propertyName);

      if (treeItem) {
        return treeItem;
      }
    }
  }

  return null;
};

ElementsTestRunner.getFirstPropertyTreeItemForSection = function(section, propertyName) {
  const outline = section.propertiesTreeOutline.rootElement();

  for (let i = 0; i < outline.childCount(); ++i) {
    const treeItem = outline.childAt(i);

    if (treeItem.name === propertyName) {
      return treeItem;
    }
  }

  return null;
};

ElementsTestRunner.dumpStyleTreeOutline = function(treeItem, depth, printInnerText) {
  const children = treeItem.rootElement().children();

  for (let i = 0; i < children.length; ++i) {
    ElementsTestRunner.dumpStyleTreeItem(children[i], '', depth || 2, printInnerText);
  }
};

ElementsTestRunner.dumpStyleTreeItem = function(treeItem, prefix, depth, printInnerText) {
  const textContent = printInnerText ? treeItem.listItemElement.innerText :
                                       TestRunner.textContentWithoutStyles(treeItem.listItemElement);
  if (textContent.indexOf(' width:') !== -1 || textContent.indexOf(' height:') !== -1) {
    return;
  }

  if (treeItem.listItemElement.classList.contains('inherited')) {
    return;
  }

  let typePrefix = '';

  if (treeItem.listItemElement.classList.contains('overloaded') ||
      treeItem.listItemElement.classList.contains('inactive') ||
      treeItem.listItemElement.classList.contains('not-parsed-ok')) {
    typePrefix += '/-- overloaded --/ ';
  }

  if (treeItem.listItemElement.classList.contains('disabled')) {
    typePrefix += '/-- disabled --/ ';
  }

  TestRunner.addResult(prefix + typePrefix + textContent);

  if (--depth) {
    treeItem.expand();
    const children = treeItem.children();

    for (let i = 0; children && i < children.length; ++i) {
      ElementsTestRunner.dumpStyleTreeItem(children[i], prefix + '    ', depth);
    }
  }
};

ElementsTestRunner.dumpElementsTree = function(rootNode, depth, resultsArray) {
  function beautify(element) {
    return element.innerText.replace(/\u200b/g, '').replace(/\n/g, '\\n').trim();
  }

  function dumpMap(name, map) {
    const result = [];

    for (const id of map.keys()) {
      result.push(id + '=' + map.get(id));
    }

    if (!result.length) {
      return '';
    }

    return name + ':[' + result.join(',') + ']';
  }

  function markersDataDump(treeItem) {
    if (treeItem._isClosingTag) {
      return '';
    }

    let markers = '';
    const node = treeItem._node;

    if (node) {
      markers += dumpMap('markers', node._markers);
      const dump = (node._subtreeMarkerCount ? 'subtreeMarkerCount:' + node._subtreeMarkerCount : '');

      if (dump) {
        if (markers) {
          markers += ', ';
        }

        markers += dump;
      }

      if (markers) {
        markers = ' [' + markers + ']';
      }
    }

    return markers;
  }

  function print(treeItem, prefix, depth) {
    if (!treeItem.root) {
      let expander;

      if (treeItem.isExpandable()) {
        if (treeItem.expanded) {
          expander = '- ';
        } else {
          expander = '+ ';
        }
      } else {
        expander = '  ';
      }

      const markers = markersDataDump(treeItem);
      let value = prefix + expander + beautify(treeItem.listItemElement) + markers;

      if (treeItem.shadowHostToolbar) {
        value = prefix + expander + 'shadow-root ';

        for (let i = 0; i < treeItem.shadowHostToolbar.children.length; ++i) {
          const button = treeItem.shadowHostToolbar.children[i];
          const toggled = button.disabled;
          const name = ((toggled ? '<' : '')) + button.textContent + ((toggled ? '>' : ''));
          value += name + ' ';
        }
      }

      if (resultsArray) {
        resultsArray.push(value);
      } else {
        TestRunner.addResult(value);
      }
    }

    if (!treeItem.expanded) {
      return;
    }

    const children = treeItem.children();
    const newPrefix = (treeItem.root ? '' : prefix + '    ');

    for (let i = 0; depth && children && i < children.length; ++i) {
      if (!children[i]._isClosingTag) {
        print(children[i], newPrefix, depth - 1);
      } else {
        print(children[i], prefix, depth);
      }
    }
  }

  const treeOutline = ElementsTestRunner.firstElementsTreeOutline();
  treeOutline.runPendingUpdates();
  print((rootNode ? treeOutline.findTreeElement(rootNode) : treeOutline.rootElement()), '', depth || 10000);
};

ElementsTestRunner.dumpDOMUpdateHighlights = function(rootNode, callback, depth) {
  let hasHighlights = false;
  TestRunner.addSniffer(Elements.ElementsTreeOutline.prototype, '_updateModifiedNodes', didUpdate);

  function didUpdate() {
    const treeOutline = ElementsTestRunner.firstElementsTreeOutline();
    print((rootNode ? treeOutline.findTreeElement(rootNode) : treeOutline.rootElement()), '', depth || 10000);

    if (!hasHighlights) {
      TestRunner.addResult('<No highlights>');
    }

    if (callback) {
      callback();
    }
  }

  function print(treeItem, prefix, depth) {
    if (!treeItem.root) {
      const elementXPath = Elements.DOMPath.xPath(treeItem.node(), true);
      const highlightedElements = treeItem.listItemElement.querySelectorAll('.dom-update-highlight');

      for (let i = 0; i < highlightedElements.length; ++i) {
        const element = highlightedElements[i];
        const classList = element.classList;
        let xpath = elementXPath;

        if (classList.contains('webkit-html-attribute-name')) {
          xpath += '/@' + element.textContent + ' (empty)';
        } else if (classList.contains('webkit-html-attribute-value')) {
          const name = element.parentElement.querySelector('.webkit-html-attribute-name').textContent;
          xpath += '/@' + name + ' ' + element.textContent;
        } else if (classList.contains('webkit-html-text-node')) {
          xpath += '/text() "' + element.textContent + '"';
        }

        TestRunner.addResult(prefix + xpath);
        hasHighlights = true;
      }
    }

    if (!treeItem.expanded) {
      return;
    }

    const children = treeItem.children();
    const newPrefix = (treeItem.root ? '' : prefix + '    ');

    for (let i = 0; depth && children && i < children.length; ++i) {
      if (!children[i]._isClosingTag) {
        print(children[i], newPrefix, depth - 1);
      }
    }
  }
};

ElementsTestRunner.expandElementsTree = function(callback) {
  let expandedSomething = false;
  callback = TestRunner.safeWrap(callback);

  function expand(treeItem) {
    const children = treeItem.children();

    for (let i = 0; children && i < children.length; ++i) {
      const child = children[i];

      if (child.isExpandable() && !child.expanded) {
        child.expand();
        expandedSomething = true;
      }

      expand(child);
    }
  }

  function onAllNodesAvailable() {
    ElementsTestRunner.firstElementsTreeOutline().runPendingUpdates();
    expand(ElementsTestRunner.firstElementsTreeOutline().rootElement());
    setTimeout(callback.bind(null, expandedSomething));
  }

  ElementsTestRunner.findNode(function() {
    return false;
  }, onAllNodesAvailable);
};

ElementsTestRunner.expandAndDump = function() {
  TestRunner.addResult('\nDump tree');
  let callback;
  const result = new Promise(f => {
    callback = f;
  });
  ElementsTestRunner.expandElementsTree(() => {
    ElementsTestRunner.dumpElementsTree();
    callback();
  });
  return result;
};

ElementsTestRunner.dumpDOMAgentTree = function(node) {
  if (!TestRunner.domModel._document) {
    return;
  }

  function dump(node, prefix) {
    TestRunner.addResult(prefix + node.nodeName());
    prefix = prefix + '    ';

    if (node.templateContent()) {
      dump(node.templateContent(), prefix);
    }

    if (node.contentDocument()) {
      dump(node.contentDocument(), prefix);
    }

    const shadowRoots = node.shadowRoots();

    for (let i = 0; i < shadowRoots.length; ++i) {
      dump(shadowRoots[i], prefix);
    }

    const children = node.children();

    for (let i = 0; children && i < children.length; ++i) {
      dump(children[i], prefix);
    }
  }

  dump(node, '');
};

ElementsTestRunner.rangeText = function(range) {
  if (!range) {
    return '[undefined-undefined]';
  }

  return '[' + range.startLine + ':' + range.startColumn + '-' + range.endLine + ':' + range.endColumn + ']';
};

ElementsTestRunner.generateUndoTest = function(testBody) {
  function result(next) {
    const testNode = ElementsTestRunner.expandedNodeWithId(/function\s([^(]*)/.exec(testBody)[1]);
    TestRunner.addResult('Initial:');
    ElementsTestRunner.dumpElementsTree(testNode);
    testBody(undo);

    function undo() {
      TestRunner.addResult('Post-action:');
      ElementsTestRunner.dumpElementsTree(testNode);
      ElementsTestRunner.expandElementsTree(expandedCallback);

      function expandedCallback(expandedSomething) {
        if (expandedSomething) {
          TestRunner.addResult('== Expanded: ==');
          ElementsTestRunner.dumpElementsTree(testNode);
        }

        self.SDK.domModelUndoStack.undo().then(redo);
      }
    }

    function redo() {
      TestRunner.addResult('Post-undo (initial):');
      ElementsTestRunner.dumpElementsTree(testNode);
      ElementsTestRunner.expandElementsTree(expandedCallback);

      function expandedCallback(expandedSomething) {
        if (expandedSomething) {
          TestRunner.addResult('== Expanded: ==');
          ElementsTestRunner.dumpElementsTree(testNode);
        }

        self.SDK.domModelUndoStack.redo().then(done);
      }
    }

    function done() {
      TestRunner.addResult('Post-redo (action):');
      ElementsTestRunner.dumpElementsTree(testNode);
      ElementsTestRunner.expandElementsTree(expandedCallback);

      function expandedCallback(expandedSomething) {
        if (expandedSomething) {
          TestRunner.addResult('== Expanded: ==');
          ElementsTestRunner.dumpElementsTree(testNode);
        }

        next();
      }
    }
  }

  result.toString = function() {
    return testBody.toString();
  };

  return result;
};

const indent = '    ';

ElementsTestRunner.dumpRulesArray = function(rules, currentIndent) {
  if (!rules) {
    return;
  }

  currentIndent = currentIndent || '';

  for (let i = 0; i < rules.length; ++i) {
    ElementsTestRunner.dumpRule(rules[i], currentIndent);
  }
};

ElementsTestRunner.dumpRuleMatchesArray = function(matches, currentIndent) {
  if (!matches) {
    return;
  }

  currentIndent = currentIndent || '';

  for (let i = 0; i < matches.length; ++i) {
    ElementsTestRunner.dumpRule(matches[i].rule, currentIndent);
  }
};

ElementsTestRunner.dumpRule = function(rule, currentIndent) {
  function selectorRange() {
    const selectors = rule.selectorList.selectors;

    if (!selectors || !selectors[0].range) {
      return '';
    }

    const ranges = [];

    for (let i = 0; i < selectors.length; ++i) {
      const range = selectors[i].range;
      ranges.push(range.startLine + ':' + range.startColumn + '-' + range.endLine + ':' + range.endColumn);
    }

    return ', ' + ranges.join('; ');
  }

  currentIndent = currentIndent || '';

  if (!rule.type || rule.type === 'style') {
    TestRunner.addResult(currentIndent + rule.selectorList.text + ': [' + rule.origin + selectorRange() + '] {');
    ElementsTestRunner.dumpStyle(rule.style, currentIndent + indent);
    TestRunner.addResult(currentIndent + '}');
    return;
  }

  if (rule.type === 'media') {
    TestRunner.addResult(currentIndent + '@media ' + rule.mediaText + ' {');
    ElementsTestRunner.dumpRulesArray(rule.childRules, currentIndent + indent);
    TestRunner.addResult(currentIndent + '}');
    return;
  }

  if (rule.type === 'import') {
    TestRunner.addResult(
        currentIndent + '@import: header=' + ElementsTestRunner.rangeText(rule.headerRange) +
        ', body=' + ElementsTestRunner.rangeText(rule.bodyRange));

    return;
  }

  if (rule.type === 'page' || rule.type === 'font-face') {
    if (rule.type === 'page') {
      TestRunner.addResult(currentIndent + rule.selectorList.text + ' {');
    } else {
      TestRunner.addResult(
          currentIndent + '@' + rule.type + ' ' + ((rule.selectorList.text ? rule.selectorList.text + ' ' : '')) + '{');
    }

    ElementsTestRunner.dumpStyle(rule.style, currentIndent + indent);
    TestRunner.addResult(currentIndent + '}');
    return;
  }

  if (rule.type === 'charset') {
    TestRunner.addResult('@charset');
    return;
  }

  TestRunner.addResult(
      currentIndent + '[UNKNOWN RULE]: header=' + ElementsTestRunner.rangeText(rule.headerRange) +
      ', body=' + ElementsTestRunner.rangeText(rule.bodyRange));
};

ElementsTestRunner.dumpStyle = function(style, currentIndent) {
  currentIndent = currentIndent || '';

  if (!style) {
    TestRunner.addResult(currentIndent + '[NO STYLE]');
    return;
  }

  for (let i = 0; i < style.cssProperties.length; ++i) {
    const property = style.cssProperties[i];

    if (!property.disabled) {
      TestRunner.addResult(
          currentIndent + '[\'' + property.name + '\':\'' + property.value + '\'' +
          ((property.important ? ' is-important' : '')) + (('parsedOk' in property ? ' non-parsed' : '')) + '] @' +
          ElementsTestRunner.rangeText(property.range) + ' ');
    } else {
      TestRunner.addResult(currentIndent + '[text=\'' + property.text + '\'] disabled');
    }
  }
};

ElementsTestRunner.dumpCSSStyleDeclaration = function(style, currentIndent) {
  currentIndent = currentIndent || '';

  if (!style) {
    TestRunner.addResult(currentIndent + '[NO STYLE]');
    return;
  }

  const properties = style.allProperties();

  for (let i = 0; i < properties.length; ++i) {
    const property = properties[i];

    if (!property.disabled) {
      TestRunner.addResult(
          currentIndent + '[\'' + property.name + '\':\'' + property.value + '\'' +
          ((property.important ? ' is-important' : '')) + ((!property['parsedOk'] ? ' non-parsed' : '')) + '] @' +
          ElementsTestRunner.rangeText(property.range) + ' ');
    } else {
      TestRunner.addResult(currentIndent + '[text=\'' + property.text + '\'] disabled');
    }
  }
};

ElementsTestRunner.dumpBreadcrumb = function(message) {
  if (message) {
    TestRunner.addResult(message + ':');
  }

  const result = [];
  const crumbs = UI.panels.elements._breadcrumbs.crumbsElement;
  let crumb = crumbs.lastChild;

  while (crumb) {
    result.unshift(crumb.textContent);
    crumb = crumb.previousSibling;
  }

  TestRunner.addResult(result.join(' > '));
};

ElementsTestRunner.matchingSelectors = function(matchedStyles, rule) {
  const selectors = [];
  const matchingSelectors = matchedStyles.matchingSelectors(rule);

  for (let i = 0; i < matchingSelectors.length; ++i) {
    selectors.push(rule.selectors[matchingSelectors[i]].text);
  }

  return '[' + selectors.join(', ') + ']';
};

ElementsTestRunner.addNewRuleInStyleSheet = function(styleSheetHeader, selector, callback) {
  TestRunner.addSniffer(
      Elements.StylesSidebarPane.prototype, '_addBlankSection', onBlankSection.bind(null, selector, callback));
  UI.panels.elements._stylesWidget._createNewRuleInStyleSheet(styleSheetHeader);
};

ElementsTestRunner.addNewRule = function(selector, callback) {
  UI.panels.elements._stylesWidget.contentElement.querySelector('.styles-pane-toolbar')
      .shadowRoot.querySelector('.largeicon-add')
      .click();
  TestRunner.addSniffer(
      Elements.StylesSidebarPane.prototype, '_addBlankSection', onBlankSection.bind(null, selector, callback));
};

function onBlankSection(selector, callback) {
  const section = ElementsTestRunner.firstMatchedStyleSection();

  if (typeof selector === 'string') {
    section._selectorElement.textContent = selector;
  }

  section._selectorElement.dispatchEvent(TestRunner.createKeyEvent('Enter'));
  ElementsTestRunner.waitForSelectorCommitted(callback.bind(null, section));
}

/**
 * The function accepts 2 or 3 arguments. Callback is the last one and the second argument is optional.
 *
 * To dump all highlight properties: dumpInspectorHighlightJSON(idValue, callback).
 * To pick which properties to dump: dumpInspectorHighlightJSON(idValue, ['prop'], callback).
 *
 * @param {string} idValue
 * @param {?Array<string>} attributes List of top-level property names to include in the result
 * @param {?Function=} maybeCallback
 */
ElementsTestRunner.dumpInspectorHighlightJSON = function(idValue, attributes, maybeCallback) {
  const callback = arguments.length === 3 ? maybeCallback : attributes;
  const attributeSet = arguments.length === 3 ? new Set(attributes) : new Set();
  ElementsTestRunner.nodeWithId(idValue, nodeResolved);

  async function nodeResolved(node) {
    const result = await TestRunner.OverlayAgent.getHighlightObjectForTest(node.id);
    const view = attributeSet.size ? {} : result;
    for (const key of Object.keys(result).filter(key => attributeSet.has(key))) {
      view[key] = result[key];
    }
    TestRunner.addResult(idValue + JSON.stringify(view, null, 2));
    callback();
  }
};

ElementsTestRunner.dumpInspectorGridHighlightsJSON = async function(idValues, callback) {
  const nodeIds = [];
  for (const id of idValues) {
    const node = await ElementsTestRunner.nodeWithIdPromise(id);
    nodeIds.push(node.id);
  }

  const result = await TestRunner.OverlayAgent.getGridHighlightObjectsForTest(nodeIds);
  TestRunner.addResult(JSON.stringify(result, null, 2));
  callback();
};

ElementsTestRunner.dumpInspectorDistanceJSON = function(idValue, callback) {
  ElementsTestRunner.nodeWithId(idValue, nodeResolved);

  async function nodeResolved(node) {
    const result = await TestRunner.OverlayAgent.getHighlightObjectForTest(node.id, true);
    const info = result['distanceInfo'];
    if (!info) {
      TestRunner.addResult(`${idValue}: No distance info`);
    } else {
      if (info['style']) {
        info['style'] = '<style data>';
      }
      TestRunner.addResult(idValue + JSON.stringify(info, null, 2));
    }
    callback();
  }
};

ElementsTestRunner.dumpInspectorHighlightStyleJSON = async function(idValue) {
  const node = await ElementsTestRunner.nodeWithIdPromise(idValue);
  const result = await TestRunner.OverlayAgent.getHighlightObjectForTest(node.id, false, true /* includeStyle */);
  const info = result['elementInfo'] ? result['elementInfo']['style'] : null;
  if (!info) {
    TestRunner.addResult(`${idValue}: No style info`);
  } else {
    if (info['font-family']) {
      info['font-family'] = '<font-family value>';
    }
    TestRunner.addResult(idValue + JSON.stringify(info, null, 2));
  }
};

ElementsTestRunner.waitForAnimationAdded = function(callback) {
  TestRunner.addSniffer(Animation.AnimationTimeline.prototype, '_addAnimationGroup', callback);
};

ElementsTestRunner.dumpAnimationTimeline = function(timeline) {
  for (const ui of timeline._uiAnimations) {
    TestRunner.addResult(ui.animation().type());
    TestRunner.addResult(ui._nameElement.innerHTML);
    TestRunner.addResult(ui._svg.innerHTML);
  }
};

// Saves time by ignoring sidebar updates, use in tests that don't interact
// with these sidebars.
ElementsTestRunner.ignoreSidebarUpdates = function() {
  Elements.StylesSidebarPane.prototype.update = function() {};
  Elements.MetricsSidebarPane.prototype.update = function() {};
};
