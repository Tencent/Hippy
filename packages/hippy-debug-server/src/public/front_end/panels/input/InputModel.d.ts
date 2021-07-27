import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class InputModel extends SDK.SDKModel.SDKModel {
    _inputAgent: ProtocolProxyApi.InputApi;
    _eventDispatchTimer: number;
    _dispatchEventDataList: EventData[];
    _finishCallback: (() => void) | null;
    _dispatchingIndex: number;
    _lastEventTime?: number | null;
    _replayPaused?: boolean;
    constructor(target: SDK.Target.Target);
    _reset(): void;
    setEvents(tracingModel: SDK.TracingModel.TracingModel): void;
    startReplay(finishCallback: (() => void) | null): void;
    pause(): void;
    resume(): void;
    _processThreadEvents(_tracingModel: SDK.TracingModel.TracingModel, thread: SDK.TracingModel.Thread): void;
    _isValidInputEvent(eventData: EventData): boolean;
    _isMouseEvent(eventData: MouseEventData): boolean;
    _isKeyboardEvent(eventData: KeyboardEventData): boolean;
    _dispatchNextEvent(): void;
    _dispatchMouseEvent(eventData: MouseEventData): Promise<void>;
    _dispatchKeyEvent(eventData: KeyboardEventData): Promise<void>;
    _replayStopped(): void;
}
export interface MouseEventData {
    type: string;
    modifiers: number;
    timestamp: number;
    x: number;
    y: number;
    button: number;
    buttons: number;
    clickCount: number;
    deltaX: number;
    deltaY: number;
}
export interface KeyboardEventData {
    type: string;
    modifiers: number;
    timestamp: number;
    code: string;
    key: string;
}
export declare type EventData = MouseEventData | KeyboardEventData;
