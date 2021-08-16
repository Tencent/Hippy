/**
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
import * as Common from '../../../../core/common/common.js';
import type * as SDK from '../../../../core/sdk/sdk.js';
import type * as TimelineModel from '../../../../models/timeline_model/timeline_model.js';
import * as UI from '../../legacy.js';
import type { ChartViewportDelegate } from './ChartViewport.js';
import { ChartViewport } from './ChartViewport.js';
import type { Calculator } from './TimelineGrid.js';
export declare class FlameChartDelegate {
    windowChanged(_startTime: number, _endTime: number, _animate: boolean): void;
    updateRangeSelection(_startTime: number, _endTime: number): void;
    updateSelectedGroup(_flameChart: FlameChart, _group: Group | null): void;
}
interface GroupExpansionState {
    [key: string]: boolean;
}
export declare class FlameChart extends UI.Widget.VBox implements Calculator, ChartViewportDelegate {
    _groupExpansionSetting?: Common.Settings.Setting<GroupExpansionState>;
    _groupExpansionState: GroupExpansionState;
    _flameChartDelegate: FlameChartDelegate;
    _useWebGL: boolean;
    _chartViewport: ChartViewport;
    _dataProvider: FlameChartDataProvider;
    _candyStripeCanvas: HTMLCanvasElement;
    _viewportElement: HTMLElement;
    _canvasGL: HTMLCanvasElement;
    _canvas: HTMLCanvasElement;
    _entryInfo: HTMLElement;
    _markerHighlighElement: HTMLElement;
    _highlightElement: HTMLElement;
    _selectedElement: HTMLElement;
    _rulerEnabled: boolean;
    _rangeSelectionStart: number;
    _rangeSelectionEnd: number;
    _barHeight: number;
    _textBaseline: number;
    _textPadding: number;
    _markerRadius: number;
    _headerLeftPadding: number;
    _arrowSide: number;
    _expansionArrowIndent: number;
    _headerLabelXPadding: number;
    _headerLabelYPadding: number;
    _highlightedMarkerIndex: number;
    _highlightedEntryIndex: number;
    _selectedEntryIndex: number;
    _rawTimelineDataLength: number;
    _textWidth: Map<string, Map<string, number>>;
    _markerPositions: Map<number, {
        x: number;
        width: number;
    }>;
    _lastMouseOffsetX: number;
    _selectedGroup: number;
    _keyboardFocusedGroup: number;
    _selectedGroupBackroundColor: string;
    _selectedGroupBorderColor: string;
    _offsetWidth: number;
    _offsetHeight: number;
    _dragStartX: number;
    _dragStartY: number;
    _lastMouseOffsetY: number;
    _minimumBoundary: number;
    _maxDragOffset: number;
    _shaderProgram?: WebGLProgram | null;
    _vertexBuffer?: WebGLBuffer | null;
    _colorBuffer?: WebGLBuffer | null;
    _uScalingFactor?: WebGLUniformLocation | null;
    _uShiftVector?: WebGLUniformLocation | null;
    _aVertexPosition?: number;
    _aVertexColor?: number;
    _vertexCount?: number;
    _prevTimelineData?: TimelineData;
    _timelineLevels?: number[][] | null;
    _visibleLevelOffsets?: Uint32Array | null;
    _visibleLevels?: Uint16Array | null;
    _groupOffsets?: Uint32Array | null;
    _rawTimelineData?: TimelineData | null;
    _forceDecorationCache?: Int8Array | null;
    _entryColorsCache?: string[] | null;
    _visibleLevelHeights?: Uint32Array;
    _totalTime?: number;
    constructor(dataProvider: FlameChartDataProvider, flameChartDelegate: FlameChartDelegate, groupExpansionSetting?: Common.Settings.Setting<GroupExpansionState>);
    willHide(): void;
    setBarHeight(value: number): void;
    setTextBaseline(value: number): void;
    setTextPadding(value: number): void;
    enableRuler(enable: boolean): void;
    alwaysShowVerticalScroll(): void;
    disableRangeSelection(): void;
    highlightEntry(entryIndex: number): void;
    hideHighlight(): void;
    _createCandyStripePattern(): void;
    _resetCanvas(): void;
    windowChanged(startTime: number, endTime: number, animate: boolean): void;
    updateRangeSelection(startTime: number, endTime: number): void;
    setSize(width: number, height: number): void;
    _startDragging(event: MouseEvent): boolean;
    _dragging(event: MouseEvent): void;
    _endDragging(_event: MouseEvent): void;
    _timelineData(): TimelineData | null;
    _revealEntry(entryIndex: number): void;
    setWindowTimes(startTime: number, endTime: number, animate?: boolean): void;
    _onMouseMove(event: Event): void;
    _updateHighlight(): void;
    _onMouseOut(): void;
    _updatePopover(entryIndex: number): void;
    _updatePopoverOffset(): void;
    _onClick(event: Event): void;
    _selectGroup(groupIndex: number): void;
    _deselectAllGroups(): void;
    _deselectAllEntries(): void;
    _isGroupFocused(index: number): boolean;
    _scrollGroupIntoView(index: number): void;
    _toggleGroupExpand(groupIndex: number): void;
    _expandGroup(groupIndex: number, setExpanded?: boolean | undefined, propagatedExpand?: boolean | undefined): void;
    _onKeyDown(e: KeyboardEvent): void;
    bindCanvasEvent(eventName: string, onEvent: (arg0: Event) => void): void;
    _handleKeyboardGroupNavigation(event: Event): void;
    _selectFirstEntryInCurrentGroup(): boolean;
    _selectPreviousGroup(): boolean;
    _selectNextGroup(): boolean;
    _getGroupIndexToSelect(offset: number): number;
    _selectFirstChild(): void;
    _handleSelectionNavigation(event: KeyboardEvent): boolean;
    _coordinatesToEntryIndex(x: number, y: number): number;
    _coordinatesToGroupIndex(x: number, y: number, headerOnly: boolean): number;
    _markerIndexAtPosition(x: number): number;
    _markerIndexBeforeTime(time: number): number;
    _draw(): void;
    _initWebGL(): void;
    _setupGLGeometry(): void;
    _drawGL(): void;
    _drawGroupHeaders(width: number, height: number): void;
    _forEachGroup(callback: (arg0: number, arg1: number, arg2: Group, arg3: boolean, arg4: number) => void): void;
    _forEachGroupInViewport(callback: (arg0: number, arg1: number, arg2: Group, arg3: boolean, arg4: number) => void): void;
    _labelWidthForGroup(context: CanvasRenderingContext2D, group: Group): number;
    _drawCollapsedOverviewForGroup(group: Group, y: number, endLevel: number): void;
    _drawFlowEvents(context: CanvasRenderingContext2D, _width: number, _height: number): void;
    _drawMarkers(): void;
    _updateMarkerHighlight(): void;
    _processTimelineData(timelineData: TimelineData | null): void;
    _updateLevelPositions(): void;
    _isGroupCollapsible(index: number): boolean | undefined;
    setSelectedEntry(entryIndex: number): void;
    _updateElementPosition(element: Element, entryIndex: number): void;
    _timeToPositionClipped(time: number): number;
    _levelToOffset(level: number): number;
    _levelHeight(level: number): number;
    _updateBoundaries(): void;
    _updateHeight(): void;
    onResize(): void;
    update(): void;
    reset(): void;
    scheduleUpdate(): void;
    _enabled(): boolean;
    computePosition(time: number): number;
    formatValue(value: number, precision?: number): string;
    maximumBoundary(): number;
    minimumBoundary(): number;
    zeroTime(): number;
    boundarySpan(): number;
}
export declare const HeaderHeight = 15;
export declare const MinimalTimeWindowMs = 0.5;
export declare class TimelineData {
    entryLevels: number[] | Uint16Array;
    entryTotalTimes: number[] | Float32Array;
    entryStartTimes: number[] | Float64Array;
    groups: Group[];
    markers: FlameChartMarker[];
    flowStartTimes: number[];
    flowStartLevels: number[];
    flowEndTimes: number[];
    flowEndLevels: number[];
    selectedGroup: Group | null;
    constructor(entryLevels: number[] | Uint16Array, entryTotalTimes: number[] | Float32Array, entryStartTimes: number[] | Float64Array, groups: Group[] | null);
}
/**
 * @interface
 */
