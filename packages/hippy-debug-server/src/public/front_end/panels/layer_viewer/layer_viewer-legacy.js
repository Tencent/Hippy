// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as LayerViewerModule from './layer_viewer.js';
self.LayerViewer = self.LayerViewer || {};
LayerViewer = LayerViewer || {};
/**
 * @constructor
 */
LayerViewer.LayerDetailsView = LayerViewerModule.LayerDetailsView.LayerDetailsView;
/** @enum {symbol} */
LayerViewer.LayerDetailsView.Events = LayerViewerModule.LayerDetailsView.Events;
LayerViewer.LayerDetailsView._slowScrollRectNames = LayerViewerModule.LayerDetailsView.slowScrollRectNames;
/**
 * @constructor
 */
LayerViewer.LayerTreeOutline = LayerViewerModule.LayerTreeOutline.LayerTreeOutline;
/**
 * @enum {symbol}
 */
LayerViewer.LayerTreeOutline.Events = LayerViewerModule.LayerTreeOutline.Events;
/**
 * @constructor
 */
LayerViewer.LayerTreeElement = LayerViewerModule.LayerTreeOutline.LayerTreeElement;
LayerViewer.LayerTreeElement.layerToTreeElement = LayerViewerModule.LayerTreeOutline.layerToTreeElement;
/**
 * @interface
 */
LayerViewer.LayerView = LayerViewerModule.LayerViewHost.LayerView;
/**
 * @constructor
 */
LayerViewer.LayerView.Selection = LayerViewerModule.LayerViewHost.Selection;
/**
 * @enum {symbol}
 */
LayerViewer.LayerView.Selection.Type = LayerViewerModule.LayerViewHost.Type;
/**
 * @constructor
 */
LayerViewer.LayerView.LayerSelection = LayerViewerModule.LayerViewHost.LayerSelection;
/**
 * @constructor
 */
LayerViewer.LayerView.ScrollRectSelection = LayerViewerModule.LayerViewHost.ScrollRectSelection;
/**
 * @constructor
 */
LayerViewer.LayerView.SnapshotSelection = LayerViewerModule.LayerViewHost.SnapshotSelection;
/**
 * @constructor
 */
LayerViewer.LayerViewHost = LayerViewerModule.LayerViewHost.LayerViewHost;
/**
 * @constructor
 */
LayerViewer.Layers3DView = LayerViewerModule.Layers3DView.Layers3DView;
/**
 * @enum {string}
 */
LayerViewer.Layers3DView.OutlineType = LayerViewerModule.Layers3DView.OutlineType;
/**
 * @enum {symbol}
 */
LayerViewer.Layers3DView.Events = LayerViewerModule.Layers3DView.Events;
/**
 * @enum {number}
 */
LayerViewer.Layers3DView.ChromeTexture = LayerViewerModule.Layers3DView.ChromeTexture;
LayerViewer.Layers3DView.FragmentShader = LayerViewerModule.Layers3DView.FragmentShader;
LayerViewer.Layers3DView.VertexShader = LayerViewerModule.Layers3DView.VertexShader;
LayerViewer.Layers3DView.HoveredBorderColor = LayerViewerModule.Layers3DView.HoveredBorderColor;
LayerViewer.Layers3DView.SelectedBorderColor = LayerViewerModule.Layers3DView.SelectedBorderColor;
LayerViewer.Layers3DView.BorderColor = LayerViewerModule.Layers3DView.BorderColor;
LayerViewer.Layers3DView.ViewportBorderColor = LayerViewerModule.Layers3DView.ViewportBorderColor;
LayerViewer.Layers3DView.ScrollRectBackgroundColor = LayerViewerModule.Layers3DView.ScrollRectBackgroundColor;
LayerViewer.Layers3DView.HoveredImageMaskColor = LayerViewerModule.Layers3DView.HoveredImageMaskColor;
LayerViewer.Layers3DView.BorderWidth = LayerViewerModule.Layers3DView.BorderWidth;
LayerViewer.Layers3DView.SelectedBorderWidth = LayerViewerModule.Layers3DView.SelectedBorderWidth;
LayerViewer.Layers3DView.ViewportBorderWidth = LayerViewerModule.Layers3DView.ViewportBorderWidth;
LayerViewer.Layers3DView.LayerSpacing = LayerViewerModule.Layers3DView.LayerSpacing;
LayerViewer.Layers3DView.ScrollRectSpacing = LayerViewerModule.Layers3DView.ScrollRectSpacing;
/**
 * @constructor
 */
LayerViewer.Layers3DView.Rectangle = LayerViewerModule.Layers3DView.Rectangle;
/**
 * @constructor
 */
LayerViewer.LayerTextureManager = LayerViewerModule.Layers3DView.LayerTextureManager;
/**
 * @constructor
 */
LayerViewer.LayerTextureManager.Tile = LayerViewerModule.Layers3DView.Tile;
/**
 * @constructor
 */
LayerViewer.PaintProfilerView = LayerViewerModule.PaintProfilerView.PaintProfilerView;
LayerViewer.PaintProfilerView.Events = LayerViewerModule.PaintProfilerView.Events;
/**
 * @constructor
 */
LayerViewer.PaintProfilerCommandLogView = LayerViewerModule.PaintProfilerView.PaintProfilerCommandLogView;
/**
 * @constructor
 */
LayerViewer.LogTreeElement = LayerViewerModule.PaintProfilerView.LogTreeElement;
/**
 * @constructor
 */
LayerViewer.LogPropertyTreeElement = LayerViewerModule.PaintProfilerView.LogPropertyTreeElement;
/**
 * @constructor
 */
LayerViewer.PaintProfilerCategory = LayerViewerModule.PaintProfilerView.PaintProfilerCategory;
/**
 * @constructor
 */
LayerViewer.TransformController = LayerViewerModule.TransformController.TransformController;
/**
 * @enum {symbol}
 */
LayerViewer.TransformController.Events = LayerViewerModule.TransformController.Events;
/**
 * @enum {string}
 */
LayerViewer.TransformController.Modes = LayerViewerModule.TransformController.Modes;
//# sourceMappingURL=layer_viewer-legacy.js.map