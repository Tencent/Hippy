// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as PerfUIModule from './perf_ui.js';
self.PerfUI = self.PerfUI || {};
PerfUI = PerfUI || {};
/** @constructor */
PerfUI.ChartViewport = PerfUIModule.ChartViewport.ChartViewport;
/** @constructor */
PerfUI.FilmStripView = PerfUIModule.FilmStripView.FilmStripView;
/** @enum {symbol} */
PerfUI.FilmStripView.Events = PerfUIModule.FilmStripView.Events;
PerfUI.FilmStripView.Modes = PerfUIModule.FilmStripView.Modes;
PerfUI.FilmStripView.Dialog = PerfUIModule.FilmStripView.Dialog;
/** @constructor */
PerfUI.FlameChart = PerfUIModule.FlameChart.FlameChart;
PerfUI.FlameChart.HeaderHeight = PerfUIModule.FlameChart.HeaderHeight;
/** @constructor */
PerfUI.FlameChart.TimelineData = PerfUIModule.FlameChart.TimelineData;
/** @enum {symbol} */
PerfUI.FlameChart.Events = PerfUIModule.FlameChart.Events;
/** @interface */
PerfUI.FlameChartDelegate = PerfUIModule.FlameChart.FlameChartDelegate;
/** @interface */
PerfUI.FlameChartDataProvider = PerfUIModule.FlameChart.FlameChartDataProvider;
/** @interface */
PerfUI.FlameChartMarker = PerfUIModule.FlameChart.FlameChartMarker;
/** @constructor */
PerfUI.GCActionDelegate = PerfUIModule.GCActionDelegate.GCActionDelegate;
PerfUI.LineLevelProfile = {};
/** @constructor */
PerfUI.LineLevelProfile.Performance = PerfUIModule.LineLevelProfile.Performance;
/** @constructor */
PerfUI.LineLevelProfile.LineDecorator = PerfUIModule.LineLevelProfile.LineDecorator;
/** @constructor */
PerfUI.LiveHeapProfile = PerfUIModule.LiveHeapProfile.LiveHeapProfile;
PerfUI.uiLabelForNetworkPriority = PerfUIModule.NetworkPriorities.uiLabelForNetworkPriority;
PerfUI.uiLabelToNetworkPriority = PerfUIModule.NetworkPriorities.uiLabelToNetworkPriority;
PerfUI.networkPriorityWeight = PerfUIModule.NetworkPriorities.networkPriorityWeight;
/** @constructor */
PerfUI.OverviewGrid = PerfUIModule.OverviewGrid.OverviewGrid;
/** @constructor */
PerfUI.OverviewGrid.Window = PerfUIModule.OverviewGrid.Window;
/** @enum {symbol} */
PerfUI.OverviewGrid.Events = PerfUIModule.OverviewGrid.Events;
/** @constructor */
PerfUI.TimelineGrid = PerfUIModule.TimelineGrid.TimelineGrid;
/** @interface */
PerfUI.TimelineGrid.Calculator = PerfUIModule.TimelineGrid.Calculator;
/** @constructor */
PerfUI.TimelineOverviewPane = PerfUIModule.TimelineOverviewPane.TimelineOverviewPane;
/** @enum {symbol} */
PerfUI.TimelineOverviewPane.Events = PerfUIModule.TimelineOverviewPane.Events;
/** @constructor */
PerfUI.TimelineOverviewBase = PerfUIModule.TimelineOverviewPane.TimelineOverviewBase;
/** @interface */
PerfUI.TimelineOverview = PerfUIModule.TimelineOverviewPane.TimelineOverview;
//# sourceMappingURL=perf_ui-legacy.js.map