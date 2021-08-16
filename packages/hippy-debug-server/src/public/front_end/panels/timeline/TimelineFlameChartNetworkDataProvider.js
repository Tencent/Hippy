// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { FlameChartStyle, Selection } from './TimelineFlameChartView.js';
import { TimelineSelection } from './TimelinePanel.js';
import { TimelineUIUtils } from './TimelineUIUtils.js';
const UIStrings = {
    /**
    *@description Title of the Network tool
    */
    network: 'Network',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineFlameChartNetworkDataProvider.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineFlameChartNetworkDataProvider {
    _font;
    _style;
    _group;
    _minimumBoundary;
    _maximumBoundary;
    _timeSpan;
    _requests;
    _maxLevel;
    _model;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _timelineData;
    _startTime;
    _endTime;
    _lastSelection;
    _priorityToValue;
    constructor() {
        this._font = '11px ' + Host.Platform.fontFamily();
        this.setModel(null);
        this._style = {
            padding: 4,
            height: 17,
            collapsible: true,
            color: ThemeSupport.ThemeSupport.instance().patchColorText('#222', ThemeSupport.ThemeSupport.ColorUsage.Foreground),
            font: this._font,
            backgroundColor: ThemeSupport.ThemeSupport.instance().patchColorText('white', ThemeSupport.ThemeSupport.ColorUsage.Background),
            nestingLevel: 0,
            useFirstLineForOverview: false,
            useDecoratorsForOverview: true,
            shareHeaderLine: false,
        };
        this._group =
            { startLevel: 0, name: i18nString(UIStrings.network), expanded: false, style: this._style };
        this._minimumBoundary = 0;
        this._maximumBoundary = 0;
        this._timeSpan = 0;
        this._requests = [];
        this._maxLevel = 0;
    }
    setModel(performanceModel) {
        this._model = performanceModel && performanceModel.timelineModel();
        this._timelineData = null;
    }
    isEmpty() {
        this.timelineData();
        return !this._requests.length;
    }
    maxStackDepth() {
        return this._maxLevel;
    }
    timelineData() {
        if (this._timelineData) {
            return this._timelineData;
        }
        /** @type {!Array<!TimelineModel.TimelineModel.NetworkRequest>} */
        this._requests = [];
        this._timelineData = new PerfUI.FlameChart.TimelineData([], [], [], []);
        if (this._model) {
            this._appendTimelineData();
        }
        return this._timelineData;
    }
    minimumBoundary() {
        return this._minimumBoundary;
    }
    totalTime() {
        return this._timeSpan;
    }
    setWindowTimes(startTime, endTime) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._updateTimelineData();
    }
    createSelection(index) {
        if (index === -1) {
            return null;
        }
        const request = this._requests[index];
        this._lastSelection = new Selection(TimelineSelection.fromNetworkRequest(request), index);
        return this._lastSelection.timelineSelection;
    }
    entryIndexForSelection(selection) {
        if (!selection) {
            return -1;
        }
        if (this._lastSelection && this._lastSelection.timelineSelection.object() === selection.object()) {
            return this._lastSelection.entryIndex;
        }
        if (selection.type() !== TimelineSelection.Type.NetworkRequest) {
            return -1;
        }
        const request = selection.object();
        const index = this._requests.indexOf(request);
        if (index !== -1) {
            this._lastSelection = new Selection(TimelineSelection.fromNetworkRequest(request), index);
        }
        return index;
    }
    entryColor(index) {
        const request = this._requests[index];
        const category = TimelineUIUtils.networkRequestCategory(request);
        return TimelineUIUtils.networkCategoryColor(category);
    }
    textColor(_index) {
        return FlameChartStyle.textColor;
    }
    entryTitle(index) {
        const request = this._requests[index];
        const parsedURL = new Common.ParsedURL.ParsedURL(request.url || '');
        return parsedURL.isValid ? `${parsedURL.displayName} (${parsedURL.host})` : request.url || null;
    }
    entryFont(_index) {
        return this._font;
    }
    decorateEntry(index, context, text, barX, barY, barWidth, barHeight, unclippedBarX, timeToPixelRatio) {
        const request = this._requests[index];
        if (!request.timing) {
            return false;
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const timing = request.timing;
        const beginTime = request.beginTime();
        const timeToPixel = (time) => Math.floor(unclippedBarX + (time - beginTime) * timeToPixelRatio);
        const minBarWidthPx = 2;
        const startTime = request.getStartTime();
        const endTime = request.endTime;
        const { sendStartTime, headersEndTime } = request.getSendReceiveTiming();
        const sendStart = Math.max(timeToPixel(sendStartTime), unclippedBarX);
        const headersEnd = Math.max(timeToPixel(headersEndTime), sendStart);
        const finish = Math.max(timeToPixel(request.finishTime || endTime), headersEnd + minBarWidthPx);
        const start = timeToPixel(startTime);
        const end = Math.max(timeToPixel(endTime), finish);
        // Draw waiting time.
        context.fillStyle = 'hsla(0, 100%, 100%, 0.8)';
        context.fillRect(sendStart + 0.5, barY + 0.5, headersEnd - sendStart - 0.5, barHeight - 2);
        // Clear portions of initial rect to prepare for the ticks.
        context.fillStyle =
            ThemeSupport.ThemeSupport.instance().patchColorText('white', ThemeSupport.ThemeSupport.ColorUsage.Background);
        context.fillRect(barX, barY - 0.5, sendStart - barX, barHeight);
        context.fillRect(finish, barY - 0.5, barX + barWidth - finish, barHeight);
        // If the request is from cache, pushStart refers to the original request, and hence cannot be used.
        if (!request.cached() && timing.pushStart) {
            const pushStart = timeToPixel(timing.pushStart * 1000);
            const pushEnd = timing.pushEnd ? timeToPixel(timing.pushEnd * 1000) : start;
            const dentSize = Platform.NumberUtilities.clamp(pushEnd - pushStart - 2, 0, 4);
            const padding = 1;
            context.save();
            context.beginPath();
            context.moveTo(pushStart + dentSize, barY + barHeight / 2);
            context.lineTo(pushStart, barY + padding);
            context.lineTo(pushEnd - dentSize, barY + padding);
            context.lineTo(pushEnd, barY + barHeight / 2);
            context.lineTo(pushEnd - dentSize, barY + barHeight - padding);
            context.lineTo(pushStart, barY + barHeight - padding);
            context.closePath();
            if (timing.pushEnd) {
                context.fillStyle = this.entryColor(index);
            }
            else {
                // Use a gradient to indicate that `pushEnd` is not known here to work
                // around BUG(chromium:998411).
                const gradient = context.createLinearGradient(pushStart, 0, pushEnd, 0);
                gradient.addColorStop(0, this.entryColor(index));
                gradient.addColorStop(1, 'white');
                context.fillStyle = gradient;
            }
            context.globalAlpha = 0.3;
            context.fill();
            context.restore();
        }
        function drawTick(begin, end, y) {
            const /** @const */ tickHeightPx = 6;
            context.moveTo(begin, y - tickHeightPx / 2);
            context.lineTo(begin, y + tickHeightPx / 2);
            context.moveTo(begin, y);
            context.lineTo(end, y);
        }
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = '#ccc';
        const lineY = Math.floor(barY + barHeight / 2) + 0.5;
        const leftTick = start + 0.5;
        const rightTick = end - 0.5;
        drawTick(leftTick, sendStart, lineY);
        drawTick(rightTick, finish, lineY);
        context.stroke();
        if (typeof request.priority === 'string') {
            const color = this._colorForPriority(request.priority);
            if (color) {
                context.fillStyle = color;
                context.fillRect(sendStart + 0.5, barY + 0.5, 3.5, 3.5);
            }
        }
        const textStart = Math.max(sendStart, 0);
        const textWidth = finish - textStart;
        const /** @const */ minTextWidthPx = 20;
        if (textWidth >= minTextWidthPx) {
            text = this.entryTitle(index) || '';
            if (request.fromServiceWorker) {
                text = '⚙ ' + text;
            }
            if (text) {
                const /** @const */ textPadding = 4;
                const /** @const */ textBaseline = 5;
                const textBaseHeight = barHeight - textBaseline;
                const trimmedText = UI.UIUtils.trimTextEnd(context, text, textWidth - 2 * textPadding);
                context.fillStyle = '#333';
                context.fillText(trimmedText, textStart + textPadding, barY + textBaseHeight);
            }
        }
        return true;
    }
    forceDecoration(_index) {
        return true;
    }
    prepareHighlightedEntryInfo(index) {
        const /** @const */ maxURLChars = 80;
        const request = this._requests[index];
        if (!request.url) {
            return null;
        }
        const element = document.createElement('div');
        const root = UI.Utils.createShadowRootWithCoreStyles(element, {
            cssFile: 'panels/timeline/timelineFlamechartPopover.css',
            enableLegacyPatching: false,
            delegatesFocus: undefined,
        });
        const contents = root.createChild('div', 'timeline-flamechart-popover');
        const startTime = request.getStartTime();
        const duration = request.endTime - startTime;
        if (startTime && isFinite(duration)) {
            contents.createChild('span', 'timeline-info-network-time').textContent = i18n.i18n.millisToString(duration, true);
        }
        if (typeof request.priority === 'string') {
            const div = contents.createChild('span');
            div.textContent =
                PerfUI.NetworkPriorities.uiLabelForNetworkPriority(request.priority);
            div.style.color = this._colorForPriority(request.priority) || 'black';
        }
        contents.createChild('span').textContent = Platform.StringUtilities.trimMiddle(request.url, maxURLChars);
        return element;
    }
    _colorForPriority(priority) {
        if (!this._priorityToValue) {
            this._priorityToValue = new Map([
                ["VeryLow" /* VeryLow */, 1],
                ["Low" /* Low */, 2],
                ["Medium" /* Medium */, 3],
                ["High" /* High */, 4],
                ["VeryHigh" /* VeryHigh */, 5],
            ]);
        }
        const value = this._priorityToValue.get(priority);
        return value ? `hsla(214, 80%, 50%, ${value / 5})` : null;
    }
    _appendTimelineData() {
        if (this._model) {
            this._minimumBoundary = this._model.minimumRecordTime();
            this._maximumBoundary = this._model.maximumRecordTime();
            this._timeSpan = this._model.isEmpty() ? 1000 : this._maximumBoundary - this._minimumBoundary;
            this._model.networkRequests().forEach(this._appendEntry.bind(this));
            this._updateTimelineData();
        }
    }
    _updateTimelineData() {
        if (!this._timelineData) {
            return;
        }
        const lastTimeByLevel = [];
        let maxLevel = 0;
        for (let i = 0; i < this._requests.length; ++i) {
            const r = this._requests[i];
            const beginTime = r.beginTime();
            const startTime = this._startTime;
            const endTime = this._endTime;
            const visible = beginTime < endTime && r.endTime > startTime;
            if (!visible) {
                this._timelineData.entryLevels[i] = -1;
                continue;
            }
            while (lastTimeByLevel.length && lastTimeByLevel[lastTimeByLevel.length - 1] <= beginTime) {
                lastTimeByLevel.pop();
            }
            this._timelineData.entryLevels[i] = lastTimeByLevel.length;
            lastTimeByLevel.push(r.endTime);
            maxLevel = Math.max(maxLevel, lastTimeByLevel.length);
        }
        for (let i = 0; i < this._requests.length; ++i) {
            if (this._timelineData.entryLevels[i] === -1) {
                this._timelineData.entryLevels[i] = maxLevel;
            }
        }
        this._timelineData = new PerfUI.FlameChart.TimelineData(this._timelineData.entryLevels, this._timelineData.entryTotalTimes, this._timelineData.entryStartTimes, [this._group]);
        this._maxLevel = maxLevel;
    }
    _appendEntry(request) {
        this._requests.push(request);
        this._timelineData.entryStartTimes.push(request.beginTime());
        this._timelineData.entryTotalTimes.push(request.endTime - request.beginTime());
        this._timelineData.entryLevels.push(this._requests.length - 1);
    }
    preferredHeight() {
        return this._style.height * (this._group.expanded ? Platform.NumberUtilities.clamp(this._maxLevel + 1, 4, 8.5) : 1);
    }
    isExpanded() {
        return this._group && Boolean(this._group.expanded);
    }
    formatValue(value, precision) {
        return i18n.i18n.preciseMillisToString(value, precision);
    }
    canJumpToEntry(_entryIndex) {
        return false;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navStartTimes() {
        if (!this._model) {
            return new Map();
        }
        return this._model.navStartTimes();
    }
}
//# sourceMappingURL=TimelineFlameChartNetworkDataProvider.js.map