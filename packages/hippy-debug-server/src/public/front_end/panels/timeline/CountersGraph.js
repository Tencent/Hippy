/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events } from './PerformanceModel.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Text for a heap profile type
    */
    jsHeap: 'JS Heap',
    /**
    *@description Text for documents, a type of resources
    */
    documents: 'Documents',
    /**
    *@description Text in Counters Graph of the Performance panel
    */
    nodes: 'Nodes',
    /**
    *@description Text in Counters Graph of the Performance panel
    */
    listeners: 'Listeners',
    /**
    *@description Text in Counters Graph of the Performance panel
    */
    gpuMemory: 'GPU Memory',
    /**
    *@description Range text content in Counters Graph of the Performance panel
    *@example {2} PH1
    *@example {10} PH2
    */
    ss: '[{PH1} – {PH2}]',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/CountersGraph.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CountersGraph extends UI.Widget.VBox {
    _delegate;
    _calculator;
    _model;
    _header;
    _toolbar;
    _graphsContainer;
    _canvasContainer;
    _canvas;
    _timelineGrid;
    _counters;
    _counterUI;
    _countersByName;
    _gpuMemoryCounter;
    _track;
    _currentValuesBar;
    _markerXPosition;
    constructor(delegate) {
        super();
        this.element.id = 'memory-graphs-container';
        this._delegate = delegate;
        this._calculator = new Calculator();
        // Create selectors
        this._header = new UI.Widget.HBox();
        this._header.element.classList.add('timeline-memory-header');
        this._header.show(this.element);
        this._toolbar = new UI.Toolbar.Toolbar('timeline-memory-toolbar');
        this._header.element.appendChild(this._toolbar.element);
        this._graphsContainer = new UI.Widget.VBox();
        this._graphsContainer.show(this.element);
        const canvasWidget = new UI.Widget.VBoxWithResizeCallback(this._resize.bind(this));
        canvasWidget.show(this._graphsContainer.element);
        this._createCurrentValuesBar();
        this._canvasContainer = canvasWidget.element;
        this._canvasContainer.id = 'memory-graphs-canvas-container';
        this._canvas = document.createElement('canvas');
        this._canvasContainer.appendChild(this._canvas);
        this._canvas.id = 'memory-counters-graph';
        this._canvasContainer.addEventListener('mouseover', this._onMouseMove.bind(this), true);
        this._canvasContainer.addEventListener('mousemove', this._onMouseMove.bind(this), true);
        this._canvasContainer.addEventListener('mouseleave', this._onMouseLeave.bind(this), true);
        this._canvasContainer.addEventListener('click', this._onClick.bind(this), true);
        // We create extra timeline grid here to reuse its event dividers.
        this._timelineGrid = new PerfUI.TimelineGrid.TimelineGrid();
        this._canvasContainer.appendChild(this._timelineGrid.dividersElement);
        this._counters = [];
        this._counterUI = [];
        this._countersByName = new Map();
        this._countersByName.set('jsHeapSizeUsed', this._createCounter(i18nString(UIStrings.jsHeap), 'hsl(220, 90%, 43%)', Platform.NumberUtilities.bytesToString));
        this._countersByName.set('documents', this._createCounter(i18nString(UIStrings.documents), 'hsl(0, 90%, 43%)'));
        this._countersByName.set('nodes', this._createCounter(i18nString(UIStrings.nodes), 'hsl(120, 90%, 43%)'));
        this._countersByName.set('jsEventListeners', this._createCounter(i18nString(UIStrings.listeners), 'hsl(38, 90%, 43%)'));
        this._gpuMemoryCounter = this._createCounter(i18nString(UIStrings.gpuMemory), 'hsl(300, 90%, 43%)', Platform.NumberUtilities.bytesToString);
        this._countersByName.set('gpuMemoryUsedKB', this._gpuMemoryCounter);
    }
    setModel(model, track) {
        if (this._model !== model) {
            if (this._model) {
                this._model.removeEventListener(Events.WindowChanged, this._onWindowChanged, this);
            }
            this._model = model;
            if (this._model) {
                this._model.addEventListener(Events.WindowChanged, this._onWindowChanged, this);
            }
        }
        this._calculator.setZeroTime(model ? model.timelineModel().minimumRecordTime() : 0);
        for (let i = 0; i < this._counters.length; ++i) {
            this._counters[i].reset();
            this._counterUI[i].reset();
        }
        this.scheduleRefresh();
        this._track = track;
        if (!track) {
            return;
        }
        const events = track.syncEvents();
        for (let i = 0; i < events.length; ++i) {
            const event = events[i];
            if (event.name !== TimelineModel.TimelineModel.RecordType.UpdateCounters) {
                continue;
            }
            const counters = event.args.data;
            if (!counters) {
                return;
            }
            for (const name in counters) {
                const counter = this._countersByName.get(name);
                if (counter) {
                    counter.appendSample(event.startTime, counters[name]);
                }
            }
            const gpuMemoryLimitCounterName = 'gpuMemoryLimitKB';
            if (gpuMemoryLimitCounterName in counters) {
                this._gpuMemoryCounter.setLimit(counters[gpuMemoryLimitCounterName]);
            }
        }
    }
    _createCurrentValuesBar() {
        this._currentValuesBar = this._graphsContainer.element.createChild('div');
        this._currentValuesBar.id = 'counter-values-bar';
    }
    _createCounter(uiName, color, formatter) {
        const counter = new Counter();
        this._counters.push(counter);
        this._counterUI.push(new CounterUI(this, uiName, color, counter, formatter));
        return counter;
    }
    resizerElement() {
        return this._header.element;
    }
    _resize() {
        const parentElement = this._canvas.parentElement;
        this._canvas.width = parentElement.clientWidth * window.devicePixelRatio;
        this._canvas.height = parentElement.clientHeight * window.devicePixelRatio;
        this._calculator.setDisplayWidth(this._canvas.width);
        this.refresh();
    }
    _onWindowChanged(event) {
        const window = event.data.window;
        this._calculator.setWindow(window.left, window.right);
        this.scheduleRefresh();
    }
    scheduleRefresh() {
        UI.UIUtils.invokeOnceAfterBatchUpdate(this, this.refresh);
    }
    draw() {
        this._clear();
        for (const counter of this._counters) {
            counter._calculateVisibleIndexes(this._calculator);
            counter._calculateXValues(this._canvas.width);
        }
        for (const counterUI of this._counterUI) {
            counterUI._drawGraph(this._canvas);
        }
    }
    _onClick(event) {
        const x = event.x - this._canvasContainer.totalOffsetLeft();
        let minDistance = Infinity;
        let bestTime;
        for (const counterUI of this._counterUI) {
            if (!counterUI.counter.times.length) {
                continue;
            }
            const index = counterUI._recordIndexAt(x);
            const distance = Math.abs(x * window.devicePixelRatio - counterUI.counter.x[index]);
            if (distance < minDistance) {
                minDistance = distance;
                bestTime = counterUI.counter.times[index];
            }
        }
        if (bestTime !== undefined && this._track) {
            this._delegate.selectEntryAtTime(this._track.events.length ? this._track.events : this._track.asyncEvents, bestTime);
        }
    }
    _onMouseLeave(_event) {
        delete this._markerXPosition;
        this._clearCurrentValueAndMarker();
    }
    _clearCurrentValueAndMarker() {
        for (let i = 0; i < this._counterUI.length; i++) {
            this._counterUI[i]._clearCurrentValueAndMarker();
        }
    }
    _onMouseMove(event) {
        const x = event.x - this._canvasContainer.totalOffsetLeft();
        this._markerXPosition = x;
        this._refreshCurrentValues();
    }
    _refreshCurrentValues() {
        if (this._markerXPosition === undefined) {
            return;
        }
        for (let i = 0; i < this._counterUI.length; ++i) {
            this._counterUI[i].updateCurrentValue(this._markerXPosition);
        }
    }
    refresh() {
        this._timelineGrid.updateDividers(this._calculator);
        this.draw();
        this._refreshCurrentValues();
    }
    _clear() {
        const ctx = this._canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to get canvas context');
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}
export class Counter {
    times;
    values;
    x;
    _minimumIndex;
    _maximumIndex;
    _maxTime;
    _minTime;
    _limitValue;
    constructor() {
        this.times = [];
        this.values = [];
        this.x = [];
        this._minimumIndex = 0;
        this._maximumIndex = 0;
        this._maxTime = 0;
        this._minTime = 0;
    }
    appendSample(time, value) {
        if (this.values.length && this.values[this.values.length - 1] === value) {
            return;
        }
        this.times.push(time);
        this.values.push(value);
    }
    reset() {
        this.times = [];
        this.values = [];
    }
    setLimit(value) {
        this._limitValue = value;
    }
    _calculateBounds() {
        let maxValue;
        let minValue;
        for (let i = this._minimumIndex; i <= this._maximumIndex; i++) {
            const value = this.values[i];
            if (minValue === undefined || value < minValue) {
                minValue = value;
            }
            if (maxValue === undefined || value > maxValue) {
                maxValue = value;
            }
        }
        minValue = minValue || 0;
        maxValue = maxValue || 1;
        if (this._limitValue) {
            if (maxValue > this._limitValue * 0.5) {
                maxValue = Math.max(maxValue, this._limitValue);
            }
            minValue = Math.min(minValue, this._limitValue);
        }
        return { min: minValue, max: maxValue };
    }
    _calculateVisibleIndexes(calculator) {
        const start = calculator.minimumBoundary();
        const end = calculator.maximumBoundary();
        // Maximum index of element whose time <= start.
        this._minimumIndex = Platform.NumberUtilities.clamp(Platform.ArrayUtilities.upperBound(this.times, start, Platform.ArrayUtilities.DEFAULT_COMPARATOR) - 1, 0, this.times.length - 1);
        // Minimum index of element whose time >= end.
        this._maximumIndex = Platform.NumberUtilities.clamp(Platform.ArrayUtilities.lowerBound(this.times, end, Platform.ArrayUtilities.DEFAULT_COMPARATOR), 0, this.times.length - 1);
        // Current window bounds.
        this._minTime = start;
        this._maxTime = end;
    }
    _calculateXValues(width) {
        if (!this.values.length) {
            return;
        }
        const xFactor = width / (this._maxTime - this._minTime);
        this.x = new Array(this.values.length);
        for (let i = this._minimumIndex + 1; i <= this._maximumIndex; i++) {
            this.x[i] = xFactor * (this.times[i] - this._minTime);
        }
    }
}
export class CounterUI {
    _countersPane;
    counter;
    _formatter;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _setting;
    _filter;
    _range;
    _value;
    graphColor;
    limitColor;
    graphYValues;
    _verticalPadding;
    _currentValueLabel;
    _marker;
    constructor(countersPane, title, graphColor, counter, formatter) {
        this._countersPane = countersPane;
        this.counter = counter;
        this._formatter = formatter || Platform.NumberUtilities.withThousandsSeparator;
        this._setting = Common.Settings.Settings.instance().createSetting('timelineCountersGraph-' + title, true);
        this._setting.setTitle(title);
        this._filter = new UI.Toolbar.ToolbarSettingCheckbox(this._setting, title);
        this._filter.inputElement.classList.add('-theme-preserve-input');
        const parsedColor = Common.Color.Color.parse(graphColor);
        if (parsedColor) {
            const colorWithAlpha = parsedColor.setAlpha(0.5).asString(Common.Color.Format.RGBA);
            const htmlElement = this._filter.element;
            if (colorWithAlpha) {
                htmlElement.style.backgroundColor = colorWithAlpha;
            }
            htmlElement.style.borderColor = 'transparent';
        }
        this._filter.inputElement.addEventListener('click', this._toggleCounterGraph.bind(this));
        countersPane._toolbar.appendToolbarItem(this._filter);
        this._range = this._filter.element.createChild('span', 'range');
        this._value = countersPane._currentValuesBar.createChild('span', 'memory-counter-value');
        this._value.style.color = graphColor;
        this.graphColor = graphColor;
        if (parsedColor) {
            this.limitColor = parsedColor.setAlpha(0.3).asString(Common.Color.Format.RGBA);
        }
        this.graphYValues = [];
        this._verticalPadding = 10;
        this._currentValueLabel = title;
        this._marker = countersPane._canvasContainer.createChild('div', 'memory-counter-marker');
        this._marker.style.backgroundColor = graphColor;
        this._clearCurrentValueAndMarker();
    }
    reset() {
        this._range.textContent = '';
    }
    setRange(minValue, maxValue) {
        const min = this._formatter(minValue);
        const max = this._formatter(maxValue);
        this._range.textContent = i18nString(UIStrings.ss, { PH1: min, PH2: max });
    }
    _toggleCounterGraph() {
        this._value.classList.toggle('hidden', !this._filter.checked());
        this._countersPane.refresh();
    }
    _recordIndexAt(x) {
        return Platform.ArrayUtilities.upperBound(this.counter.x, x * window.devicePixelRatio, Platform.ArrayUtilities.DEFAULT_COMPARATOR, this.counter._minimumIndex + 1, this.counter._maximumIndex + 1) -
            1;
    }
    updateCurrentValue(x) {
        if (!this.visible() || !this.counter.values.length || !this.counter.x) {
            return;
        }
        const index = this._recordIndexAt(x);
        const value = Platform.NumberUtilities.withThousandsSeparator(this.counter.values[index]);
        this._value.textContent = `${this._currentValueLabel}: ${value}`;
        const y = this.graphYValues[index] / window.devicePixelRatio;
        this._marker.style.left = x + 'px';
        this._marker.style.top = y + 'px';
        this._marker.classList.remove('hidden');
    }
    _clearCurrentValueAndMarker() {
        this._value.textContent = '';
        this._marker.classList.add('hidden');
    }
    _drawGraph(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to get canvas context');
        }
        const width = canvas.width;
        const height = canvas.height - 2 * this._verticalPadding;
        if (height <= 0) {
            this.graphYValues = [];
            return;
        }
        const originY = this._verticalPadding;
        const counter = this.counter;
        const values = counter.values;
        if (!values.length) {
            return;
        }
        const bounds = counter._calculateBounds();
        const minValue = bounds.min;
        const maxValue = bounds.max;
        this.setRange(minValue, maxValue);
        if (!this.visible()) {
            return;
        }
        const yValues = this.graphYValues;
        const maxYRange = maxValue - minValue;
        const yFactor = maxYRange ? height / (maxYRange) : 1;
        ctx.save();
        ctx.lineWidth = window.devicePixelRatio;
        if (ctx.lineWidth % 2) {
            ctx.translate(0.5, 0.5);
        }
        ctx.beginPath();
        let value = values[counter._minimumIndex];
        let currentY = Math.round(originY + height - (value - minValue) * yFactor);
        ctx.moveTo(0, currentY);
        let i = counter._minimumIndex;
        for (; i <= counter._maximumIndex; i++) {
            const x = Math.round(counter.x[i]);
            ctx.lineTo(x, currentY);
            const currentValue = values[i];
            if (typeof currentValue !== 'undefined') {
                value = currentValue;
            }
            currentY = Math.round(originY + height - (value - minValue) * yFactor);
            ctx.lineTo(x, currentY);
            yValues[i] = currentY;
        }
        yValues.length = i;
        ctx.lineTo(width, currentY);
        ctx.strokeStyle = this.graphColor;
        ctx.stroke();
        if (counter._limitValue) {
            const limitLineY = Math.round(originY + height - (counter._limitValue - minValue) * yFactor);
            ctx.moveTo(0, limitLineY);
            ctx.lineTo(width, limitLineY);
            if (this.limitColor) {
                ctx.strokeStyle = this.limitColor;
            }
            ctx.stroke();
        }
        ctx.closePath();
        ctx.restore();
    }
    visible() {
        return this._filter.checked();
    }
}
export class Calculator {
    _minimumBoundary;
    _maximumBoundary;
    _workingArea;
    _zeroTime;
    constructor() {
        this._minimumBoundary = 0;
        this._maximumBoundary = 0;
        this._workingArea = 0;
        this._zeroTime = 0;
    }
    setZeroTime(time) {
        this._zeroTime = time;
    }
    computePosition(time) {
        return (time - this._minimumBoundary) / this.boundarySpan() * this._workingArea;
    }
    setWindow(minimumBoundary, maximumBoundary) {
        this._minimumBoundary = minimumBoundary;
        this._maximumBoundary = maximumBoundary;
    }
    setDisplayWidth(clientWidth) {
        this._workingArea = clientWidth;
    }
    formatValue(value, precision) {
        return i18n.i18n.preciseMillisToString(value - this.zeroTime(), precision);
    }
    maximumBoundary() {
        return this._maximumBoundary;
    }
    minimumBoundary() {
        return this._minimumBoundary;
    }
    zeroTime() {
        return this._zeroTime;
    }
    boundarySpan() {
        return this._maximumBoundary - this._minimumBoundary;
    }
}
//# sourceMappingURL=CountersGraph.js.map