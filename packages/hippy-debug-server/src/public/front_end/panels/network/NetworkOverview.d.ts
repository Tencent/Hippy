import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import { NetworkTimeBoundary } from './NetworkTimeCalculator.js';
export declare class NetworkOverview extends PerfUI.TimelineOverviewPane.TimelineOverviewBase {
    _selectedFilmStripTime: number;
    _numBands: number;
    _updateScheduled: boolean;
    _highlightedRequest: SDK.NetworkRequest.NetworkRequest | null;
    _loadEvents: number[];
    _domContentLoadedEvents: number[];
    _nextBand: number;
    _bandMap: Map<string, number>;
    _requestsList: SDK.NetworkRequest.NetworkRequest[];
    _requestsSet: Set<SDK.NetworkRequest.NetworkRequest>;
    _span: number;
    _filmStripModel?: SDK.FilmStripModel.FilmStripModel | null;
    _lastBoundary?: NetworkTimeBoundary | null;
    constructor();
    setHighlightedRequest(request: SDK.NetworkRequest.NetworkRequest | null): void;
    setFilmStripModel(filmStripModel: SDK.FilmStripModel.FilmStripModel | null): void;
    selectFilmStripFrame(time: number): void;
    clearFilmStripFrame(): void;
    _loadEventFired(event: Common.EventTarget.EventTargetEvent): void;
    _domContentLoadedEventFired(event: Common.EventTarget.EventTargetEvent): void;
    _bandId(connectionId: string): number;
    updateRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    wasShown(): void;
    calculator(): PerfUI.TimelineOverviewPane.TimelineOverviewCalculator;
    onResize(): void;
    reset(): void;
    scheduleUpdate(): void;
    update(): void;
}
export declare const RequestTimeRangeNameToColor: {
    [key: string]: string;
};
export declare const _bandHeight: number;
export declare const _padding: number;
