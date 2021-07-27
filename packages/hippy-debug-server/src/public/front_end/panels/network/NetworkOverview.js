// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { NetworkLogView } from './NetworkLogView.js';
import { NetworkTimeBoundary } from './NetworkTimeCalculator.js';
import { RequestTimeRangeNames, RequestTimingView } from './RequestTimingView.js';
export class NetworkOverview extends PerfUI.TimelineOverviewPane.TimelineOverviewBase {
    _selectedFilmStripTime;
    _numBands;
    _updateScheduled;
    _highlightedRequest;
    _loadEvents;
    _domContentLoadedEvents;
    _nextBand;
    _bandMap;
    _requestsList;
    _requestsSet;
    _span;
    _filmStripModel;
    _lastBoundary;
    constructor() {
        super();
        this._selectedFilmStripTime = -1;
        this.element.classList.add('network-overview');
        this._numBands = 1;
        this._updateScheduled = false;
        this._highlightedRequest = null;
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.Load, this._loadEventFired, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.DOMContentLoaded, this._domContentLoadedEventFired, this);
        this.reset();
    }
    setHighlightedRequest(request) {
        this._highlightedRequest = request;
        this.scheduleUpdate();
    }
    setFilmStripModel(filmStripModel) {
        this._filmStripModel = filmStripModel;
        this.scheduleUpdate();
    }
    selectFilmStripFrame(time) {
        this._selectedFilmStripTime = time;
        this.scheduleUpdate();
    }
    clearFilmStripFrame() {
        this._selectedFilmStripTime = -1;
        this.scheduleUpdate();
    }
    _loadEventFired(event) {
        const time = event.data.loadTime;
        if (time) {
            this._loadEvents.push(time * 1000);
        }
        this.scheduleUpdate();
    }
    _domContentLoadedEventFired(event) {
        const data = event.data;
        if (data) {
            this._domContentLoadedEvents.push(data * 1000);
        }
        this.scheduleUpdate();
    }
    _bandId(connectionId) {
        if (!connectionId || connectionId === '0') {
            return -1;
        }
        if (this._bandMap.has(connectionId)) {
            return this._bandMap.get(connectionId);
        }
        const result = this._nextBand++;
        this._bandMap.set(connectionId, result);
        return result;
    }
    updateRequest(request) {
        if (!this._requestsSet.has(request)) {
            this._requestsSet.add(request);
            this._requestsList.push(request);
        }
        this.scheduleUpdate();
    }
    wasShown() {
        this.onResize();
    }
    calculator() {
        return super.calculator();
    }
    onResize() {
        const width = this.element.offsetWidth;
        const height = this.element.offsetHeight;
        this.calculator().setDisplayWidth(width);
        this.resetCanvas();
        const numBands = (((height - _padding - 1) / _bandHeight) - 1) | 0;
        this._numBands = (numBands > 0) ? numBands : 1;
        this.scheduleUpdate();
    }
    reset() {
        this._filmStripModel = null;
        this._span = 1;
        this._lastBoundary = null;
        this._nextBand = 0;
        this._bandMap = new Map();
        this._requestsList = [];
        this._requestsSet = new Set();
        this._loadEvents = [];
        this._domContentLoadedEvents = [];
        // Clear screen.
        this.resetCanvas();
    }
    scheduleUpdate() {
        if (this._updateScheduled || !this.isShowing()) {
            return;
        }
        this._updateScheduled = true;
        this.element.window().requestAnimationFrame(this.update.bind(this));
    }
    update() {
        this._updateScheduled = false;
        const calculator = this.calculator();
        const newBoundary = new NetworkTimeBoundary(calculator.minimumBoundary(), calculator.maximumBoundary());
        if (!this._lastBoundary || !newBoundary.equals(this._lastBoundary)) {
            const span = calculator.boundarySpan();
            while (this._span < span) {
                this._span *= 1.25;
            }
            calculator.setBounds(calculator.minimumBoundary(), calculator.minimumBoundary() + this._span);
            this._lastBoundary = new NetworkTimeBoundary(calculator.minimumBoundary(), calculator.maximumBoundary());
        }
        const context = this.context();
        const linesByType = new Map();
        const paddingTop = _padding;
        function drawLines(type) {
            const lines = linesByType.get(type);
            if (!lines) {
                return;
            }
            const n = lines.length;
            context.beginPath();
            context.strokeStyle = ThemeSupport.ThemeSupport.instance().getComputedValue('--neutral-layer-l4');
            context.lineWidth = BORDER_WIDTH;
            context.fillStyle = ThemeSupport.ThemeSupport.instance().getComputedValue(RequestTimeRangeNameToColor[type]);
            for (let i = 0; i < n;) {
                const y = lines[i++] * _bandHeight + paddingTop;
                const startTime = lines[i++];
                let endTime = lines[i++];
                if (endTime === Number.MAX_VALUE) {
                    endTime = calculator.maximumBoundary();
                }
                const startX = calculator.computePosition(startTime);
                const endX = calculator.computePosition(endTime) + 1;
                context.fillRect(startX, y, endX - startX, _bandHeight);
                context.strokeRect(startX, y, endX - startX, _bandHeight);
            }
        }
        function addLine(type, y, start, end) {
            let lines = linesByType.get(type);
            if (!lines) {
                lines = [];
                linesByType.set(type, lines);
            }
            lines.push(y, start, end);
        }
        const requests = this._requestsList;
        const n = requests.length;
        for (let i = 0; i < n; ++i) {
            const request = requests[i];
            const band = this._bandId(request.connectionId);
            const y = (band === -1) ? 0 : (band % this._numBands + 1);
            const timeRanges = RequestTimingView.calculateRequestTimeRanges(request, this.calculator().minimumBoundary());
            for (let j = 0; j < timeRanges.length; ++j) {
                const type = timeRanges[j].name;
                if (band !== -1 || type === RequestTimeRangeNames.Total) {
                    addLine(type, y, timeRanges[j].start * 1000, timeRanges[j].end * 1000);
                }
            }
        }
        context.clearRect(0, 0, this.width(), this.height());
        context.save();
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.lineWidth = 2;
        drawLines(RequestTimeRangeNames.Total);
        drawLines(RequestTimeRangeNames.Blocking);
        drawLines(RequestTimeRangeNames.Connecting);
        drawLines(RequestTimeRangeNames.ServiceWorker);
        drawLines(RequestTimeRangeNames.ServiceWorkerPreparation);
        drawLines(RequestTimeRangeNames.ServiceWorkerRespondWith);
        drawLines(RequestTimeRangeNames.Push);
        drawLines(RequestTimeRangeNames.Proxy);
        drawLines(RequestTimeRangeNames.DNS);
        drawLines(RequestTimeRangeNames.SSL);
        drawLines(RequestTimeRangeNames.Sending);
        drawLines(RequestTimeRangeNames.Waiting);
        drawLines(RequestTimeRangeNames.Receiving);
        if (this._highlightedRequest) {
            const size = 5;
            const borderSize = 2;
            const request = this._highlightedRequest;
            const band = this._bandId(request.connectionId);
            const y = ((band === -1) ? 0 : (band % this._numBands + 1)) * _bandHeight + paddingTop;
            const timeRanges = RequestTimingView.calculateRequestTimeRanges(request, this.calculator().minimumBoundary());
            context.fillStyle = ThemeSupport.ThemeSupport.instance().getComputedValue('--legacy-selection-bg-color');
            const start = timeRanges[0].start * 1000;
            const end = timeRanges[0].end * 1000;
            context.fillRect(calculator.computePosition(start) - borderSize, y - size / 2 - borderSize, calculator.computePosition(end) - calculator.computePosition(start) + 1 + 2 * borderSize, size * borderSize);
            for (let j = 0; j < timeRanges.length; ++j) {
                const type = timeRanges[j].name;
                if (band !== -1 || type === RequestTimeRangeNames.Total) {
                    context.beginPath();
                    context.strokeStyle =
                        ThemeSupport.ThemeSupport.instance().getComputedValue(RequestTimeRangeNameToColor[type]);
                    context.lineWidth = size;
                    const start = timeRanges[j].start * 1000;
                    const end = timeRanges[j].end * 1000;
                    context.moveTo(calculator.computePosition(start) - 0, y);
                    context.lineTo(calculator.computePosition(end) + 1, y);
                    context.stroke();
                }
            }
        }
        const height = this.element.offsetHeight;
        context.lineWidth = 1;
        context.beginPath();
        context.strokeStyle = NetworkLogView.getDCLEventColor();
        for (let i = this._domContentLoadedEvents.length - 1; i >= 0; --i) {
            const x = Math.round(calculator.computePosition(this._domContentLoadedEvents[i])) + 0.5;
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }
        context.stroke();
        context.beginPath();
        context.strokeStyle = NetworkLogView.getLoadEventColor();
        for (let i = this._loadEvents.length - 1; i >= 0; --i) {
            const x = Math.round(calculator.computePosition(this._loadEvents[i])) + 0.5;
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }
        context.stroke();
        if (this._selectedFilmStripTime !== -1) {
            context.lineWidth = 2;
            context.beginPath();
            context.strokeStyle = ThemeSupport.ThemeSupport.instance().getComputedValue('--network-frame-divider-color');
            const x = Math.round(calculator.computePosition(this._selectedFilmStripTime));
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        context.restore();
    }
}
export const RequestTimeRangeNameToColor = {
    [RequestTimeRangeNames.Total]: '--override-network-overview-total',
    [RequestTimeRangeNames.Blocking]: '--override-network-overview-blocking',
    [RequestTimeRangeNames.Connecting]: '--override-network-overview-connecting',
    [RequestTimeRangeNames.ServiceWorker]: '--override-network-overview-service-worker',
    [RequestTimeRangeNames.ServiceWorkerPreparation]: '--override-network-overview-service-worker',
    [RequestTimeRangeNames.ServiceWorkerRespondWith]: '--override-network-overview-service-worker-respond-with',
    [RequestTimeRangeNames.Push]: '--override-network-overview-push',
    [RequestTimeRangeNames.Proxy]: '--override-network-overview-proxy',
    [RequestTimeRangeNames.DNS]: '--override-network-overview-dns',
    [RequestTimeRangeNames.SSL]: '--override-network-overview-ssl',
    [RequestTimeRangeNames.Sending]: '--override-network-overview-sending',
    [RequestTimeRangeNames.Waiting]: '--override-network-overview-waiting',
    [RequestTimeRangeNames.Receiving]: '--override-network-overview-receiving',
    [RequestTimeRangeNames.Queueing]: '--override-network-overview-queueing',
};
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _bandHeight = 3;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _padding = 5;
// Border between bars in network overview panel for accessibility.
const BORDER_WIDTH = 1;
//# sourceMappingURL=NetworkOverview.js.map