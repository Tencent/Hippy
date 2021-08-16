// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '../test_runner/test_runner.js';
import '../../panels/layer_viewer/layer_viewer-legacy.js';
import '../../panels/elements/elements-legacy.js';
import '../../ui/legacy/components/utils/utils-legacy.js';

import * as Layers from '../../panels/layers/layers.js';

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.LayersTestRunner = self.LayersTestRunner || {};

LayersTestRunner.layerTreeModel = function() {
  if (!LayersTestRunner._layerTreeModel) {
    LayersTestRunner._layerTreeModel = TestRunner.mainTarget.model(Layers.LayerTreeModel.LayerTreeModel);
  }

  return LayersTestRunner._layerTreeModel;
};

LayersTestRunner.labelForLayer = function(layer) {
  const node = layer.nodeForSelfOrAncestor();
  let label = (node ? Elements.DOMPath.fullQualifiedSelector(node, false) : '<invalid node id>');
  const height = layer.height();
  const width = layer.width();

  if (height <= 200 && width <= 200) {
    label += ' ' + height + 'x' + width;
  }

  if (typeof layer.__extraData !== 'undefined') {
    label += ' (' + layer.__extraData + ')';
  }

  return label;
};

LayersTestRunner.dumpLayerTree = function(prefix, root) {
  if (!prefix) {
    prefix = '';
  }

  if (!root) {
    root = LayersTestRunner.layerTreeModel().layerTree().contentRoot();

    if (!root) {
      TestRunner.addResult('No layer root, perhaps not in the composited mode! ');
      TestRunner.completeTest();
      return;
    }
  }

  TestRunner.addResult(prefix + LayersTestRunner.labelForLayer(root));
  root.children().forEach(LayersTestRunner.dumpLayerTree.bind(LayersTestRunner, prefix + '    '));
};

LayersTestRunner.dumpLayers3DView = function(prefix, root) {
  if (!prefix) {
    prefix = '';
  }

  if (!root) {
    root = UI.panels.layers._layers3DView._rotatingContainerElement;
  }

  if (root.__layer) {
    TestRunner.addResult(prefix + LayersTestRunner.labelForLayer(root.__layer));
  }

  for (let element = root.firstElementChild; element; element = element.nextSibling) {
    LayersTestRunner.dumpLayers3DView(prefix + '    ', element);
  }
};

LayersTestRunner.evaluateAndWaitForTreeChange = async function(expression) {
  await TestRunner.evaluateInPageAnonymously(expression);
  return LayersTestRunner.layerTreeModel().once(Layers.LayerTreeModel.Events.LayerTreeChanged);
};

LayersTestRunner.findLayerByNodeIdAttribute = function(nodeIdAttribute) {
  let result;

  function testLayer(layer) {
    const node = layer.node();

    if (!node) {
      return false;
    }

    if (!node || node.getAttribute('id') !== nodeIdAttribute) {
      return false;
    }

    result = layer;
    return true;
  }

  LayersTestRunner.layerTreeModel().layerTree().forEachLayer(testLayer);

  if (!result) {
    TestRunner.addResult('ERROR: No layer for ' + nodeIdAttribute);
  }

  return result;
};

LayersTestRunner.requestLayers = function() {
  LayersTestRunner.layerTreeModel().enable();
  return LayersTestRunner.layerTreeModel().once(Layers.LayerTreeModel.Events.LayerTreeChanged);
};

LayersTestRunner.dispatchMouseEvent = function(eventType, button, element, offsetX, offsetY) {
  const totalOffset = element.totalOffset();

  const eventArguments = {
    bubbles: true,
    cancelable: true,
    view: window,
    screenX: totalOffset.left - element.scrollLeft + offsetX,
    screenY: totalOffset.top - element.scrollTop + offsetY,
    clientX: totalOffset.left + offsetX,
    clientY: totalOffset.top + offsetY,
    button: button,
    composed: true
  };

  if (eventType === 'mouseout') {
    eventArguments.screenX = 0;
    eventArguments.screenY = 0;
    eventArguments.clientX = 0;
    eventArguments.clientY = 0;
  }

  element.dispatchEvent(new MouseEvent(eventType, eventArguments));
};

LayersTestRunner.findLayerTreeElement = function(layer) {
  const element = LayerViewer.LayerTreeElement.layerToTreeElement.get(layer);
  element.reveal();
  return element.listItemElement;
};

LayersTestRunner.dispatchMouseEventToLayerTree = function(eventType, button, layer) {
  const element = LayersTestRunner.findLayerTreeElement(layer);
  TestRunner.assertTrue(Boolean(element));
  LayersTestRunner.dispatchMouseEvent(eventType, button, element, element.clientWidth >> 1, element.clientHeight >> 1);
};

LayersTestRunner.dumpSelectedStyles = function(message, element) {
  const classes = [];
  if (element.classList.contains('selected')) {
    classes.push('selected');
  }
  if (element.classList.contains('hovered')) {
    classes.push('hovered');
  }

  TestRunner.addResult(message + ': ' + classes.join(', '));
};
