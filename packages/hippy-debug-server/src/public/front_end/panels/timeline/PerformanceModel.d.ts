import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
export declare class PerformanceModel extends Common.ObjectWrapper.ObjectWrapper {
    _mainTarget: SDK.Target.Target | null;
    _tracingModel: SDK.TracingModel.TracingModel | null;
    _filters: TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    _timelineModel: TimelineModel.TimelineModel.TimelineModelImpl;
    _frameModel: TimelineModel.TimelineFrameModel.TimelineFrameModel;
    _filmStripModel: SDK.FilmStripModel.FilmStripModel | null;
    _irModel: TimelineModel.TimelineIRModel.TimelineIRModel;
    _window: Window;
    _extensionTracingModels: {
        title: string;
        model: SDK.TracingModel.TracingModel;
        timeOffset: number;
    }[];
    _recordStartTime?: number;
    constructor();
    setMainTarget(target: SDK.Target.Target): void;
    mainTarget(): SDK.Target.Target | null;
    setRecordStartTime(time: number): void;
    recordStartTime(): number | undefined;
    setFilters(filters: TimelineModel.TimelineModelFilter.TimelineModelFilter[]): void;
    filters(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    isVisible(event: SDK.TracingModel.Event): boolean;
    setTracingModel(model: SDK.TracingModel.TracingModel): void;
    addExtensionEvents(title: string, model: SDK.TracingModel.TracingModel, timeOffset: number): void;
    tracingModel(): SDK.TracingModel.TracingModel;
    timelineModel(): TimelineModel.TimelineModel.TimelineModelImpl;
    filmStripModel(): SDK.FilmStripModel.FilmStripModel;
    frames(): TimelineModel.TimelineFrameModel.TimelineFrame[];
    frameModel(): TimelineModel.TimelineFrameModel.TimelineFrameModel;
    interactionRecords(): Common.SegmentedRange.Segment[];
    extensionInfo(): {
        title: string;
        model: SDK.TracingModel.TracingModel;
    }[];
    dispose(): void;
    filmStripModelFrame(frame: TimelineModel.TimelineFrameModel.TimelineFrame): SDK.FilmStripModel.Frame | null;
    save(stream: Common.StringOutputStream.OutputStream): Promise<DOMError | null>;
    setWindow(window: Window, animate?: boolean): void;
    window(): Window;
    _autoWindowTimes(): void;
}
export declare enum Events {
    ExtensionDataAdded = "ExtensionDataAdded",
    WindowChanged = "WindowChanged"
}
export interface Window {
    left: number;
    right: number;
}
