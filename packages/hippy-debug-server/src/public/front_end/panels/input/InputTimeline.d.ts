import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Timeline from '../timeline/timeline.js';
import { InputModel } from './InputModel.js';
export declare class InputTimeline extends UI.Widget.VBox implements Timeline.TimelineLoader.Client {
    _tracingClient: TracingClient | null;
    _tracingModel: SDK.TracingModel.TracingModel | null;
    _inputModel: InputModel | null;
    _state: State;
    _toggleRecordAction: UI.ActionRegistration.Action;
    _startReplayAction: UI.ActionRegistration.Action;
    _togglePauseAction: UI.ActionRegistration.Action;
    _panelToolbar: UI.Toolbar.Toolbar;
    _clearButton: UI.Toolbar.ToolbarButton;
    _loadButton: UI.Toolbar.ToolbarButton;
    _saveButton: UI.Toolbar.ToolbarButton;
    _fileSelectorElement?: HTMLInputElement;
    _loader?: Timeline.TimelineLoader.TimelineLoader;
    constructor();
    static instance(opts?: {
        forceNew: boolean;
    }): InputTimeline;
    _reset(): void;
    _createFileSelector(): void;
    wasShown(): void;
    willHide(): void;
    _setState(state: State): void;
    _isAvailableState(): boolean;
    _updateControls(): void;
    _toggleRecording(): void;
    _startReplay(): void;
    _toggleReplayPause(): void;
    /**
     * Saves all current events in a file (JSON format).
     */
    _saveToFile(): Promise<void>;
    _selectFileToLoad(): void;
    _loadFromFile(file: File): void;
    _startRecording(): Promise<void>;
    _stopRecording(): Promise<void>;
    _replayEvents(): Promise<void>;
    _pauseReplay(): void;
    _resumeReplay(): void;
    loadingStarted(): void;
    loadingProgress(_progress?: number): void;
    processingStarted(): void;
    loadingComplete(tracingModel: SDK.TracingModel.TracingModel | null): void;
    _recordingFailed(): void;
    replayStopped(): void;
}
export declare const enum State {
    Idle = "Idle",
    StartPending = "StartPending",
    Recording = "Recording",
    StopPending = "StopPending",
    Replaying = "Replaying",
    ReplayPaused = "ReplayPaused",
    Loading = "Loading"
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
    _innerHandleAction(inputTimeline: InputTimeline, actionId: string): void;
}
export declare class TracingClient implements SDK.TracingManager.TracingManagerClient {
    _target: SDK.Target.Target;
    _tracingManager: SDK.TracingManager.TracingManager | null;
    _client: InputTimeline;
    _tracingModel: SDK.TracingModel.TracingModel;
    _tracingCompleteCallback: (() => void) | null;
    constructor(target: SDK.Target.Target, client: InputTimeline);
    startRecording(): Promise<Object>;
    stopRecording(): Promise<void>;
    traceEventsCollected(events: SDK.TracingManager.EventPayload[]): void;
    tracingComplete(): void;
    tracingBufferUsage(_usage: number): void;
    eventsRetrievalProgress(_progress: number): void;
    _waitForTracingToStop(awaitTracingCompleteCallback: boolean): Promise<void>;
}
