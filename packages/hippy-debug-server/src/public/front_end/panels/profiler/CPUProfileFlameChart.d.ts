/**
 * Copyright (C) 2014 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../core/common/common.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ProfileFlameChartDataProvider implements PerfUI.FlameChart.FlameChartDataProvider {
    _colorGenerator: Common.Color.Generator;
    _maxStackDepth: number;
    timelineData_: PerfUI.FlameChart.TimelineData | null;
    entryNodes: SDK.ProfileTreeModel.ProfileNode[];
    _font?: string;
    _boldFont?: string;
    constructor();
    static colorGenerator(): Common.Color.Generator;
    minimumBoundary(): number;
    totalTime(): number;
    formatValue(value: number, precision?: number): string;
    maxStackDepth(): number;
    timelineData(): PerfUI.FlameChart.TimelineData | null;
    _calculateTimelineData(): PerfUI.FlameChart.TimelineData;
    prepareHighlightedEntryInfo(_entryIndex: number): Element | null;
    canJumpToEntry(entryIndex: number): boolean;
    entryTitle(entryIndex: number): string;
    entryFont(entryIndex: number): string | null;
    entryHasDeoptReason(_entryIndex: number): boolean;
    entryColor(entryIndex: number): string;
    decorateEntry(_entryIndex: number, _context: CanvasRenderingContext2D, _text: string | null, _barX: number, _barY: number, _barWidth: number, _barHeight: number): boolean;
    forceDecoration(_entryIndex: number): boolean;
    textColor(_entryIndex: number): string;
    navStartTimes(): Map<string, SDK.TracingModel.Event>;
    entryNodesLength(): number;
}
export declare class CPUProfileFlameChart extends UI.Widget.VBox implements UI.SearchableView.Searchable {
    _searchableView: UI.SearchableView.SearchableView;
    _overviewPane: OverviewPane;
    _mainPane: PerfUI.FlameChart.FlameChart;
    _entrySelected: boolean;
    _dataProvider: ProfileFlameChartDataProvider;
    _searchResults: number[];
    _searchResultIndex: number;
    constructor(searchableView: UI.SearchableView.SearchableView, dataProvider: ProfileFlameChartDataProvider);
    focus(): void;
    _onWindowChanged(event: Common.EventTarget.EventTargetEvent): void;
    selectRange(timeLeft: number, timeRight: number): void;
    _onEntrySelected(event: Common.EventTarget.EventTargetEvent): void;
    _onEntryInvoked(event: Common.EventTarget.EventTargetEvent): void;
    update(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, _shouldJump: boolean, jumpBackwards?: boolean): void;
    searchCanceled(): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
}
export declare class OverviewCalculator implements PerfUI.TimelineGrid.Calculator {
    _formatter: (arg0: number, arg1?: number | undefined) => string;
    _minimumBoundaries: number;
    _maximumBoundaries: number;
    _xScaleFactor: number;
    constructor(formatter: (arg0: number, arg1?: number | undefined) => string);
    _updateBoundaries(overviewPane: OverviewPane): void;
    computePosition(time: number): number;
    formatValue(value: number, precision?: number): string;
    maximumBoundary(): number;
    minimumBoundary(): number;
    zeroTime(): number;
    boundarySpan(): number;
}
export declare class OverviewPane extends UI.Widget.VBox implements PerfUI.FlameChart.FlameChartDelegate {
    _overviewContainer: HTMLElement;
    _overviewCalculator: OverviewCalculator;
    _overviewGrid: PerfUI.OverviewGrid.OverviewGrid;
    _overviewCanvas: HTMLCanvasElement;
    _dataProvider: PerfUI.FlameChart.FlameChartDataProvider;
    _windowTimeLeft?: number;
    _windowTimeRight?: number;
    _updateTimerId?: number;
    constructor(dataProvider: PerfUI.FlameChart.FlameChartDataProvider);
    windowChanged(windowStartTime: number, windowEndTime: number): void;
    updateRangeSelection(_startTime: number, _endTime: number): void;
    updateSelectedGroup(_flameChart: PerfUI.FlameChart.FlameChart, _group: PerfUI.FlameChart.Group | null): void;
    _selectRange(timeLeft: number, timeRight: number): void;
    _onWindowChanged(event: Common.EventTarget.EventTargetEvent): void;
    _timelineData(): PerfUI.FlameChart.TimelineData | null;
    onResize(): void;
    _scheduleUpdate(): void;
    update(): void;
    _drawOverviewCanvas(): void;
    _calculateDrawData(width: number): Uint8Array;
    _resetCanvas(width: number, height: number): void;
}
