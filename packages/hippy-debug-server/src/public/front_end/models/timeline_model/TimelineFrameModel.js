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
/* eslint-disable rulesdir/no_underscored_properties */
/* eslint-disable @typescript-eslint/naming-convention */
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import { RecordType, TimelineData } from './TimelineModel.js';
import { TracingLayerTree } from './TracingLayerTree.js';
export class TimelineFrameModel {
    _categoryMapper;
    _frames;
    _frameById;
    _minimumRecordTime;
    _lastFrame;
    _mainFrameCommitted;
    _mainFrameRequested;
    _lastLayerTree;
    _framePendingActivation;
    _currentTaskTimeByCategory;
    _target;
    _framePendingCommit;
    _lastBeginFrame;
    _lastDroppedFrame;
    _lastNeedsBeginFrame;
    _lastTaskBeginTime;
    _layerTreeId;
    _currentProcessMainThread;
    constructor(categoryMapper) {
        this._categoryMapper = categoryMapper;
        this.reset();
    }
    frames(startTime, endTime) {
        if (!startTime && !endTime) {
            return this._frames;
        }
        const firstFrame = Platform.ArrayUtilities.lowerBound(this._frames, startTime || 0, (time, frame) => time - frame.endTime);
        const lastFrame = Platform.ArrayUtilities.lowerBound(this._frames, endTime || Infinity, (time, frame) => time - frame.startTime);
        return this._frames.slice(firstFrame, lastFrame);
    }
    hasRasterTile(rasterTask) {
        const data = rasterTask.args['tileData'];
        if (!data) {
            return false;
        }
        const frameId = data['sourceFrameNumber'];
        const frame = frameId && this._frameById[frameId];
        if (!frame || !frame.layerTree) {
            return false;
        }
        return true;
    }
    rasterTilePromise(rasterTask) {
        if (!this._target) {
            return Promise.resolve(null);
        }
        const data = rasterTask.args['tileData'];
        const frameId = data['sourceFrameNumber'];
        const tileId = data['tileId'] && data['tileId']['id_ref'];
        const frame = frameId && this._frameById[frameId];
        if (!frame || !frame.layerTree || !tileId) {
            return Promise.resolve(null);
        }
        return frame.layerTree.layerTreePromise().then(layerTree => layerTree && layerTree.pictureForRasterTile(tileId));
    }
    reset() {
        this._minimumRecordTime = Infinity;
        this._frames = [];
        this._frameById = {};
        this._lastFrame = null;
        this._lastLayerTree = null;
        this._mainFrameCommitted = false;
        this._mainFrameRequested = false;
        this._framePendingCommit = null;
        this._lastBeginFrame = null;
        this._lastDroppedFrame = null;
        this._lastNeedsBeginFrame = null;
        this._framePendingActivation = null;
        this._lastTaskBeginTime = null;
        this._target = null;
        this._layerTreeId = null;
        this._currentTaskTimeByCategory = {};
    }
    handleBeginFrame(startTime) {
        if (!this._lastFrame) {
            this._startFrame(startTime);
        }
        this._lastBeginFrame = startTime;
    }
    handleDroppedFrame(startTime) {
        if (!this._lastFrame) {
            this._startFrame(startTime);
        }
        this._lastDroppedFrame = startTime;
    }
    handleDrawFrame(startTime) {
        if (!this._lastFrame) {
            this._startFrame(startTime);
            return;
        }
        // - if it wasn't drawn, it didn't happen!
        // - only show frames that either did not wait for the main thread frame or had one committed.
        if (this._mainFrameCommitted || !this._mainFrameRequested) {
            if (this._lastNeedsBeginFrame) {
                const idleTimeEnd = this._framePendingActivation ? this._framePendingActivation.triggerTime :
                    (this._lastBeginFrame || this._lastNeedsBeginFrame);
                if (idleTimeEnd > this._lastFrame.startTime) {
                    this._lastFrame.idle = true;
                    this._startFrame(idleTimeEnd);
                    if (this._framePendingActivation) {
                        this._commitPendingFrame();
                    }
                    this._lastBeginFrame = null;
                }
                this._lastNeedsBeginFrame = null;
            }
            if (this._lastDroppedFrame) {
                this._lastFrame.dropped = true;
                this._startFrame(this._lastDroppedFrame);
                this._lastDroppedFrame = null;
            }
            this._startFrame(startTime);
        }
        this._mainFrameCommitted = false;
    }
    handleActivateLayerTree() {
        if (!this._lastFrame) {
            return;
        }
        if (this._framePendingActivation && !this._lastNeedsBeginFrame) {
            this._commitPendingFrame();
        }
    }
    handleRequestMainThreadFrame() {
        if (!this._lastFrame) {
            return;
        }
        this._mainFrameRequested = true;
    }
    handleCompositeLayers() {
        if (!this._framePendingCommit) {
            return;
        }
        this._framePendingActivation = this._framePendingCommit;
        this._framePendingCommit = null;
        this._mainFrameRequested = false;
        this._mainFrameCommitted = true;
    }
    handleLayerTreeSnapshot(layerTree) {
        this._lastLayerTree = layerTree;
    }
    handleNeedFrameChanged(startTime, needsBeginFrame) {
        if (needsBeginFrame) {
            this._lastNeedsBeginFrame = startTime;
        }
    }
    _startFrame(startTime) {
        if (this._lastFrame) {
            this._flushFrame(this._lastFrame, startTime);
        }
        this._lastFrame = new TimelineFrame(startTime, startTime - this._minimumRecordTime);
    }
    _flushFrame(frame, endTime) {
        frame._setLayerTree(this._lastLayerTree);
        frame._setEndTime(endTime);
        if (this._lastLayerTree) {
            this._lastLayerTree._setPaints(frame._paints);
        }
        const lastFrame = this._frames[this._frames.length - 1];
        if (this._frames.length && lastFrame &&
            (frame.startTime !== lastFrame.endTime || frame.startTime > frame.endTime)) {
            console.assert(false, `Inconsistent frame time for frame ${this._frames.length} (${frame.startTime} - ${frame.endTime})`);
        }
        this._frames.push(frame);
        if (typeof frame._mainFrameId === 'number') {
            this._frameById[frame._mainFrameId] = frame;
        }
    }
    _commitPendingFrame() {
        if (!this._framePendingActivation || !this._lastFrame) {
            return;
        }
        this._lastFrame._addTimeForCategories(this._framePendingActivation.timeByCategory);
        this._lastFrame._paints = this._framePendingActivation.paints;
        this._lastFrame._mainFrameId = this._framePendingActivation.mainFrameId;
        this._framePendingActivation = null;
    }
    addTraceEvents(target, events, threadData) {
        this._target = target;
        let j = 0;
        this._currentProcessMainThread = threadData.length && threadData[0].thread || null;
        for (let i = 0; i < events.length; ++i) {
            while (j + 1 < threadData.length && threadData[j + 1].time <= events[i].startTime) {
                this._currentProcessMainThread = threadData[++j].thread;
            }
            this._addTraceEvent(events[i]);
        }
        this._currentProcessMainThread = null;
    }
    _addTraceEvent(event) {
        if (event.startTime && event.startTime < this._minimumRecordTime) {
            this._minimumRecordTime = event.startTime;
        }
        if (event.name === RecordType.SetLayerTreeId) {
            this._layerTreeId = event.args['layerTreeId'] || event.args['data']['layerTreeId'];
        }
        else if (event.id && event.phase === SDK.TracingModel.Phase.SnapshotObject &&
            event.name === RecordType.LayerTreeHostImplSnapshot && Number(event.id) === this._layerTreeId && this._target) {
            const snapshot = event;
            this.handleLayerTreeSnapshot(new TracingFrameLayerTree(this._target, snapshot));
        }
        else {
            this._processCompositorEvents(event);
            if (event.thread === this._currentProcessMainThread) {
                this._addMainThreadTraceEvent(event);
            }
            else if (this._lastFrame && event.selfTime && !SDK.TracingModel.TracingModel.isTopLevelEvent(event)) {
                this._lastFrame._addTimeForCategory(this._categoryMapper(event), event.selfTime);
            }
        }
    }
    _processCompositorEvents(event) {
        if (event.args['layerTreeId'] !== this._layerTreeId) {
            return;
        }
        const timestamp = event.startTime;
        if (event.name === RecordType.BeginFrame) {
            this.handleBeginFrame(timestamp);
        }
        else if (event.name === RecordType.DrawFrame) {
            if (event.phase === 'I') {
                // Legacy behavior: If DrawFrame is an instant event, then it is not
                // supposed to contain frame presentation info; use the event time of
                // DrawFrame in this case.
                // TODO(mjzhang): Remove this legacy support when the migration to
                // using presentation time as frame boundary is stablized.
                this.handleDrawFrame(timestamp);
            }
            else if (event.args['presentationTimestamp']) {
                // Current behavior: Use the presentation timestamp. If the non-instant
                // DrawFrame event contains no such timestamp, then the presentation did
                // not happen and therefore the event will not be processed.
                this.handleDrawFrame(event.args['presentationTimestamp'] / 1000);
            }
        }
        else if (event.name === RecordType.ActivateLayerTree) {
            this.handleActivateLayerTree();
        }
        else if (event.name === RecordType.RequestMainThreadFrame) {
            this.handleRequestMainThreadFrame();
        }
        else if (event.name === RecordType.NeedsBeginFrameChanged) {
            this.handleNeedFrameChanged(timestamp, event.args['data'] && event.args['data']['needsBeginFrame']);
        }
        else if (event.name === RecordType.DroppedFrame) {
            this.handleDroppedFrame(timestamp);
        }
    }
    _addMainThreadTraceEvent(event) {
        if (SDK.TracingModel.TracingModel.isTopLevelEvent(event)) {
            this._currentTaskTimeByCategory = {};
            this._lastTaskBeginTime = event.startTime;
        }
        if (!this._framePendingCommit && TimelineFrameModel._mainFrameMarkers.indexOf(event.name) >= 0) {
            this._framePendingCommit =
                new PendingFrame(this._lastTaskBeginTime || event.startTime, this._currentTaskTimeByCategory);
        }
        if (!this._framePendingCommit) {
            this._addTimeForCategory(this._currentTaskTimeByCategory, event);
            return;
        }
        this._addTimeForCategory(this._framePendingCommit.timeByCategory, event);
        if (event.name === RecordType.BeginMainThreadFrame && event.args['data'] && event.args['data']['frameId']) {
            this._framePendingCommit.mainFrameId = event.args['data']['frameId'];
        }
        if (event.name === RecordType.Paint && event.args['data']['layerId'] && TimelineData.forEvent(event).picture &&
            this._target) {
            this._framePendingCommit.paints.push(new LayerPaintEvent(event, this._target));
        }
        if (event.name === RecordType.CompositeLayers && event.args['layerTreeId'] === this._layerTreeId) {
            this.handleCompositeLayers();
        }
    }
    _addTimeForCategory(timeByCategory, event) {
        if (!event.selfTime) {
            return;
        }
        const categoryName = this._categoryMapper(event);
        timeByCategory[categoryName] = (timeByCategory[categoryName] || 0) + event.selfTime;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static _mainFrameMarkers = [
        RecordType.ScheduleStyleRecalculation,
        RecordType.InvalidateLayout,
        RecordType.BeginMainThreadFrame,
        RecordType.ScrollLayer,
    ];
}
export class TracingFrameLayerTree {
    _target;
    _snapshot;
    _paints;
    constructor(target, snapshot) {
        this._target = target;
        this._snapshot = snapshot;
    }
    async layerTreePromise() {
        const result = await this._snapshot.objectPromise();
        if (!result) {
            return null;
        }
        const viewport = result['device_viewport_size'];
        const tiles = result['active_tiles'];
        const rootLayer = result['active_tree']['root_layer'];
        const layers = result['active_tree']['layers'];
        const layerTree = new TracingLayerTree(this._target);
        layerTree.setViewportSize(viewport);
        layerTree.setTiles(tiles);
        await layerTree.setLayers(rootLayer, layers, this._paints || []);
        return layerTree;
    }
    paints() {
        return this._paints || [];
    }
    _setPaints(paints) {
        this._paints = paints;
    }
}
export class TimelineFrame {
    startTime;
    startTimeOffset;
    endTime;
    duration;
    timeByCategory;
    cpuTime;
    idle;
    dropped;
    layerTree;
    _paints;
    _mainFrameId;
    constructor(startTime, startTimeOffset) {
        this.startTime = startTime;
        this.startTimeOffset = startTimeOffset;
        this.endTime = this.startTime;
        this.duration = 0;
        this.timeByCategory = {};
        this.cpuTime = 0;
        this.idle = false;
        this.dropped = false;
        this.layerTree = null;
        this._paints = [];
        this._mainFrameId = undefined;
    }
    hasWarnings() {
        return false;
    }
    _setEndTime(endTime) {
        this.endTime = endTime;
        this.duration = this.endTime - this.startTime;
    }
    _setLayerTree(layerTree) {
        this.layerTree = layerTree;
    }
    _addTimeForCategories(timeByCategory) {
        for (const category in timeByCategory) {
            this._addTimeForCategory(category, timeByCategory[category]);
        }
    }
    _addTimeForCategory(category, time) {
        this.timeByCategory[category] = (this.timeByCategory[category] || 0) + time;
        this.cpuTime += time;
    }
}
export class LayerPaintEvent {
    _event;
    _target;
    constructor(event, target) {
        this._event = event;
        this._target = target;
    }
    layerId() {
        return this._event.args['data']['layerId'];
    }
    event() {
        return this._event;
    }
    picturePromise() {
        const picture = TimelineData.forEvent(this._event).picture;
        if (!picture) {
            return Promise.resolve(null);
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return picture.objectPromise().then((result) => {
            if (!result) {
                return null;
            }
            const rect = result['params'] && result['params']['layer_rect'];
            const picture = result['skp64'];
            return rect && picture ? { rect: rect, serializedPicture: picture } : null;
        });
    }
    async snapshotPromise() {
        const paintProfilerModel = this._target && this._target.model(SDK.PaintProfiler.PaintProfilerModel);
        const picture = await this.picturePromise();
        if (!picture || !paintProfilerModel) {
            return null;
        }
        const snapshot = await paintProfilerModel.loadSnapshot(picture.serializedPicture);
        return snapshot ? { rect: picture.rect, snapshot: snapshot } : null;
    }
}
export class PendingFrame {
    timeByCategory;
    paints;
    mainFrameId;
    triggerTime;
    constructor(triggerTime, timeByCategory) {
        this.timeByCategory = timeByCategory;
        this.paints = [];
        this.mainFrameId = undefined;
        this.triggerTime = triggerTime;
    }
}
//# sourceMappingURL=TimelineFrameModel.js.map