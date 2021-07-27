// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as HeapSnapshotModelModule from './heap_snapshot_model.js';
self.HeapSnapshotModel = self.HeapSnapshotModel || {};
HeapSnapshotModel = HeapSnapshotModel || {};
HeapSnapshotModel.HeapSnapshotProgressEvent = HeapSnapshotModelModule.HeapSnapshotModel.HeapSnapshotProgressEvent;
HeapSnapshotModel.baseSystemDistance = HeapSnapshotModelModule.HeapSnapshotModel.baseSystemDistance;
/** @constructor */
HeapSnapshotModel.AllocationNodeCallers = HeapSnapshotModelModule.HeapSnapshotModel.AllocationNodeCallers;
/** @constructor */
HeapSnapshotModel.SerializedAllocationNode = HeapSnapshotModelModule.HeapSnapshotModel.SerializedAllocationNode;
/** @constructor */
HeapSnapshotModel.AllocationStackFrame = HeapSnapshotModelModule.HeapSnapshotModel.AllocationStackFrame;
/** @constructor */
HeapSnapshotModel.Node = HeapSnapshotModelModule.HeapSnapshotModel.Node;
/** @constructor */
HeapSnapshotModel.Edge = HeapSnapshotModelModule.HeapSnapshotModel.Edge;
/** @constructor */
HeapSnapshotModel.Aggregate = HeapSnapshotModelModule.HeapSnapshotModel.Aggregate;
/** @constructor */
HeapSnapshotModel.AggregateForDiff = HeapSnapshotModelModule.HeapSnapshotModel.AggregateForDiff;
/** @constructor */
HeapSnapshotModel.Diff = HeapSnapshotModelModule.HeapSnapshotModel.Diff;
/** @constructor */
HeapSnapshotModel.DiffForClass = HeapSnapshotModelModule.HeapSnapshotModel.DiffForClass;
/** @constructor */
HeapSnapshotModel.ComparatorConfig = HeapSnapshotModelModule.HeapSnapshotModel.ComparatorConfig;
/** @constructor */
HeapSnapshotModel.WorkerCommand = HeapSnapshotModelModule.HeapSnapshotModel.WorkerCommand;
/** @constructor */
HeapSnapshotModel.ItemsRange = HeapSnapshotModelModule.HeapSnapshotModel.ItemsRange;
/** @constructor */
HeapSnapshotModel.StaticData = HeapSnapshotModelModule.HeapSnapshotModel.StaticData;
/** @constructor */
HeapSnapshotModel.Statistics = HeapSnapshotModelModule.HeapSnapshotModel.Statistics;
/** @constructor */
HeapSnapshotModel.NodeFilter = HeapSnapshotModelModule.HeapSnapshotModel.NodeFilter;
/** @constructor */
HeapSnapshotModel.SearchConfig = HeapSnapshotModelModule.HeapSnapshotModel.SearchConfig;
/** @constructor */
HeapSnapshotModel.Samples = HeapSnapshotModelModule.HeapSnapshotModel.Samples;
/** @constructor */
HeapSnapshotModel.Location = HeapSnapshotModelModule.HeapSnapshotModel.Location;
//# sourceMappingURL=heap_snapshot_model-legacy.js.map