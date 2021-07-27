// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ProfilerModule from './profiler.js';
self.Profiler = self.Profiler || {};
Profiler = Profiler || {};
/** @constructor */
Profiler.CPUProfileFlameChart = ProfilerModule.CPUProfileFlameChart.CPUProfileFlameChart;
/** @constructor */
Profiler.CPUProfileView = ProfilerModule.CPUProfileView.CPUProfileView;
/** @constructor */
Profiler.CPUProfileHeader = ProfilerModule.CPUProfileView.CPUProfileHeader;
/** @constructor */
Profiler.HeapProfileView = ProfilerModule.HeapProfileView.HeapProfileView;
/** @constructor */
Profiler.SamplingHeapProfileType = ProfilerModule.HeapProfileView.SamplingHeapProfileType;
/** @constructor */
Profiler.SamplingHeapProfileNode = ProfilerModule.HeapProfileView.SamplingHeapProfileNode;
/** @constructor */
Profiler.HeapProfilerPanel = ProfilerModule.HeapProfilerPanel.HeapProfilerPanel;
/** @constructor */
Profiler.HeapSnapshotSortableDataGrid = ProfilerModule.HeapSnapshotDataGrids.HeapSnapshotSortableDataGrid;
/** @enum {symbol} */
Profiler.HeapSnapshotSortableDataGridEvents = ProfilerModule.HeapSnapshotDataGrids.HeapSnapshotSortableDataGridEvents;
/** @constructor */
Profiler.HeapSnapshotContainmentDataGrid = ProfilerModule.HeapSnapshotDataGrids.HeapSnapshotContainmentDataGrid;
/** @constructor */
Profiler.HeapSnapshotRetainmentDataGrid = ProfilerModule.HeapSnapshotDataGrids.HeapSnapshotRetainmentDataGrid;
/** @enum {symbol} */
Profiler.HeapSnapshotRetainmentDataGridEvents =
    ProfilerModule.HeapSnapshotDataGrids.HeapSnapshotRetainmentDataGridEvents;
/** @constructor */
Profiler.HeapSnapshotConstructorsDataGrid = ProfilerModule.HeapSnapshotDataGrids.HeapSnapshotConstructorsDataGrid;
/** @constructor */
Profiler.HeapSnapshotDiffDataGrid = ProfilerModule.HeapSnapshotDataGrids.HeapSnapshotDiffDataGrid;
/** @constructor */
Profiler.HeapSnapshotGridNode = ProfilerModule.HeapSnapshotGridNodes.HeapSnapshotGridNode;
/** @constructor */
Profiler.HeapSnapshotDiffNode = ProfilerModule.HeapSnapshotGridNodes.HeapSnapshotDiffNode;
/** @constructor */
Profiler.HeapSnapshotProxy = ProfilerModule.HeapSnapshotProxy.HeapSnapshotProxy;
/** @constructor */
Profiler.HeapSnapshotWorkerProxy = ProfilerModule.HeapSnapshotProxy.HeapSnapshotWorkerProxy;
/** @constructor */
Profiler.HeapSnapshotProviderProxy = ProfilerModule.HeapSnapshotProxy.HeapSnapshotProviderProxy;
/** @constructor */
Profiler.HeapSnapshotView = ProfilerModule.HeapSnapshotView.HeapSnapshotView;
/** @constructor */
Profiler.HeapSnapshotProfileType = ProfilerModule.HeapSnapshotView.HeapSnapshotProfileType;
/** @constructor */
Profiler.HeapProfileHeader = ProfilerModule.HeapSnapshotView.HeapProfileHeader;
/** @constructor */
Profiler.HeapTimelineOverview = ProfilerModule.HeapTimelineOverview.HeapTimelineOverview;
/** @constructor */
Profiler.IsolateSelector = ProfilerModule.IsolateSelector.IsolateSelector;
/** @constructor */
Profiler.LiveHeapProfileView = ProfilerModule.LiveHeapProfileView.LiveHeapProfileView;
/** @constructor */
Profiler.LiveHeapProfileView.ActionDelegate = ProfilerModule.LiveHeapProfileView.ActionDelegate;
/** @constructor */
Profiler.ProfileDataGridNode = ProfilerModule.ProfileDataGrid.ProfileDataGridNode;
/** @constructor */
Profiler.ProfileHeader = ProfilerModule.ProfileHeader.ProfileHeader;
/** @enum {symbol} */
Profiler.ProfileHeader.Events = ProfilerModule.ProfileHeader.Events;
/** @constructor */
Profiler.ProfileLauncherView = ProfilerModule.ProfileLauncherView.ProfileLauncherView;
/** @constructor */
Profiler.ProfileType = ProfilerModule.ProfileHeader.ProfileType;
/** @constructor */
Profiler.ProfileTypeRegistry = ProfilerModule.ProfileTypeRegistry.ProfileTypeRegistry;
Profiler.ProfileTypeRegistry.instance = ProfilerModule.ProfileTypeRegistry.instance;
/** @constructor */
Profiler.ProfileView = ProfilerModule.ProfileView.ProfileView;
/** @constructor */
Profiler.ProfilesPanel = ProfilerModule.ProfilesPanel.ProfilesPanel;
/** @constructor */
Profiler.ProfileTypeSidebarSection = ProfilerModule.ProfilesPanel.ProfileTypeSidebarSection;
/** @constructor */
Profiler.JSProfilerPanel = ProfilerModule.ProfilesPanel.JSProfilerPanel;
//# sourceMappingURL=profiler-legacy.js.map