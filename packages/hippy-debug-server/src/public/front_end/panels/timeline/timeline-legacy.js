// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as TimelineModule from './timeline.js';
self.Timeline = self.Timeline || {};
Timeline = Timeline || {};
Timeline.CLSLinkifier = Timeline.CLSLinkifier || {};
/** @constructor */
Timeline.CLSLinkifier.CLSRect = TimelineModule.CLSLinkifier.CLSRect;
/** @constructor */
Timeline.CLSLinkifier.Linkifier = TimelineModule.CLSLinkifier.Linkifier;
/** @constructor */
Timeline.CountersGraph = TimelineModule.CountersGraph.CountersGraph;
/** @constructor */
Timeline.CountersGraph.Counter = TimelineModule.CountersGraph.Counter;
/** @constructor */
Timeline.CountersGraph.CounterUI = TimelineModule.CountersGraph.CounterUI;
/** @constructor */
Timeline.CountersGraph.Calculator = TimelineModule.CountersGraph.Calculator;
/** @constructor */
Timeline.EventsTimelineTreeView = TimelineModule.EventsTimelineTreeView.EventsTimelineTreeView;
/** @constructor */
Timeline.EventsTimelineTreeView.Filters = TimelineModule.EventsTimelineTreeView.Filters;
/** @constructor */
Timeline.ExtensionTracingSession = TimelineModule.ExtensionTracingSession.ExtensionTracingSession;
/** @constructor */
Timeline.PerformanceModel = TimelineModule.PerformanceModel.PerformanceModel;
/** @enum {symbol} */
Timeline.PerformanceModel.Events = TimelineModule.PerformanceModel.Events;
/** @constructor */
Timeline.TimelineController = TimelineModule.TimelineController.TimelineController;
/** @interface */
Timeline.TimelineController.Client = TimelineModule.TimelineController.Client;
/** @constructor */
Timeline.TimelineDetailsView = TimelineModule.TimelineDetailsView.TimelineDetailsView;
/** @enum {string} */
Timeline.TimelineDetailsView.Tab = TimelineModule.TimelineDetailsView.Tab;
/** @constructor */
Timeline.TimelineEventOverview = TimelineModule.TimelineEventOverview.TimelineEventOverview;
/** @constructor */
Timeline.TimelineEventOverviewInput = TimelineModule.TimelineEventOverview.TimelineEventOverviewInput;
/** @constructor */
Timeline.TimelineEventOverviewNetwork = TimelineModule.TimelineEventOverview.TimelineEventOverviewNetwork;
/** @constructor */
Timeline.TimelineEventOverviewCPUActivity = TimelineModule.TimelineEventOverview.TimelineEventOverviewCPUActivity;
/** @constructor */
Timeline.TimelineEventOverviewResponsiveness = TimelineModule.TimelineEventOverview.TimelineEventOverviewResponsiveness;
/** @constructor */
Timeline.TimelineFilmStripOverview = TimelineModule.TimelineEventOverview.TimelineFilmStripOverview;
/** @constructor */
Timeline.TimelineEventOverviewFrames = TimelineModule.TimelineEventOverview.TimelineEventOverviewFrames;
/** @constructor */
Timeline.TimelineEventOverviewMemory = TimelineModule.TimelineEventOverview.TimelineEventOverviewMemory;
/** @constructor */
Timeline.Quantizer = TimelineModule.TimelineEventOverview.Quantizer;
/** @constructor */
Timeline.TimelineEventOverviewCoverage = TimelineModule.TimelineEventOverview.TimelineEventOverviewCoverage;
Timeline.TimelineFilters = {};
/** @constructor */
Timeline.TimelineFilters.IsLong = TimelineModule.TimelineFilters.IsLong;
/** @constructor */
Timeline.TimelineFilters.Category = TimelineModule.TimelineFilters.Category;
/** @constructor */
Timeline.TimelineFilters.RegExp = TimelineModule.TimelineFilters.TimelineRegExp;
/** @constructor */
Timeline.TimelineFlameChartDataProvider = TimelineModule.TimelineFlameChartDataProvider.TimelineFlameChartDataProvider;
Timeline.TimelineFlameChartDataProvider.InstantEventVisibleDurationMs =
    TimelineModule.TimelineFlameChartDataProvider.InstantEventVisibleDurationMs;
/** @enum {symbol} */
Timeline.TimelineFlameChartDataProvider.Events = TimelineModule.TimelineFlameChartDataProvider.Events;
/** @enum {symbol} */
Timeline.TimelineFlameChartDataProvider.EntryType = TimelineModule.TimelineFlameChartDataProvider.EntryType;
/** @constructor */
Timeline.TimelineFlameChartNetworkDataProvider =
    TimelineModule.TimelineFlameChartNetworkDataProvider.TimelineFlameChartNetworkDataProvider;