export interface FlameChartDataProvider {
    minimumBoundary(): number;
    totalTime(): number;
    formatValue(value: number, precision?: number): string;
    maxStackDepth(): number;
    timelineData(): TimelineData | null;
    prepareHighlightedEntryInfo(entryIndex: number): Element | null;
    canJumpToEntry(entryIndex: number): boolean;
    entryTitle(entryIndex: number): string | null;
    entryFont(entryIndex: number): string | null;
    entryColor(entryIndex: number): string;
    decorateEntry(entryIndex: number, context: CanvasRenderingContext2D, text: string | null, barX: number, barY: number, barWidth: number, barHeight: number, unclippedBarX: number, timeToPixelRatio: number): boolean;
    forceDecoration(entryIndex: number): boolean;
    textColor(entryIndex: number): string;
    navStartTimes(): Map<string, SDK.TracingModel.Event>;
}
export interface FlameChartMarker {
    startTime(): number;
    color(): string;
    title(): string | null;
    draw(context: CanvasRenderingContext2D, x: number, height: number, pixelsPerMillisecond: number): void;
}
export declare enum Events {
    CanvasFocused = "CanvasFocused",
    EntryInvoked = "EntryInvoked",
    EntrySelected = "EntrySelected",
    EntryHighlighted = "EntryHighlighted"
}
export declare const Colors: {
    SelectedGroupBackground: string;
    SelectedGroupBorder: string;
};
export interface Group {
    name: Common.UIString.LocalizedString;
    startLevel: number;
    expanded?: boolean;
    selectable?: boolean;
    style: {
        height: number;
        padding: number;
        collapsible: boolean;
        font: string;
        color: string;
        backgroundColor: string;
        nestingLevel: number;
        itemsHeight?: number;
        shareHeaderLine?: boolean;
        useFirstLineForOverview?: boolean;
        useDecoratorsForOverview?: boolean;
    };
    track?: TimelineModel.TimelineModel.Track | null;
}
export interface GroupStyle {
    height: number;
    padding: number;
    collapsible: boolean;
    font: string;
    color: string;
    backgroundColor: string;
    nestingLevel: number;
    itemsHeight?: number;
    shareHeaderLine?: boolean;
    useFirstLineForOverview?: boolean;
    useDecoratorsForOverview?: boolean;
}
export {};
