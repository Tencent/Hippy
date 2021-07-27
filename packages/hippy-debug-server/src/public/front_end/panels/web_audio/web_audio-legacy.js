// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as WebAudioModule from './web_audio.js';
self.WebAudio = self.WebAudio || {};
WebAudio = WebAudio || {};
WebAudio.GraphVisualizer = WebAudio.GraphVisualizer || {};
WebAudio.GraphVisualizer.GraphStyle = WebAudio.GraphVisualizer.Style || {};
WebAudio.GraphVisualizer.NodeRendererUtility = WebAudio.GraphVisualizer.NodeRendererUtility || {};
/**
 * @constructor
 */
WebAudio.ContextDetailBuilder = WebAudioModule.AudioContextContentBuilder.ContextDetailBuilder;
/**
 * @constructor
 */
WebAudio.AudioContextSummaryBuilder = WebAudioModule.AudioContextContentBuilder.AudioContextSummaryBuilder;
/**
 * @constructor
 */
WebAudio.AudioContextSelector = WebAudioModule.AudioContextSelector.AudioContextSelector;
/** @enum {symbol} */
WebAudio.AudioContextSelector.Events = WebAudioModule.AudioContextSelector.Events;
/**
 * @constructor
 */
WebAudio.WebAudioModel = WebAudioModule.WebAudioModel.WebAudioModel;
/** @enum {symbol} */
WebAudio.WebAudioModel.Events = WebAudioModule.WebAudioModel.Events;
/**
 * @constructor
 */
WebAudio.WebAudioView = WebAudioModule.WebAudioView.WebAudioView;
/**
 * @constructor
 */
WebAudio.GraphVisualizer.EdgeView = WebAudioModule.EdgeView.EdgeView;
WebAudio.GraphVisualizer.generateEdgePortIdsByData = WebAudioModule.EdgeView.generateEdgePortIdsByData;
/**
 * @enum {symbol}
 */
WebAudio.GraphVisualizer.EdgeTypes = WebAudioModule.EdgeView.EdgeTypes;
/**
 * @constructor
 */
WebAudio.GraphVisualizer.GraphManager = WebAudioModule.GraphManager.GraphManager;
WebAudio.GraphVisualizer.GraphStyle.PortPadding = WebAudioModule.GraphStyle.PortPadding;
WebAudio.GraphVisualizer.GraphStyle.InputPortRadius = WebAudioModule.GraphStyle.InputPortRadius;
WebAudio.GraphVisualizer.GraphStyle.AudioParamRadius = WebAudioModule.GraphStyle.AudioParamRadius;
WebAudio.GraphVisualizer.GraphStyle.LeftMarginOfText = WebAudioModule.GraphStyle.LeftMarginOfText;
WebAudio.GraphVisualizer.GraphStyle.RightMarginOfText = WebAudioModule.GraphStyle.RightMarginOfText;
WebAudio.GraphVisualizer.GraphStyle.LeftSideTopPadding = WebAudioModule.GraphStyle.LeftSideTopPadding;
WebAudio.GraphVisualizer.GraphStyle.BottomPaddingWithoutParam = WebAudioModule.GraphStyle.BottomPaddingWithoutParam;
WebAudio.GraphVisualizer.GraphStyle.BottomPaddingWithParam = WebAudioModule.GraphStyle.BottomPaddingWithParam;
WebAudio.GraphVisualizer.GraphStyle.ArrowHeadSize = WebAudioModule.GraphStyle.ArrowHeadSize;
WebAudio.GraphVisualizer.GraphStyle.GraphPadding = WebAudioModule.GraphStyle.GraphPadding;
WebAudio.GraphVisualizer.GraphStyle.GraphMargin = WebAudioModule.GraphStyle.GraphMargin;
WebAudio.GraphVisualizer.GraphStyle.TotalInputPortHeight = WebAudioModule.GraphStyle.TotalInputPortHeight;
WebAudio.GraphVisualizer.GraphStyle.TotalOutputPortHeight = WebAudioModule.GraphStyle.TotalOutputPortHeight;
WebAudio.GraphVisualizer.GraphStyle.TotalParamPortHeight = WebAudioModule.GraphStyle.TotalParamPortHeight;
WebAudio.GraphVisualizer.GraphStyle.NodeLabelFontStyle = WebAudioModule.GraphStyle.NodeLabelFontStyle;
WebAudio.GraphVisualizer.GraphStyle.ParamLabelFontStyle = WebAudioModule.GraphStyle.ParamLabelFontStyle;
WebAudio.GraphVisualizer.GraphStyle.GraphStyles = WebAudioModule.GraphStyle.GraphStyles;
/**
 * @constructor
 */
WebAudio.GraphVisualizer.GraphView = WebAudioModule.GraphView.GraphView;
/** @enum {symbol} */
WebAudio.GraphVisualizer.GraphView.Events = WebAudioModule.GraphView.Events;
WebAudio.GraphVisualizer.NodeRendererUtility.calculateInputPortXY =
    WebAudioModule.NodeRendererUtility.calculateInputPortXY;
WebAudio.GraphVisualizer.NodeRendererUtility.calculateOutputPortXY =
    WebAudioModule.NodeRendererUtility.calculateOutputPortXY;
WebAudio.GraphVisualizer.NodeRendererUtility.calculateParamPortXY =
    WebAudioModule.NodeRendererUtility.calculateParamPortXY;
/**
 * @constructor
 */
WebAudio.GraphVisualizer.NodeView = WebAudioModule.NodeView.NodeView;
/**
 * Supported port types.
 * @enum {symbol}
 */
WebAudio.GraphVisualizer.PortTypes = WebAudioModule.GraphStyle.PortTypes;
/**
 * @constructor
 */
WebAudio.GraphVisualizer.NodeLabelGenerator = WebAudioModule.NodeView.NodeLabelGenerator;
WebAudio.GraphVisualizer.generateInputPortId = WebAudioModule.NodeView.generateInputPortId;
WebAudio.GraphVisualizer.generateOutputPortId = WebAudioModule.NodeView.generateOutputPortId;
WebAudio.GraphVisualizer.generateParamPortId = WebAudioModule.NodeView.generateParamPortId;
WebAudio.GraphVisualizer.measureTextWidth = WebAudioModule.NodeView.measureTextWidth;
//# sourceMappingURL=web_audio-legacy.js.map