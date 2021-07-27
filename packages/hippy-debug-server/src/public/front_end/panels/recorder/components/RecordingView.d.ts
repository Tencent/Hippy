import type * as Recorder from '../../../models/recorder/recorder.js';
declare global {
    interface HTMLElementTagNameMap {
        'devtools-recoring-view': RecordingView;
    }
}
export interface RecordingViewData {
    isRecording: boolean;
    recording: Recorder.Steps.UserFlow;
}
export declare class RecordingToggledEvent extends Event {
    data: boolean;
    constructor(isRecording: boolean);
}
export declare class RecordingView extends HTMLElement {
    private readonly shadow;
    private userFlow;
    private isRecording;
    set data(data: RecordingViewData);
    connectedCallback(): void;
    scrollToBottom(): void;
    private handleToggleRecording;
    private render;
}
