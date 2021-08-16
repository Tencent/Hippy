import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import { RecordType } from './TimelineModel.js';
import { TracingLayerTree } from './TracingLayerTree.js';
export declare class TimelineFrameModel {
    _categoryMapper: (arg0: SDK.TracingModel.Event) => string;
    _frames: TimelineFrame[];
    _frameById: {
        [x: number]: TimelineFrame;
    };
    _minimumRecordTime: number;
    _lastFrame: TimelineFrame | null;
    _mainFrameCommitted: boolean;
    _mainFrameRequested: boolean;
    _lastLayerTree: TracingFrameLayerTree | null;
    _framePendingActivation: PendingFrame | null;
    _currentTaskTimeByCategory: {
        [x: string]: number;
    };
    _target: SDK.Target.Target | null;
    _framePendingCommit?: PendingFrame | null;
    _lastBeginFrame?: number | null;
    _lastDroppedFrame?: number | null;
    _lastNeedsBeginFrame?: number | null;
    _lastTaskBeginTime?: number | null;
    _layerTreeId?: number | null;
    _currentProcessMainThread?: SDK.TracingModel.Thread | null;
    constructor(categoryMapper: (arg0: SDK.TracingModel.Event) => string);
    frames(startTime?: number, endTime?: number): TimelineFrame[];
    hasRasterTile(rasterTask: SDK.TracingModel.Event): boolean;
    rasterTilePromise(rasterTask: SDK.TracingModel.Event): Promise<{
        rect: Protocol.DOM.Rect;
        snapshot: SDK.PaintProfiler.PaintProfilerSnapshot;
    } | null>;
    reset(): void;
    handleBeginFrame(startTime: number): void;
    handleDroppedFrame(startTime: number): void;
    handleDrawFrame(startTime: number): void;
    handleActivateLayerTree(): void;
    handleRequestMainThreadFrame(): void;
    handleCompositeLayers(): void;
    handleLayerTreeSnapshot(layerTree: TracingFrameLayerTree): void;
    handleNeedFrameChanged(startTime: number, needsBeginFrame: boolean): void;
    _startFrame(startTime: number): void;
    _flushFrame(frame: TimelineFrame, endTime: number): void;
    _commitPendingFrame(): void;
    addTraceEvents(target: SDK.Target.Target | null, events: SDK.TracingModel.Event[], threadData: {
        thread: SDK.TracingModel.Thread;
        time: number;
    }[]): void;
    _addTraceEvent(event: SDK.TracingModel.Event): void;
    _processCompositorEvents(event: SDK.TracingModel.Event): void;
    _addMainThreadTraceEvent(event: SDK.TracingModel.Event): void;
    _addTimeForCategory(timeByCategory: {
        [x: string]: number;
    }, event: SDK.TracingModel.Event): void;
    static readonly _mainFrameMarkers: RecordType[];
}
export declare class TracingFrameLayerTree {
    _target: SDK.Target.Target;
    _snapshot: SDK.TracingModel.ObjectSnapshot;
    _paints: LayerPaintEvent[] | undefined;
    constructor(target: SDK.Target.Target, snapshot: SDK.TracingModel.ObjectSnapshot);
    layerTreePromise(): Promise<TracingLayerTree | null>;
    paints(): LayerPaintEvent[];
    _setPaints(paints: LayerPaintEvent[]): void;
}
export declare class TimelineFrame {
    startTime: number;
    startTimeOffset: number;
    endTime: number;
    duration: number;
    timeByCategory: {
        [x: string]: number;
    };
    cpuTime: number;
    idle: boolean;
    dropped: boolean;
    layerTree: TracingFrameLayerTree | null;
    _paints: LayerPaintEvent[];
    _mainFrameId: number | undefined;
    constructor(startTime: number, startTimeOffset: number);
    hasWarnings(): boolean;
    _setEndTime(endTime: number): void;
    _setLayerTree(layerTree: TracingFrameLayerTree | null): void;
    _addTimeForCategories(timeByCategory: {
        [x: string]: number;
    }): void;
    _addTimeForCategory(category: string, time: number): void;
}
export declare class LayerPaintEvent {
    _event: SDK.TracingModel.Event;
    _target: SDK.Target.Target | null;
    constructor(event: SDK.TracingModel.Event, target: SDK.Target.Target | null);
    layerId(): string;
    event(): SDK.TracingModel.Event;
    picturePromise(): Promise<{
        rect: Array<number>;
        serializedPicture: string;
    } | null>;
    snapshotPromise(): Promise<{
        rect: Array<number>;
        snapshot: SDK.PaintProfiler.PaintProfilerSnapshot;
    } | null>;
}
export declare class PendingFrame {
    timeByCategory: {
        [x: string]: number;
    };
    paints: LayerPaintEvent[];
    mainFrameId: number | undefined;
    triggerTime: number;
    constructor(triggerTime: number, timeByCategory: {
        [x: string]: number;
    });
}
