import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import type * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
export interface Label {
    left: string;
    right: string;
    tooltip?: string;
}
export declare class NetworkTimeBoundary {
    minimum: number;
    maximum: number;
    constructor(minimum: number, maximum: number);
    equals(other: NetworkTimeBoundary): boolean;
}
export declare class NetworkTimeCalculator extends Common.ObjectWrapper.ObjectWrapper implements PerfUI.TimelineGrid.Calculator {
    startAtZero: boolean;
    _minimumBoundary: number;
    _maximumBoundary: number;
    _boundryChangedEventThrottler: Common.Throttler.Throttler;
    _window: NetworkTimeBoundary | null;
    _workingArea?: number;
    constructor(startAtZero: boolean);
    setWindow(window: NetworkTimeBoundary | null): void;
    setInitialUserFriendlyBoundaries(): void;
    computePosition(time: number): number;
    formatValue(value: number, precision?: number): string;
    minimumBoundary(): number;
    zeroTime(): number;
    maximumBoundary(): number;
    boundary(): NetworkTimeBoundary;
    boundarySpan(): number;
    reset(): void;
    _value(): number;
    setDisplayWidth(clientWidth: number): void;
    computeBarGraphPercentages(request: SDK.NetworkRequest.NetworkRequest): {
        start: number;
        middle: number;
        end: number;
    };
    computePercentageFromEventTime(eventTime: number): number;
    percentageToTime(percentage: number): number;
    _boundaryChanged(): void;
    updateBoundariesForEventTime(eventTime: number): void;
    computeBarGraphLabels(request: SDK.NetworkRequest.NetworkRequest): Label;
    updateBoundaries(request: SDK.NetworkRequest.NetworkRequest): void;
    _extendBoundariesToIncludeTimestamp(timestamp: number): boolean;
    _lowerBound(_request: SDK.NetworkRequest.NetworkRequest): number;
    _upperBound(_request: SDK.NetworkRequest.NetworkRequest): number;
}
export declare const _minimumSpread = 0.1;
export declare enum Events {
    BoundariesChanged = "BoundariesChanged"
}
export declare class NetworkTransferTimeCalculator extends NetworkTimeCalculator {
    constructor();
    formatValue(value: number, precision?: number): string;
    _lowerBound(request: SDK.NetworkRequest.NetworkRequest): number;
    _upperBound(request: SDK.NetworkRequest.NetworkRequest): number;
}
export declare class NetworkTransferDurationCalculator extends NetworkTimeCalculator {
    constructor();
    formatValue(value: number, precision?: number): string;
    _upperBound(request: SDK.NetworkRequest.NetworkRequest): number;
}
