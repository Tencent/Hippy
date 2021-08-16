import * as Common from '../../../../core/common/common.js';
import type * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
import { OverviewGrid } from './OverviewGrid.js';
import type { Calculator } from './TimelineGrid.js';
export declare class TimelineOverviewPane extends UI.Widget.VBox {
    _overviewCalculator: TimelineOverviewCalculator;
    _overviewGrid: OverviewGrid;
    _cursorArea: HTMLElement;
    _cursorElement: HTMLElement;
    _overviewControls: TimelineOverview[];
    _markers: Map<number, Element>;
    _overviewInfo: OverviewInfo;
    _updateThrottler: Common.Throttler.Throttler;
    _cursorEnabled: boolean;
    _cursorPosition: number;
    _lastWidth: number;
    _windowStartTime: number;
    _windowEndTime: number;
    _muteOnWindowChanged: boolean;
    constructor(prefix: string);
    _onMouseMove(event: Event): void;
    _buildOverviewInfo(): Promise<DocumentFragment>;
    _hideCursor(): void;
    wasShown(): void;
    willHide(): void;
    onResize(): void;
    setOverviewControls(overviewControls: TimelineOverview[]): void;
    setBounds(minimumBoundary: number, maximumBoundary: number): void;
    setNavStartTimes(navStartTimes: Map<string, SDK.TracingModel.Event>): void;
    scheduleUpdate(): void;
    _update(): void;
    setMarkers(markers: Map<number, Element>): void;
    _updateMarkers(): void;
    reset(): void;
    _onClick(event: Event): boolean;
    _onWindowChanged(event: Common.EventTarget.EventTargetEvent): void;
    setWindowTimes(startTime: number, endTime: number): void;
    _updateWindow(): void;
}
export declare enum Events {
    WindowChanged = "WindowChanged"
}
export declare class TimelineOverviewCalculator implements Calculator {
    _minimumBoundary: number;
    _maximumBoundary: number;
    _workingArea: number;
    _navStartTimes?: Map<string, SDK.TracingModel.Event>;
    constructor();
    computePosition(time: number): number;
    positionToTime(position: number): number;
    setBounds(minimumBoundary: number, maximumBoundary: number): void;
    setNavStartTimes(navStartTimes: Map<string, SDK.TracingModel.Event>): void;
    setDisplayWidth(clientWidth: number): void;
    reset(): void;
    formatValue(value: number, precision?: number): string;
    maximumBoundary(): number;
    minimumBoundary(): number;
    zeroTime(): number;
    boundarySpan(): number;
}
export interface TimelineOverview {
    show(parentElement: Element, insertBefore?: Element | null): void;
    update(): void;
    dispose(): void;
    reset(): void;
    overviewInfoPromise(x: number): Promise<Element | null>;
    onClick(event: Event): boolean;
    setCalculator(calculator: TimelineOverviewCalculator): void;
}
export declare class TimelineOverviewBase extends UI.Widget.VBox implements TimelineOverview {
    _calculator: TimelineOverviewCalculator | null;
    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D | null;
    constructor();
    width(): number;
    height(): number;
    context(): CanvasRenderingContext2D;
    calculator(): TimelineOverviewCalculator | null;
    update(): void;
    dispose(): void;
    reset(): void;
    overviewInfoPromise(_x: number): Promise<Element | null>;
    setCalculator(calculator: TimelineOverviewCalculator): void;
    onClick(_event: Event): boolean;
    resetCanvas(): void;
    setCanvasSize(width: number, height: number): void;
}
export declare class OverviewInfo {
    _anchorElement: Element;
    _glassPane: UI.GlassPane.GlassPane;
    _visible: boolean;
    _element: Element;
    constructor(anchor: Element);
    setContent(contentPromise: Promise<DocumentFragment>): Promise<void>;
    hide(): void;
}
