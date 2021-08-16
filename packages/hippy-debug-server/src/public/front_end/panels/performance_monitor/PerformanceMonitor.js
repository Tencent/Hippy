// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
const UIStrings = {
    /**
    *@description Aria accessible name in Performance Monitor of the Performance monitor tab
    */
    graphsDisplayingARealtimeViewOf: 'Graphs displaying a real-time view of performance metrics',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    paused: 'Paused',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    cpuUsage: 'CPU usage',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    jsHeapSize: 'JS heap size',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    domNodes: 'DOM Nodes',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    jsEventListeners: 'JS event listeners',
    /**
    *@description Text for documents, a type of resources
    */
    documents: 'Documents',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    documentFrames: 'Document Frames',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    layoutsSec: 'Layouts / sec',
    /**
    *@description Text in Performance Monitor of the Performance monitor tab
    */
    styleRecalcsSec: 'Style recalcs / sec',
};
const str_ = i18n.i18n.registerUIStrings('panels/performance_monitor/PerformanceMonitor.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let performanceMonitorImplInstance;
export class PerformanceMonitorImpl extends UI.Widget.HBox {
    _metricsBuffer;
    _pixelsPerMs;
    _pollIntervalMs;
    _scaleHeight;
    _graphHeight;
    _gridColor;
    _controlPane;
    _canvas;
    _animationId;
    _width;
    _height;
    _model;
    _startTimestamp;
    _pollTimer;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/performance_monitor/performanceMonitor.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('perfmon-pane');
        this._metricsBuffer = [];
        /** @const */
        this._pixelsPerMs = 10 / 1000;
        /** @const */
        this._pollIntervalMs = 500;
        /** @const */
        this._scaleHeight = 16;
        /** @const */
        this._graphHeight = 90;
        this._gridColor = ThemeSupport.ThemeSupport.instance().patchColorText('rgba(0, 0, 0, 0.08)', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        this._controlPane = new ControlPane(this.contentElement);
        const chartContainer = this.contentElement.createChild('div', 'perfmon-chart-container');
        this._canvas = chartContainer.createChild('canvas');
        this._canvas.tabIndex = -1;
        UI.ARIAUtils.setAccessibleName(this._canvas, i18nString(UIStrings.graphsDisplayingARealtimeViewOf));
        this.contentElement.createChild('div', 'perfmon-chart-suspend-overlay fill').createChild('div').textContent =
            i18nString(UIStrings.paused);
        this._controlPane.addEventListener("MetricChanged" /* MetricChanged */, this._recalcChartHeight, this);
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.PerformanceMetricsModel.PerformanceMetricsModel, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!performanceMonitorImplInstance || forceNew) {
            performanceMonitorImplInstance = new PerformanceMonitorImpl();
        }
        return performanceMonitorImplInstance;
    }
    wasShown() {
        if (!this._model) {
            return;
        }
        SDK.TargetManager.TargetManager.instance().addEventListener(SDK.TargetManager.Events.SuspendStateChanged, this._suspendStateChanged, this);
        this._model.enable();
        this._suspendStateChanged();
    }
    willHide() {
        if (!this._model) {
            return;
        }
        SDK.TargetManager.TargetManager.instance().removeEventListener(SDK.TargetManager.Events.SuspendStateChanged, this._suspendStateChanged, this);
        this._stopPolling();
        this._model.disable();
    }
    modelAdded(model) {
        if (this._model) {
            return;
        }
        this._model = model;
        if (this.isShowing()) {
            this.wasShown();
        }
    }
    modelRemoved(model) {
        if (this._model !== model) {
            return;
        }
        if (this.isShowing()) {
            this.willHide();
        }
        this._model = null;
    }
    _suspendStateChanged() {
        const suspended = SDK.TargetManager.TargetManager.instance().allTargetsSuspended();
        if (suspended) {
            this._stopPolling();
        }
        else {
            this._startPolling();
        }
        this.contentElement.classList.toggle('suspended', suspended);
    }
    _startPolling() {
        this._startTimestamp = 0;
        this._pollTimer = window.setInterval(() => this._poll(), this._pollIntervalMs);
        this.onResize();
        const animate = () => {
            this._draw();
            this._animationId = this.contentElement.window().requestAnimationFrame(() => {
                animate();
            });
        };
        animate();
    }
    _stopPolling() {
        window.clearInterval(this._pollTimer);
        this.contentElement.window().cancelAnimationFrame(this._animationId);
        this._metricsBuffer = [];
    }
    async _poll() {
        if (!this._model) {
            return;
        }
        const data = await this._model.requestMetrics();
        const timestamp = data.timestamp;
        const metrics = data.metrics;
        this._metricsBuffer.push({ timestamp, metrics: metrics });
        const millisPerWidth = this._width / this._pixelsPerMs;
        // Multiply by 2 as the pollInterval has some jitter and to have some extra samples if window is resized.
        const maxCount = Math.ceil(millisPerWidth / this._pollIntervalMs * 2);
        if (this._metricsBuffer.length > maxCount * 2) // Multiply by 2 to have a hysteresis.
         {
            this._metricsBuffer.splice(0, this._metricsBuffer.length - maxCount);
        }
        this._controlPane.updateMetrics(metrics);
    }
    _draw() {
        const ctx = this._canvas.getContext('2d');
        ctx.save();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, this._width, this._height);
        ctx.save();
        ctx.translate(0, this._scaleHeight); // Reserve space for the scale bar.
        for (const chartInfo of this._controlPane.charts()) {
            if (!this._controlPane.isActive(chartInfo.metrics[0].name)) {
                continue;
            }
            this._drawChart(ctx, chartInfo, this._graphHeight);
            ctx.translate(0, this._graphHeight);
        }
        ctx.restore();
        this._drawHorizontalGrid(ctx);
        ctx.restore();
    }
    _drawHorizontalGrid(ctx) {
        const labelDistanceSeconds = 10;
        const lightGray = ThemeSupport.ThemeSupport.instance().patchColorText('rgba(0, 0, 0, 0.02)', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        ctx.font = '10px ' + Host.Platform.fontFamily();
        ctx.fillStyle = ThemeSupport.ThemeSupport.instance().patchColorText('rgba(0, 0, 0, 0.55)', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        const currentTime = Date.now() / 1000;
        for (let sec = Math.ceil(currentTime);; --sec) {
            const x = this._width - ((currentTime - sec) * 1000 - this._pollIntervalMs) * this._pixelsPerMs;
            if (x < -50) {
                break;
            }
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this._height);
            if (sec >= 0 && sec % labelDistanceSeconds === 0) {
                ctx.fillText(new Date(sec * 1000).toLocaleTimeString(), x + 4, 12);
            }
            ctx.strokeStyle = sec % labelDistanceSeconds ? lightGray : this._gridColor;
            ctx.stroke();
        }
    }
    _drawChart(ctx, chartInfo, height) {
        ctx.save();
        ctx.rect(0, 0, this._width, height);
        ctx.clip();
        const bottomPadding = 8;
        const extraSpace = 1.05;
        const max = this._calcMax(chartInfo) * extraSpace;
        const stackedChartBaseLandscape = chartInfo.stacked ? new Map() : null;
        const paths = [];
        for (let i = chartInfo.metrics.length - 1; i >= 0; --i) {
            const metricInfo = chartInfo.metrics[i];
            paths.push({
                path: this._buildMetricPath(chartInfo, metricInfo, height - bottomPadding, max, i ? stackedChartBaseLandscape : null),
                color: metricInfo.color,
            });
        }
        const backgroundColor = Common.Color.Color.parse(ThemeSupport.ThemeSupport.instance().patchColorText('white', ThemeSupport.ThemeSupport.ColorUsage.Background));
        if (backgroundColor) {
            for (const path of paths.reverse()) {
                const color = path.color;
                ctx.save();
                const parsedColor = Common.Color.Color.parse(color);
                if (!parsedColor) {
                    continue;
                }
                ctx.fillStyle = backgroundColor.blendWith(parsedColor.setAlpha(0.2)).asString(null) || '';
                ctx.fill(path.path);
                ctx.strokeStyle = color;
                ctx.lineWidth = 0.5;
                ctx.stroke(path.path);
                ctx.restore();
            }
        }
        ctx.fillStyle = ThemeSupport.ThemeSupport.instance().patchColorText('rgba(0, 0, 0, 0.55)', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        ctx.font = `10px  ${Host.Platform.fontFamily()}`;
        ctx.fillText(chartInfo.title, 8, 10);
        this._drawVerticalGrid(ctx, height - bottomPadding, max, chartInfo);
        ctx.restore();
    }
    _calcMax(chartInfo) {
        if (chartInfo.max) {
            return chartInfo.max;
        }
        const width = this._width;
        const startTime = performance.now() - this._pollIntervalMs - width / this._pixelsPerMs;
        let max = -Infinity;
        for (const metricInfo of chartInfo.metrics) {
            for (let i = this._metricsBuffer.length - 1; i >= 0; --i) {
                const metrics = this._metricsBuffer[i];
                const value = metrics.metrics.get(metricInfo.name);
                if (value !== undefined) {
                    max = Math.max(max, value);
                }
                if (metrics.timestamp < startTime) {
                    break;
                }
            }
        }
        if (!this._metricsBuffer.length) {
            return 10;
        }
        const base10 = Math.pow(10, Math.floor(Math.log10(max)));
        max = Math.ceil(max / base10 / 2) * base10 * 2;
        const alpha = 0.2;
        chartInfo.currentMax = max * alpha + (chartInfo.currentMax || max) * (1 - alpha);
        return chartInfo.currentMax;
    }
    _drawVerticalGrid(ctx, height, max, info) {
        let base = Math.pow(10, Math.floor(Math.log10(max)));
        const firstDigit = Math.floor(max / base);
        if (firstDigit !== 1 && firstDigit % 2 === 1) {
            base *= 2;
        }
        let scaleValue = Math.floor(max / base) * base;
        const span = max;
        const topPadding = 18;
        const visibleHeight = height - topPadding;
        ctx.fillStyle = ThemeSupport.ThemeSupport.instance().patchColorText('rgba(0, 0, 0, 0.55)', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        ctx.strokeStyle = this._gridColor;
        ctx.beginPath();
        for (let i = 0; i < 2; ++i) {
            const y = calcY(scaleValue);
            const labelText = MetricIndicator._formatNumber(scaleValue, info);
            ctx.moveTo(0, y);
            ctx.lineTo(4, y);
            ctx.moveTo(ctx.measureText(labelText).width + 12, y);
            ctx.lineTo(this._width, y);
            ctx.fillText(labelText, 8, calcY(scaleValue) + 3);
            scaleValue /= 2;
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, height + 0.5);
        ctx.lineTo(this._width, height + 0.5);
        ctx.strokeStyle = ThemeSupport.ThemeSupport.instance().patchColorText('rgba(0, 0, 0, 0.2)', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        ctx.stroke();
        function calcY(value) {
            return Math.round(height - visibleHeight * value / span) + 0.5;
        }
    }
    _buildMetricPath(chartInfo, metricInfo, height, scaleMax, stackedChartBaseLandscape) {
        const path = new Path2D();
        const topPadding = 18;
        const visibleHeight = height - topPadding;
        if (visibleHeight < 1) {
            return path;
        }
        const span = scaleMax;
        const metricName = metricInfo.name;
        const pixelsPerMs = this._pixelsPerMs;
        const startTime = performance.now() - this._pollIntervalMs - this._width / pixelsPerMs;
        const smooth = chartInfo.smooth;
        let x = 0;
        let lastY = 0;
        let lastX = 0;
        if (this._metricsBuffer.length) {
            x = (this._metricsBuffer[0].timestamp - startTime) * pixelsPerMs;
            path.moveTo(x, calcY(0));
            path.lineTo(this._width + 5, calcY(0));
            lastY = calcY(this._metricsBuffer[this._metricsBuffer.length - 1].metrics.get(metricName) ||
                0);
            lastX = this._width + 5;
            path.lineTo(lastX, lastY);
        }
        for (let i = this._metricsBuffer.length - 1; i >= 0; --i) {
            const metrics = this._metricsBuffer[i];
            const timestamp = metrics.timestamp;
            let value = metrics.metrics.get(metricName) || 0;
            if (stackedChartBaseLandscape) {
                value += stackedChartBaseLandscape.get(timestamp) || 0;
                value = Platform.NumberUtilities.clamp(value, 0, 1);
                stackedChartBaseLandscape.set(timestamp, value);
            }
            const y = calcY(value);
            x = (timestamp - startTime) * pixelsPerMs;
            if (smooth) {
                const midX = (lastX + x) / 2;
                path.bezierCurveTo(midX, lastY, midX, y, x, y);
            }
            else {
                path.lineTo(x, lastY);
                path.lineTo(x, y);
            }
            lastX = x;
            lastY = y;
            if (timestamp < startTime) {
                break;
            }
        }
        return path;
        function calcY(value) {
            return Math.round(height - visibleHeight * value / span) + 0.5;
        }
    }
    onResize() {
        super.onResize();
        this._width = this._canvas.offsetWidth;
        this._canvas.width = Math.round(this._width * window.devicePixelRatio);
        this._recalcChartHeight();
    }
    _recalcChartHeight() {
        let height = this._scaleHeight;
        for (const chartInfo of this._controlPane.charts()) {
            if (this._controlPane.isActive(chartInfo.metrics[0].name)) {
                height += this._graphHeight;
            }
        }
        this._height = Math.ceil(height * window.devicePixelRatio);
        this._canvas.height = this._height;
        this._canvas.style.height = `${this._height / window.devicePixelRatio}px`;
    }
}
export class ControlPane extends Common.ObjectWrapper.ObjectWrapper {
    element;
    _enabledChartsSetting;
    _enabledCharts;
    _chartsInfo;
    _indicators;
    constructor(parent) {
        super();
        this.element = parent.createChild('div', 'perfmon-control-pane');
        this._enabledChartsSetting = Common.Settings.Settings.instance().createSetting('perfmonActiveIndicators2', ['TaskDuration', 'JSHeapTotalSize', 'Nodes']);
        this._enabledCharts = new Set(this._enabledChartsSetting.get());
        const defaults = {
            color: undefined,
            format: undefined,
            currentMax: undefined,
            max: undefined,
            smooth: undefined,
            stacked: undefined,
        };
        this._chartsInfo = [
            {
                ...defaults,
                title: i18nString(UIStrings.cpuUsage),
                metrics: [
                    { name: 'TaskDuration', color: '#999' },
                    { name: 'ScriptDuration', color: 'orange' },
                    { name: 'LayoutDuration', color: 'blueviolet' },
                    { name: 'RecalcStyleDuration', color: 'violet' },
                ],
                format: "Percent" /* Percent */,
                smooth: true,
                stacked: true,
                color: 'red',
                max: 1,
                currentMax: undefined,
            },
            {
                ...defaults,
                title: i18nString(UIStrings.jsHeapSize),
                metrics: [{ name: 'JSHeapTotalSize', color: '#99f' }, { name: 'JSHeapUsedSize', color: 'blue' }],
                format: "Bytes" /* Bytes */,
                color: 'blue',
            },
            { ...defaults, title: i18nString(UIStrings.domNodes), metrics: [{ name: 'Nodes', color: 'green' }] },
            {
                ...defaults,
                title: i18nString(UIStrings.jsEventListeners),
                metrics: [{ name: 'JSEventListeners', color: 'yellowgreen' }],
            },
            { ...defaults, title: i18nString(UIStrings.documents), metrics: [{ name: 'Documents', color: 'darkblue' }] },
            { ...defaults, title: i18nString(UIStrings.documentFrames), metrics: [{ name: 'Frames', color: 'darkcyan' }] },
            { ...defaults, title: i18nString(UIStrings.layoutsSec), metrics: [{ name: 'LayoutCount', color: 'hotpink' }] },
            {
                ...defaults,
                title: i18nString(UIStrings.styleRecalcsSec),
                metrics: [{ name: 'RecalcStyleCount', color: 'deeppink' }],
            },
        ];
        for (const info of this._chartsInfo) {
            if (info.color) {
                info.color = ThemeSupport.ThemeSupport.instance().patchColorText(info.color, ThemeSupport.ThemeSupport.ColorUsage.Foreground);
            }
            for (const metric of info.metrics) {
                metric.color = ThemeSupport.ThemeSupport.instance().patchColorText(metric.color, ThemeSupport.ThemeSupport.ColorUsage.Foreground);
            }
        }
        this._indicators = new Map();
        for (const chartInfo of this._chartsInfo) {
            const chartName = chartInfo.metrics[0].name;
            const active = this._enabledCharts.has(chartName);
            const indicator = new MetricIndicator(this.element, chartInfo, active, this._onToggle.bind(this, chartName));
            this._indicators.set(chartName, indicator);
        }
    }
    _onToggle(chartName, active) {
        if (active) {
            this._enabledCharts.add(chartName);
        }
        else {
            this._enabledCharts.delete(chartName);
        }
        this._enabledChartsSetting.set(Array.from(this._enabledCharts));
        this.dispatchEventToListeners("MetricChanged" /* MetricChanged */);
    }
    charts() {
        return this._chartsInfo;
    }
    isActive(metricName) {
        return this._enabledCharts.has(metricName);
    }
    updateMetrics(metrics) {
        for (const name of this._indicators.keys()) {
            const metric = metrics.get(name);
            if (metric !== undefined) {
                const indicator = this._indicators.get(name);
                if (indicator) {
                    indicator.setValue(metric);
                }
            }
        }
    }
}
let numberFormatter;
let percentFormatter;
export class MetricIndicator {
    _info;
    _active;
    _onToggle;
    element;
    _swatchElement;
    _valueElement;
    constructor(parent, info, active, onToggle) {
        const color = info.color || info.metrics[0].color;
        this._info = info;
        this._active = active;
        this._onToggle = onToggle;
        this.element = parent.createChild('div', 'perfmon-indicator');
        this._swatchElement = UI.Icon.Icon.create('smallicon-checkmark-square', 'perfmon-indicator-swatch');
        this._swatchElement.style.backgroundColor = color;
        this.element.appendChild(this._swatchElement);
        this.element.createChild('div', 'perfmon-indicator-title').textContent = info.title;
        this._valueElement = this.element.createChild('div', 'perfmon-indicator-value');
        this._valueElement.style.color = color;
        this.element.addEventListener('click', () => this._toggleIndicator());
        this.element.addEventListener('keypress', event => this._handleKeypress(event));
        this.element.classList.toggle('active', active);
        UI.ARIAUtils.markAsCheckbox(this.element);
        UI.ARIAUtils.setChecked(this.element, this._active);
        this.element.tabIndex = 0;
    }
    static _formatNumber(value, info) {
        if (!numberFormatter) {
            numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
            percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, style: 'percent' });
        }
        switch (info.format) {
            case "Percent" /* Percent */:
                return percentFormatter.format(value);
            case "Bytes" /* Bytes */:
                return Platform.NumberUtilities.bytesToString(value);
            default:
                return numberFormatter.format(value);
        }
    }
    setValue(value) {
        this._valueElement.textContent = MetricIndicator._formatNumber(value, this._info);
    }
    _toggleIndicator() {
        this._active = !this._active;
        this.element.classList.toggle('active', this._active);
        UI.ARIAUtils.setChecked(this.element, this._active);
        this._onToggle(this._active);
    }
    _handleKeypress(event) {
        const keyboardEvent = event;
        if (keyboardEvent.key === ' ' || keyboardEvent.key === 'Enter') {
            this._toggleIndicator();
        }
    }
}
export const format = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
//# sourceMappingURL=PerformanceMonitor.js.map