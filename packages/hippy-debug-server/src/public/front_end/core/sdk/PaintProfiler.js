/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
export class PaintProfilerModel extends SDKModel {
    _layerTreeAgent;
    constructor(target) {
        super(target);
        this._layerTreeAgent = target.layerTreeAgent();
    }
    async loadSnapshotFromFragments(tiles) {
        const { snapshotId } = await this._layerTreeAgent.invoke_loadSnapshot({ tiles });
        return snapshotId ? new PaintProfilerSnapshot(this, snapshotId) : null;
    }
    loadSnapshot(encodedPicture) {
        const fragment = { x: 0, y: 0, picture: encodedPicture };
        return this.loadSnapshotFromFragments([fragment]);
    }
    async makeSnapshot(layerId) {
        const { snapshotId } = await this._layerTreeAgent.invoke_makeSnapshot({ layerId });
        return snapshotId ? new PaintProfilerSnapshot(this, snapshotId) : null;
    }
}
export class PaintProfilerSnapshot {
    _paintProfilerModel;
    _id;
    _refCount;
    constructor(paintProfilerModel, snapshotId) {
        this._paintProfilerModel = paintProfilerModel;
        this._id = snapshotId;
        this._refCount = 1;
    }
    release() {
        console.assert(this._refCount > 0, 'release is already called on the object');
        if (!--this._refCount) {
            this._paintProfilerModel._layerTreeAgent.invoke_releaseSnapshot({ snapshotId: this._id });
        }
    }
    addReference() {
        ++this._refCount;
        console.assert(this._refCount > 0, 'Referencing a dead object');
    }
    async replay(scale, fromStep, toStep) {
        const response = await this._paintProfilerModel._layerTreeAgent.invoke_replaySnapshot({ snapshotId: this._id, fromStep, toStep, scale: scale || 1.0 });
        return response.dataURL;
    }
    async profile(clipRect) {
        const response = await this._paintProfilerModel._layerTreeAgent.invoke_profileSnapshot({ snapshotId: this._id, minRepeatCount: 5, minDuration: 1, clipRect: clipRect || undefined });
        return response.timings;
    }
    async commandLog() {
        const response = await this._paintProfilerModel._layerTreeAgent.invoke_snapshotCommandLog({ snapshotId: this._id });
        return response.commandLog ? response.commandLog.map((entry, index) => new PaintProfilerLogItem(entry, index)) :
            null;
    }
}
export class PaintProfilerLogItem {
    method;
    params;
    commandIndex;
    constructor(rawEntry, commandIndex) {
        this.method = rawEntry.method;
        this.params = rawEntry.params;
        this.commandIndex = commandIndex;
    }
}
SDKModel.register(PaintProfilerModel, { capabilities: Capability.DOM, autostart: false });
//# sourceMappingURL=PaintProfiler.js.map