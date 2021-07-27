import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
export declare class TimelineIRModel {
    _segments: Common.SegmentedRange.Segment[];
    _drags: Common.SegmentedRange.SegmentedRange;
    _cssAnimations: Common.SegmentedRange.SegmentedRange;
    _responses: Common.SegmentedRange.SegmentedRange;
    _scrolls: Common.SegmentedRange.SegmentedRange;
    constructor();
    static phaseForEvent(event: SDK.TracingModel.Event): Phases | undefined;
    populate(inputLatencies: SDK.TracingModel.AsyncEvent[] | null, animations: SDK.TracingModel.AsyncEvent[] | null): void;
    _processInputLatencies(events: SDK.TracingModel.AsyncEvent[]): void;
    _processAnimations(events: SDK.TracingModel.AsyncEvent[]): void;
    _segmentForEvent(event: SDK.TracingModel.AsyncEvent, phase: Phases): Common.SegmentedRange.Segment;
    _segmentForEventRange(startEvent: SDK.TracingModel.AsyncEvent, endEvent: SDK.TracingModel.AsyncEvent, phase: Phases): Common.SegmentedRange.Segment;
    _setPhaseForEvent(asyncEvent: SDK.TracingModel.AsyncEvent, phase: Phases): void;
    interactionRecords(): Common.SegmentedRange.Segment[];
    reset(): void;
    _inputEventType(eventName: string): InputEvents | null;
}
export declare enum Phases {
    Idle = "Idle",
    Response = "Response",
    Scroll = "Scroll",
    Fling = "Fling",
    Drag = "Drag",
    Animation = "Animation",
    Uncategorized = "Uncategorized"
}
export declare enum InputEvents {
    Char = "Char",
    Click = "GestureClick",
    ContextMenu = "ContextMenu",
    FlingCancel = "GestureFlingCancel",
    FlingStart = "GestureFlingStart",
    ImplSideFling = "InputHandlerProxy::HandleGestureFling::started",
    KeyDown = "KeyDown",
    KeyDownRaw = "RawKeyDown",
    KeyUp = "KeyUp",
    LatencyScrollUpdate = "ScrollUpdate",
    MouseDown = "MouseDown",
    MouseMove = "MouseMove",
    MouseUp = "MouseUp",
    MouseWheel = "MouseWheel",
    PinchBegin = "GesturePinchBegin",
    PinchEnd = "GesturePinchEnd",
    PinchUpdate = "GesturePinchUpdate",
    ScrollBegin = "GestureScrollBegin",
    ScrollEnd = "GestureScrollEnd",
    ScrollUpdate = "GestureScrollUpdate",
    ScrollUpdateRenderer = "ScrollUpdate",
    ShowPress = "GestureShowPress",
    Tap = "GestureTap",
    TapCancel = "GestureTapCancel",
    TapDown = "GestureTapDown",
    TouchCancel = "TouchCancel",
    TouchEnd = "TouchEnd",
    TouchMove = "TouchMove",
    TouchStart = "TouchStart"
}
export declare namespace TimelineIRModel {
    const _mergeThresholdsMs: {
        animation: number;
        mouse: number;
    };
    const _eventIRPhase: unique symbol;
}
