import * as LitHtml from '../../../ui/lit-html/lit-html.js';
declare global {
    interface HTMLElementTagNameMap {
        'devtools-timeline-webvitals': WebVitalsTimeline;
    }
}
export interface Event {
    timestamp: number;
}
export interface Timebox {
    start: number;
    duration: number;
}
export interface WebVitalsFCPEvent {
    timestamp: number;
}
export interface WebVitalsLCPEvent {
    timestamp: number;
}
export interface WebVitalsLayoutShiftEvent {
    timestamp: number;
}
interface WebVitalsTimelineTask {
    start: number;
    duration: number;
}
interface WebVitalsTimelineData {
    startTime: number;
    duration: number;
    fcps?: WebVitalsFCPEvent[];
    lcps?: WebVitalsLCPEvent[];
    layoutShifts?: WebVitalsLayoutShiftEvent[];
    longTasks?: WebVitalsTimelineTask[];
    mainFrameNavigations?: number[];
    maxDuration?: number;
}
export interface Marker {
    type: MarkerType;
    timestamp: number;
    timestampLabel: string;
    timestampMetrics: TextMetrics;
    widthIncludingLabel: number;
    widthIncludingTimestamp: number;
}
export declare const enum MarkerType {
    Good = "Good",
    Medium = "Medium",
    Bad = "Bad"
}
export declare const LINE_HEIGHT = 24;
export declare const LONG_TASK_THRESHOLD = 50;
declare type Constructor<T> = {
    new (...args: unknown[]): T;
};
export declare function assertInstanceOf<T>(instance: any, constructor: Constructor<T>): asserts instance is T;
export declare class WebVitalsTimeline extends HTMLElement {
    private readonly shadow;
    private mainFrameNavigations;
    private startTime;
    private duration;
    private maxDuration;
    private width;
    private height;
    private canvas;
    private hoverLane;
    private fcpLane;
    private lcpLane;
    private layoutShiftsLane;
    private longTasksLane;
    private context;
    private animationFrame;
    private overlay;
    constructor();
    set data(data: WebVitalsTimelineData);
    getContext(): CanvasRenderingContext2D;
    getLineHeight(): number;
    hideOverlay(): void;
    showOverlay(content: LitHtml.TemplateResult): void;
    private handlePointerMove;
    private updateOverlayPosition;
    private handlePointerOut;
    private handleClick;
    /**
     * Transform from time to pixel offset
     * @param x
     */
    tX(x: number): number;
    /**
     * Transform from duration to pixels
     * @param duration
     */
    tD(duration: number): number;
    setSize(width: number, height: number): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private getMarkerTypeForFCPEvent;
    private getMarkerTypeForLCPEvent;
    private getFCPMarkerOverlay;
    private getLCPMarkerOverlay;
    private getLongTaskOverlay;
    private renderMainFrameNavigations;
    getTimeSinceLastMainFrameNavigation(time: number): number;
    render(): void;
    private scheduleRender;
}
export {};
