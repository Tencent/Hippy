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
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
let colorGeneratorInstance = null;
export class ProfileFlameChartDataProvider {
    _colorGenerator;
    _maxStackDepth;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    timelineData_;
    entryNodes;
    _font;
    _boldFont;
    constructor() {
        this._colorGenerator = ProfileFlameChartDataProvider.colorGenerator();
        this._maxStackDepth = 0;
        this.timelineData_ = null;
        this.entryNodes = [];
    }
    static colorGenerator() {
        if (!colorGeneratorInstance) {
            colorGeneratorInstance = new Common.Color.Generator({ min: 30, max: 330, count: undefined }, { min: 50, max: 80, count: 5 }, { min: 80, max: 90, count: 3 });
            colorGeneratorInstance.setColorForID('(idle)', 'hsl(0, 0%, 94%)');
            colorGeneratorInstance.setColorForID('(program)', 'hsl(0, 0%, 80%)');
            colorGeneratorInstance.setColorForID('(garbage collector)', 'hsl(0, 0%, 80%)');
        }
        return colorGeneratorInstance;
    }
    minimumBoundary() {
        throw 'Not implemented.';
    }
    totalTime() {
        throw 'Not implemented.';
    }
    formatValue(value, precision) {
        return i18n.i18n.preciseMillisToString(value, precision);
    }
    maxStackDepth() {
        return this._maxStackDepth;
    }
    timelineData() {
        return this.timelineData_ || this._calculateTimelineData();
    }
    _calculateTimelineData() {
        throw 'Not implemented.';
    }
    prepareHighlightedEntryInfo(_entryIndex) {
        throw 'Not implemented.';
    }
    canJumpToEntry(entryIndex) {
        return this.entryNodes[entryIndex].scriptId !== '0';
    }
    entryTitle(entryIndex) {
        const node = this.entryNodes[entryIndex];
        return UI.UIUtils.beautifyFunctionName(node.functionName);
    }
    entryFont(entryIndex) {
        if (!this._font) {
            this._font = '11px ' + Host.Platform.fontFamily();
            this._boldFont = 'bold ' + this._font;
        }
        return this.entryHasDeoptReason(entryIndex) ? this._boldFont : this._font;
    }
    entryHasDeoptReason(_entryIndex) {
        throw 'Not implemented.';
    }
    entryColor(entryIndex) {
        const node = this.entryNodes[entryIndex];
        // For idle and program, we want different 'shades of gray', so we fallback to functionName as scriptId = 0
        // For rest of nodes e.g eval scripts, if url is empty then scriptId will be guaranteed to be non-zero
        return this._colorGenerator.colorForID(node.url || (node.scriptId !== '0' ? node.scriptId : node.functionName));
    }
    decorateEntry(_entryIndex, _context, _text, _barX, _barY, _barWidth, _barHeight) {
        return false;
    }
    forceDecoration(_entryIndex) {
        return false;
    }
    textColor(_entryIndex) {
        return '#333';
    }
    navStartTimes() {
        return new Map();
    }
    entryNodesLength() {
        return this.entryNodes.length;
    }
}
export class CPUProfileFlameChart extends UI.Widget.VBox {
    _searchableView;
    _overviewPane;
    _mainPane;
    _entrySelected;
    _dataProvider;
    _searchResults;
    _searchResultIndex = -1;
    constructor(searchableView, dataProvider) {
        super();
        this.element.id = 'cpu-flame-chart';
        this._searchableView = searchableView;
        this._overviewPane = new OverviewPane(dataProvider);
        this._overviewPane.show(this.element);
        this._mainPane = new PerfUI.FlameChart.FlameChart(dataProvider, this._overviewPane);
        this._mainPane.setBarHeight(15);
        this._mainPane.setTextBaseline(4);
        this._mainPane.setTextPadding(2);
        this._mainPane.show(this.element);
        this._mainPane.addEventListener(PerfUI.FlameChart.Events.EntrySelected, this._onEntrySelected, this);
        this._mainPane.addEventListener(PerfUI.FlameChart.Events.EntryInvoked, this._onEntryInvoked, this);
        this._entrySelected = false;
        this._mainPane.addEventListener(PerfUI.FlameChart.Events.CanvasFocused, this._onEntrySelected, this);
        this._overviewPane.addEventListener(PerfUI.OverviewGrid.Events.WindowChanged, this._onWindowChanged, this);
        this._dataProvider = dataProvider;
        this._searchResults = [];
    }
    focus() {
        this._mainPane.focus();
    }
    _onWindowChanged(event) {
        const windowLeft = event.data.windowTimeLeft;
        const windowRight = event.data.windowTimeRight;
        this._mainPane.setWindowTimes(windowLeft, windowRight, /* animate */ true);
    }
    selectRange(timeLeft, timeRight) {
        this._overviewPane._selectRange(timeLeft, timeRight);
    }
    _onEntrySelected(event) {
        if (event.data) {
            const eventIndex = Number(event.data);
            this._mainPane.setSelectedEntry(eventIndex);
            if (eventIndex === -1) {
                this._entrySelected = false;
            }
            else {
                this._entrySelected = true;
            }
        }
        else if (!this._entrySelected) {
            this._mainPane.setSelectedEntry(0);
            this._entrySelected = true;
        }
    }
    _onEntryInvoked(event) {
        this._onEntrySelected(event);
        this.dispatchEventToListeners(PerfUI.FlameChart.Events.EntryInvoked, event.data);
    }
    update() {
        this._overviewPane.update();
        this._mainPane.update();
    }
    performSearch(searchConfig, _shouldJump, jumpBackwards) {
        const matcher = createPlainTextSearchRegex(searchConfig.query, searchConfig.caseSensitive ? '' : 'i');
        const selectedEntryIndex = this._searchResultIndex !== -1 ? this._searchResults[this._searchResultIndex] : -1;
        this._searchResults = [];
        const entriesCount = this._dataProvider.entryNodesLength();
        for (let index = 0; index < entriesCount; ++index) {
            if (this._dataProvider.entryTitle(index).match(matcher)) {
                this._searchResults.push(index);
            }
        }
        if (this._searchResults.length) {
            this._searchResultIndex = this._searchResults.indexOf(selectedEntryIndex);
            if (this._searchResultIndex === -1) {
                this._searchResultIndex = jumpBackwards ? this._searchResults.length - 1 : 0;
            }
            this._mainPane.setSelectedEntry(this._searchResults[this._searchResultIndex]);
        }
        else {
            this.searchCanceled();
        }
        this._searchableView.updateSearchMatchesCount(this._searchResults.length);
        this._searchableView.updateCurrentMatchIndex(this._searchResultIndex);
    }
    searchCanceled() {
        this._mainPane.setSelectedEntry(-1);
        this._searchResults = [];
        this._searchResultIndex = -1;
    }
    jumpToNextSearchResult() {
        this._searchResultIndex = (this._searchResultIndex + 1) % this._searchResults.length;
        this._mainPane.setSelectedEntry(this._searchResults[this._searchResultIndex]);
        this._searchableView.updateCurrentMatchIndex(this._searchResultIndex);
    }
    jumpToPreviousSearchResult() {
        this._searchResultIndex = (this._searchResultIndex - 1 + this._searchResults.length) % this._searchResults.length;
        this._mainPane.setSelectedEntry(this._searchResults[this._searchResultIndex]);
        this._searchableView.updateCurrentMatchIndex(this._searchResultIndex);
    }
    supportsCaseSensitiveSearch() {
        return true;
    }
    supportsRegexSearch() {
        return false;
    }
}
export class OverviewCalculator {
    _formatter;
    _minimumBoundaries;
    _maximumBoundaries;
    _xScaleFactor;
    constructor(formatter) {
        this._formatter = formatter;
    }
    _updateBoundaries(overviewPane) {
        this._minimumBoundaries = overviewPane._dataProvider.minimumBoundary();
        const totalTime = overviewPane._dataProvider.totalTime();
        this._maximumBoundaries = this._minimumBoundaries + totalTime;
        this._xScaleFactor = overviewPane._overviewContainer.clientWidth / totalTime;
    }
    computePosition(time) {
        return (time - this._minimumBoundaries) * this._xScaleFactor;
    }
    formatValue(value, precision) {
        return this._formatter(value - this._minimumBoundaries, precision);
    }
    maximumBoundary() {
        return this._maximumBoundaries;
    }
    minimumBoundary() {
        return this._minimumBoundaries;
    }
    zeroTime() {
        return this._minimumBoundaries;
    }
    boundarySpan() {
        return this._maximumBoundaries - this._minimumBoundaries;
    }
}
export class OverviewPane extends UI.Widget.VBox {
    _overviewContainer;
    _overviewCalculator;
    _overviewGrid;
    _overviewCanvas;
    _dataProvider;
    _windowTimeLeft;
    _windowTimeRight;
    _updateTimerId;
    constructor(dataProvider) {
        super();
        this.element.classList.add('cpu-profile-flame-chart-overview-pane');
        this._overviewContainer = this.element.createChild('div', 'cpu-profile-flame-chart-overview-container');
        this._overviewCalculator = new OverviewCalculator(dataProvider.formatValue);
        this._overviewGrid = new PerfUI.OverviewGrid.OverviewGrid('cpu-profile-flame-chart', this._overviewCalculator);
        this._overviewGrid.element.classList.add('fill');
        this._overviewCanvas =
            this._overviewContainer.createChild('canvas', 'cpu-profile-flame-chart-overview-canvas');
        this._overviewContainer.appendChild(this._overviewGrid.element);
        this._dataProvider = dataProvider;
        this._overviewGrid.addEventListener(PerfUI.OverviewGrid.Events.WindowChanged, this._onWindowChanged, this);
    }
    windowChanged(windowStartTime, windowEndTime) {
        this._selectRange(windowStartTime, windowEndTime);
    }
    updateRangeSelection(_startTime, _endTime) {
    }
    updateSelectedGroup(_flameChart, _group) {
    }
    _selectRange(timeLeft, timeRight) {
        const startTime = this._dataProvider.minimumBoundary();
        const totalTime = this._dataProvider.totalTime();
        this._overviewGrid.setWindow((timeLeft - startTime) / totalTime, (timeRight - startTime) / totalTime);
    }
    _onWindowChanged(event) {
        const windowPosition = { windowTimeLeft: event.data.rawStartValue, windowTimeRight: event.data.rawEndValue };
        this._windowTimeLeft = windowPosition.windowTimeLeft;
        this._windowTimeRight = windowPosition.windowTimeRight;
        this.dispatchEventToListeners(PerfUI.OverviewGrid.Events.WindowChanged, windowPosition);
    }
    _timelineData() {
        return this._dataProvider.timelineData();
    }
    onResize() {
        this._scheduleUpdate();
    }
    _scheduleUpdate() {
        if (this._updateTimerId) {
            return;
        }
        this._updateTimerId = this.element.window().requestAnimationFrame(this.update.bind(this));
    }
    update() {
        this._updateTimerId = 0;
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        this._resetCanvas(this._overviewContainer.clientWidth, this._overviewContainer.clientHeight - PerfUI.FlameChart.HeaderHeight);
        this._overviewCalculator._updateBoundaries(this);
        this._overviewGrid.updateDividers(this._overviewCalculator);
        this._drawOverviewCanvas();
    }
    _drawOverviewCanvas() {
        const canvasWidth = this._overviewCanvas.width;
        const canvasHeight = this._overviewCanvas.height;
        const drawData = this._calculateDrawData(canvasWidth);
        const context = this._overviewCanvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get canvas context');
        }
        const ratio = window.devicePixelRatio;
        const offsetFromBottom = ratio;
        const lineWidth = 1;
        const yScaleFactor = canvasHeight / (this._dataProvider.maxStackDepth() * 1.1);
        context.lineWidth = lineWidth;
        context.translate(0.5, 0.5);
        context.strokeStyle = 'rgba(20,0,0,0.4)';
        context.fillStyle = 'rgba(214,225,254,0.8)';
        context.moveTo(-lineWidth, canvasHeight + lineWidth);
        context.lineTo(-lineWidth, Math.round(canvasHeight - drawData[0] * yScaleFactor - offsetFromBottom));
        let value = 0;
        for (let x = 0; x < canvasWidth; ++x) {
            value = Math.round(canvasHeight - drawData[x] * yScaleFactor - offsetFromBottom);
            context.lineTo(x, value);
        }
        context.lineTo(canvasWidth + lineWidth, value);
        context.lineTo(canvasWidth + lineWidth, canvasHeight + lineWidth);
        context.fill();
        context.stroke();
        context.closePath();
    }
    _calculateDrawData(width) {
        const dataProvider = this._dataProvider;
        const timelineData = this._timelineData();
        const entryStartTimes = timelineData.entryStartTimes;
        const entryTotalTimes = timelineData.entryTotalTimes;
        const entryLevels = timelineData.entryLevels;
        const length = entryStartTimes.length;
        const minimumBoundary = this._dataProvider.minimumBoundary();
        const drawData = new Uint8Array(width);
        const scaleFactor = width / dataProvider.totalTime();
        for (let entryIndex = 0; entryIndex < length; ++entryIndex) {
            const start = Math.floor((entryStartTimes[entryIndex] - minimumBoundary) * scaleFactor);
            const finish = Math.floor((entryStartTimes[entryIndex] - minimumBoundary + entryTotalTimes[entryIndex]) * scaleFactor);
            for (let x = start; x <= finish; ++x) {
                drawData[x] = Math.max(drawData[x], entryLevels[entryIndex] + 1);
            }
        }
        return drawData;
    }
    _resetCanvas(width, height) {
        const ratio = window.devicePixelRatio;
        this._overviewCanvas.width = width * ratio;
        this._overviewCanvas.height = height * ratio;
        this._overviewCanvas.style.width = width + 'px';
        this._overviewCanvas.style.height = height + 'px';
    }
}
//# sourceMappingURL=CPUProfileFlameChart.js.map