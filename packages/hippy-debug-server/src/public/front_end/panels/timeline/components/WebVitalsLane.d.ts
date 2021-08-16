import type * as LitHtml from '../../../ui/lit-html/lit-html.js';
import type { Event, Marker, Timebox, WebVitalsTimeline } from './WebVitalsTimeline.js';
import { MarkerType } from './WebVitalsTimeline.js';
declare type GetMarkerTypeCallback = (event: Event) => MarkerType;
declare type GetMarkerOverlayCallback = (marker: Marker) => LitHtml.TemplateResult;
declare type GetTimeboxOverlayCallback = (marker: Timebox) => LitHtml.TemplateResult;
declare abstract class WebVitalsLane {
    protected context: CanvasRenderingContext2D;
    protected timeline: WebVitalsTimeline;
    protected theme: {
        [key: string]: string;
    };
    constructor(timeline: WebVitalsTimeline);
    abstract handlePointerMove(x: number | null): void;
    abstract handleClick(x: number | null): void;
    protected tX(x: number): number;
    protected tD(x: number): number;
    protected renderLaneLabel(label: string): void;
    render(): void;
}
export declare class WebVitalsEventLane extends WebVitalsLane {
    private markers;
    private selectedMarker;
    private hoverMarker;
    private labelMetrics;
    private label;
    private getMarkerType;
    private getMarkerOverlay?;
    constructor(timeline: WebVitalsTimeline, label: string, getMarkerType: GetMarkerTypeCallback, getMarkerOverlay?: GetMarkerOverlayCallback);
    handlePointerMove(x: number | null): void;
    handleClick(_: number | null): void;
    setEvents(markers: readonly Event[]): void;
    private measureLabel;
    private measureTimestamp;
    private getMarker;
    private renderLabel;
    private renderTimestamp;
    private renderGoodMarkerSymbol;
    private renderMediumMarkerSymbol;
    private renderBadMarkerSymbol;
    private renderMarker;
    render(): void;
}
export declare class WebVitalsTimeboxLane extends WebVitalsLane {
    private longTaskPattern;
    private boxes;
    private label;
    private hoverBox;
    private selectedBox;
    private getTimeboxOverlay?;
    constructor(timeline: WebVitalsTimeline, label: string, getTimeboxOverlay?: GetTimeboxOverlayCallback);
    handlePointerMove(x: number | null): void;
    handleClick(_: number | null): void;
    setTimeboxes(boxes: readonly Timebox[]): void;
    private renderTimebox;
    render(): void;
}
export {};
