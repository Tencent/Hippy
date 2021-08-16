// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import { CPUProfileType } from './CPUProfileView.js';
import { SamplingHeapProfileType } from './HeapProfileView.js';
import { HeapSnapshotProfileType, TrackingHeapSnapshotProfileType } from './HeapSnapshotView.js';
export class ProfileTypeRegistry {
    cpuProfileType;
    heapSnapshotProfileType;
    samplingHeapProfileType;
    trackingHeapSnapshotProfileType;
    constructor() {
        this.cpuProfileType = new CPUProfileType();
        this.heapSnapshotProfileType = new HeapSnapshotProfileType();
        this.samplingHeapProfileType = new SamplingHeapProfileType();
        this.trackingHeapSnapshotProfileType = new TrackingHeapSnapshotProfileType();
    }
}
export const instance = new ProfileTypeRegistry();
//# sourceMappingURL=ProfileTypeRegistry.js.map