/** @constructor */
Timeline.TimelineFlameChartView = TimelineModule.TimelineFlameChartView.TimelineFlameChartView;
/** @constructor */
Timeline.TimelineFlameChartView.Selection = TimelineModule.TimelineFlameChartView.Selection;
/** @enum {string} */
Timeline.TimelineFlameChartView._ColorBy = TimelineModule.TimelineFlameChartView.ColorBy;
Timeline.FlameChartStyle = TimelineModule.TimelineFlameChartView.FlameChartStyle;
/** @constructor */
Timeline.TimelineFlameChartMarker = TimelineModule.TimelineFlameChartView.TimelineFlameChartMarker;
/** @constructor */
Timeline.TimelineHistoryManager = TimelineModule.TimelineHistoryManager.TimelineHistoryManager;
/** @constructor */
Timeline.TimelineHistoryManager.DropDown = TimelineModule.TimelineHistoryManager.DropDown;
/** @constructor */
Timeline.TimelineHistoryManager.ToolbarButton = TimelineModule.TimelineHistoryManager.ToolbarButton;
/** @constructor */
Timeline.TimelineLayersView = TimelineModule.TimelineLayersView.TimelineLayersView;
/** @constructor */
Timeline.TimelineLoader = TimelineModule.TimelineLoader.TimelineLoader;
Timeline.TimelineLoader.TransferChunkLengthBytes = TimelineModule.TimelineLoader.TransferChunkLengthBytes;
/** @interface */
Timeline.TimelineLoader.Client = TimelineModule.TimelineLoader.Client;
/** @enum {symbol} */
Timeline.TimelineLoader.State = TimelineModule.TimelineLoader.State;
/** @constructor */
Timeline.TimelinePaintProfilerView = TimelineModule.TimelinePaintProfilerView.TimelinePaintProfilerView;
/** @constructor */
Timeline.TimelinePaintImageView = TimelineModule.TimelinePaintProfilerView.TimelinePaintImageView;
/** @constructor */
Timeline.TimelinePanel = TimelineModule.TimelinePanel.TimelinePanel;
/** @enum {symbol} */
Timeline.TimelinePanel.State = TimelineModule.TimelinePanel.State;
/** @enum {string} */
Timeline.TimelinePanel.ViewMode = TimelineModule.TimelinePanel.ViewMode;
Timeline.TimelinePanel.rowHeight = TimelineModule.TimelinePanel.rowHeight;
Timeline.TimelinePanel.headerHeight = TimelineModule.TimelinePanel.headerHeight;
/** @constructor */
Timeline.TimelinePanel.StatusPane = TimelineModule.TimelinePanel.StatusPane;
/** @constructor */
Timeline.TimelinePanel.ActionDelegate = TimelineModule.TimelinePanel.ActionDelegate;
/** @constructor */
Timeline.TimelineSelection = TimelineModule.TimelinePanel.TimelineSelection;
/** @interface */
Timeline.TimelineModeViewDelegate = TimelineModule.TimelinePanel.TimelineModeViewDelegate;
/** @constructor */
Timeline.LoadTimelineHandler = TimelineModule.TimelinePanel.LoadTimelineHandler;
/** @constructor */
Timeline.TimelineTreeView = TimelineModule.TimelineTreeView.TimelineTreeView;
/** @constructor */
Timeline.TimelineTreeView.GridNode = TimelineModule.TimelineTreeView.GridNode;
/** @constructor */
Timeline.TimelineTreeView.TreeGridNode = TimelineModule.TimelineTreeView.TreeGridNode;
/** @constructor */
Timeline.AggregatedTimelineTreeView = TimelineModule.TimelineTreeView.AggregatedTimelineTreeView;
/** @constructor */
Timeline.CallTreeTimelineTreeView = TimelineModule.TimelineTreeView.CallTreeTimelineTreeView;
/** @constructor */
Timeline.BottomUpTimelineTreeView = TimelineModule.TimelineTreeView.BottomUpTimelineTreeView;
/** @constructor */
Timeline.TimelineStackView = TimelineModule.TimelineTreeView.TimelineStackView;
/** @constructor */
Timeline.TimelineUIUtils = TimelineModule.TimelineUIUtils.TimelineUIUtils;
/** @enum {symbol} */
Timeline.TimelineUIUtils.NetworkCategory = TimelineModule.TimelineUIUtils.NetworkCategory;
Timeline.TimelineUIUtils._aggregatedStatsKey = TimelineModule.TimelineUIUtils.aggregatedStatsKey;
/** @constructor */
Timeline.TimelineUIUtils.InvalidationsGroupElement = TimelineModule.TimelineUIUtils.InvalidationsGroupElement;
Timeline.TimelineUIUtils._previewElementSymbol = TimelineModule.TimelineUIUtils.previewElementSymbol;
/** @constructor */
Timeline.TimelineUIUtils.EventDispatchTypeDescriptor = TimelineModule.TimelineUIUtils.EventDispatchTypeDescriptor;
Timeline.TimelineUIUtils._categoryBreakdownCacheSymbol = TimelineModule.TimelineUIUtils.categoryBreakdownCacheSymbol;
/** @constructor */
Timeline.TimelineRecordStyle = TimelineModule.TimelineUIUtils.TimelineRecordStyle;
/** @constructor */
Timeline.TimelineCategory = TimelineModule.TimelineUIUtils.TimelineCategory;
/** @constructor */
Timeline.TimelineDetailsContentHelper = TimelineModule.TimelineUIUtils.TimelineDetailsContentHelper;
/** @constructor */
Timeline.UIDevtoolsController = TimelineModule.UIDevtoolsController.UIDevtoolsController;
/** @constructor */
Timeline.UIDevtoolsUtils = TimelineModule.UIDevtoolsUtils.UIDevtoolsUtils;
/** @enum {string} */
Timeline.UIDevtoolsUtils.RecordType = TimelineModule.UIDevtoolsUtils.RecordType;
//# sourceMappingURL=timeline-legacy.js.map