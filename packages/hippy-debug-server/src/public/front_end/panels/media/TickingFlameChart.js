// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { Bounds, formatMillisecondsToSeconds } from './TickingFlameChartHelpers.js';
const defaultFont = '11px ' + Host.Platform.fontFamily();
const defaultColor = ThemeSupport.ThemeSupport.instance().patchColorText('#444', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
const DefaultStyle = {
    height: 20,
    padding: 2,
    collapsible: false,
    font: defaultFont,
    color: defaultColor,
    backgroundColor: 'rgba(100 0 0 / 10%)',
    nestingLevel: 0,
    itemsHeight: 20,
    shareHeaderLine: false,
    useFirstLineForOverview: false,
    useDecoratorsForOverview: false,
};
export const HotColorScheme = ['#ffba08', '#faa307', '#f48c06', '#e85d04', '#dc2f02', '#d00000', '#9d0208'];
export const ColdColorScheme = ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf'];
function calculateFontColor(backgroundColor) {
    const parsedColor = Common.Color.Color.parse(backgroundColor);
    // Dark background needs a light font.
    if (parsedColor && parsedColor.hsla()[2] < 0.5) {
        return '#eee';
    }
    return '#444';
}
/**
 * Wrapper class for each event displayed on the timeline.
 */
export class Event {
    _timelineData;
    _setLive;
    _setComplete;
    _updateMaxTime;
    _selfIndex;
    _live;
    _title;
    _color;
    _fontColor;
    _hoverData;
    constructor(timelineData, eventHandlers, eventProperties = { color: undefined, duration: undefined, hoverData: {}, level: 0, name: '', startTime: 0 }) {
        // These allow the event to privately change it's own data in the timeline.
        this._timelineData = timelineData;
        this._setLive = eventHandlers.setLive;
        this._setComplete = eventHandlers.setComplete;
        this._updateMaxTime = eventHandlers.updateMaxTime;
        // This is the index in the timelineData arrays we should be writing to.
        this._selfIndex = this._timelineData.entryLevels.length;
        this._live = false;
        // Can't use the dict||or||default syntax, since NaN is a valid expected duration.
        const duration = eventProperties['duration'] === undefined ? 0 : eventProperties['duration'];
        this._timelineData.entryLevels.push(eventProperties['level'] || 0);
        this._timelineData.entryStartTimes.push(eventProperties['startTime'] || 0);
        this._timelineData.entryTotalTimes.push(duration); // May initially push -1
        // If -1 was pushed, we need to update it. The set end time method helps with this.
        if (duration === -1) {
            this.endTime = -1;
        }
        this._title = eventProperties['name'] || '';
        this._color = eventProperties['color'] || HotColorScheme[0];
        this._fontColor = calculateFontColor(this._color);
        this._hoverData = eventProperties['hoverData'] || {};
    }
    /**
     * Render hovertext into the |htmlElement|
     */
    decorate(htmlElement) {
        htmlElement.createChild('span').textContent = `Name: ${this._title}`;
        htmlElement.createChild('br');
        const startTimeReadable = formatMillisecondsToSeconds(this.startTime, 2);
        if (this._live) {
            htmlElement.createChild('span').textContent = `Duration: ${startTimeReadable} - LIVE!`;
        }
        else if (!isNaN(this.duration)) {
            const durationReadable = formatMillisecondsToSeconds(this.duration + this.startTime, 2);
            htmlElement.createChild('span').textContent = `Duration: ${startTimeReadable} - ${durationReadable}`;
        }
        else {
            htmlElement.createChild('span').textContent = `Time: ${startTimeReadable}`;
        }
    }
    /**
     * set an event to be "live" where it's ended time is always the chart maximum
     * or to be a fixed time.
     * @param {number} time
     */
    set endTime(time) {
        // Setting end time to -1 signals that an event becomes live
        if (time === -1) {
            this._timelineData.entryTotalTimes[this._selfIndex] = this._setLive(this._selfIndex);
            this._live = true;
        }
        else {
            this._live = false;
            const duration = time - this._timelineData.entryStartTimes[this._selfIndex];
            this._timelineData.entryTotalTimes[this._selfIndex] = duration;
            this._setComplete(this._selfIndex);
            this._updateMaxTime(time);
        }
    }
    get id() {
        return this._selfIndex;
    }
    set level(level) {
        this._timelineData.entryLevels[this._selfIndex] = level;
    }
    set title(text) {
        this._title = text;
    }
    get title() {
        return this._title;
    }
    set color(color) {
        this._color = color;
        this._fontColor = calculateFontColor(this._color);
    }
    get color() {
        return this._color;
    }
    get fontColor() {
        return this._fontColor;
    }
    get startTime() {
        // Round it
        return this._timelineData.entryStartTimes[this._selfIndex];
    }
    get duration() {
        return this._timelineData.entryTotalTimes[this._selfIndex];
    }
    get live() {
        return this._live;
    }
}
export class TickingFlameChart extends UI.Widget.VBox {
    _intervalTimer;
    _lastTimestamp;
    _canTick;
    _ticking;
    _isShown;
    _bounds;
    _dataProvider;
    _delegate;
    _chartGroupExpansionSetting;
    _chart;
    _stoppedPermanently;
    constructor() {
        super();
        // set to update once per second _while the tab is active_
        this._intervalTimer = 0;
        this._lastTimestamp = 0;
        this._canTick = true;
        this._ticking = false;
        this._isShown = false;
        // The max bounds for scroll-out.
        this._bounds = new Bounds(0, 1000, 30000, 1000);
        // Create the data provider with the initial max bounds,
        // as well as a function to attempt bounds updating everywhere.
        this._dataProvider = new TickingFlameChartDataProvider(this._bounds, this._updateMaxTime.bind(this));
        // Delegate doesn't do much for now.
        this._delegate = new TickingFlameChartDelegate();
        // Chart settings.
        this._chartGroupExpansionSetting =
            Common.Settings.Settings.instance().createSetting('mediaFlameChartGroupExpansion', {});
        // Create the chart.
        this._chart =
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            new PerfUI.FlameChart.FlameChart(this._dataProvider, this._delegate, this._chartGroupExpansionSetting);
        // TODO: needs to have support in the delegate for supporting this.
        this._chart.disableRangeSelection();
        // Scrolling should change the current bounds, and repaint the chart.
        this._chart.bindCanvasEvent('wheel', e => {
            this._onScroll(e);
        });
        // Add the chart.
        this._chart.show(this.contentElement);
    }
    /**
     * Add a marker with |properties| at |time|.
     */
    addMarker(properties) {
        properties['duration'] = NaN;
        this.startEvent(properties);
    }
    /**
     * Create an event which will be set to live by default.
     */
    startEvent(properties) {
        // Make sure that an unspecified event gets live duration.
        // Have to check for undefined, since NaN is allowed but evaluates to false.
        if (properties['duration'] === undefined) {
            properties['duration'] = -1;
        }
        const time = properties['startTime'] || 0;
        // Event has to be created before the updateMaxTime call.
        const event = this._dataProvider.startEvent(properties);
        this._updateMaxTime(time);
        return event;
    }
    /**
     * Add a group with |name| that can contain |depth| different tracks.
     */
    addGroup(name, depth) {
        this._dataProvider.addGroup(name, depth);
    }
    _updateMaxTime(time) {
        if (this._bounds.pushMaxAtLeastTo(time)) {
            this._updateRender();
        }
    }
    _onScroll(e) {
        // TODO: is this a good divisor? does it account for high presicision scroll wheels?
        // low precisision scroll wheels?
        const scrollTickCount = Math.round(e.deltaY / 50);
        const scrollPositionRatio = e.offsetX / e.srcElement.clientWidth;
        if (scrollTickCount > 0) {
            this._bounds.zoomOut(scrollTickCount, scrollPositionRatio);
        }
        else {
            this._bounds.zoomIn(-scrollTickCount, scrollPositionRatio);
        }
        this._updateRender();
    }
    willHide() {
        this._isShown = false;
        if (this._ticking) {
            this._stop();
        }
    }
    wasShown() {
        this._isShown = true;
        if (this._canTick && !this._ticking) {
            this._start();
        }
    }
    set canTick(allowed) {
        this._canTick = allowed;
        if (this._ticking && !allowed) {
            this._stop();
        }
        if (!this._ticking && this._isShown && allowed) {
            this._start();
        }
    }
    _start() {
        if (this._lastTimestamp === 0) {
            this._lastTimestamp = Date.now();
        }
        if (this._intervalTimer !== 0 || this._stoppedPermanently) {
            return;
        }
        // 16 ms is roughly 60 fps.
        this._intervalTimer = window.setInterval(this._updateRender.bind(this), 16);
        this._ticking = true;
    }
    _stop(permanently = false) {
        window.clearInterval(this._intervalTimer);
        this._intervalTimer = 0;
        if (permanently) {
            this._stoppedPermanently = true;
        }
        this._ticking = false;
    }
    _updateRender() {
        if (this._ticking) {
            const currentTimestamp = Date.now();
            const duration = currentTimestamp - this._lastTimestamp;
            this._lastTimestamp = currentTimestamp;
            this._bounds.addMax(duration);
        }
        this._dataProvider.updateMaxTime(this._bounds);
        this._chart.setWindowTimes(this._bounds.low, this._bounds.high, true);
        this._chart.scheduleUpdate();
    }
}
/**
 * Doesn't do much right now, but can be used in the future for selecting events.
 */
class TickingFlameChartDelegate {
    constructor() {
    }
    windowChanged(_windowStartTime, _windowEndTime, _animate) {
    }
    updateRangeSelection(_startTime, _endTime) {
    }
    updateSelectedGroup(_flameChart, _group) {
    }
}
class TickingFlameChartDataProvider {
    _updateMaxTimeHandle;
    _bounds;
    _liveEvents;
    _eventMap;
    _timelineData;
    _maxLevel;
    constructor(initialBounds, updateMaxTime) {
        // do _not_ call this method from within this class - only for passing to events.
        this._updateMaxTimeHandle = updateMaxTime;
        this._bounds = initialBounds;
        // All the events which should have their time updated when the chart ticks.
        this._liveEvents = new Set();
        // All events.
        // Map<Event>
        this._eventMap = new Map();
        // Contains the numerical indicies. This is passed as a reference to the events
        // so that they can update it when they change.
        this._timelineData = new PerfUI.FlameChart.TimelineData([], [], [], []);
        // The current sum of all group heights.
        this._maxLevel = 0;
    }
    /**
     * Add a group with |name| that can contain |depth| different tracks.
     */
    addGroup(name, depth) {
        if (this._timelineData.groups) {
            this._timelineData.groups.push({
                name: name,
                startLevel: this._maxLevel,
                expanded: true,
                selectable: false,
                style: DefaultStyle,
                track: null,
            });
        }
        this._maxLevel += depth;
    }
    /**
     * Create an event which will be set to live by default.
     */
    startEvent(properties) {
        properties['level'] = properties['level'] || 0;
        if (properties['level'] > this._maxLevel) {
            throw `level ${properties['level']} is above the maximum allowed of ${this._maxLevel}`;
        }
        const event = new Event(this._timelineData, {
            setLive: this._setLive.bind(this),
            setComplete: this._setComplete.bind(this),
            updateMaxTime: this._updateMaxTimeHandle,
        }, properties);
        this._eventMap.set(event.id, event);
        return event;
    }
    _setLive(index) {
        this._liveEvents.add(index);
        return this._bounds.max;
    }
    _setComplete(index) {
        this._liveEvents.delete(index);
    }
    updateMaxTime(bounds) {
        this._bounds = bounds;
        for (const eventID of this._liveEvents.entries()) {
            // force recalculation of all live events.
            this._eventMap.get(eventID[0]).endTime = -1;
        }
    }
    maxStackDepth() {
        return this._maxLevel + 1;
    }
    timelineData() {
        return this._timelineData;
    }
    /** time in milliseconds
       */
    minimumBoundary() {
        return this._bounds.low;
    }
    totalTime() {
        return this._bounds.high;
    }
    entryColor(index) {
        return this._eventMap.get(index).color;
    }
    textColor(index) {
        return this._eventMap.get(index).fontColor;
    }
    entryTitle(index) {
        return this._eventMap.get(index).title;
    }
    entryFont(_index) {
        return defaultFont;
    }
    decorateEntry(_index, _context, _text, _barX, _barY, _barWidth, _barHeight, _unclippedBarX, _timeToPixelRatio) {
        return false;
    }
    forceDecoration(_index) {
        return false;
    }
    prepareHighlightedEntryInfo(index) {
        const element = document.createElement('div');
        this._eventMap.get(index).decorate(element);
        return element;
    }
    formatValue(value, _precision) {
        // value is always [0, X] so we need to add lower bound
        value += Math.round(this._bounds.low);
        // Magic numbers of pre-calculated logorithms.
        // we want to show additional decimals at the time when two adjacent labels
        // would otherwise show the same number. At 3840 pixels wide, that cutoff
        // happens to be about 30 seconds for one decimal and 2.8 for two decimals.
        if (this._bounds.range < 2800) {
            return formatMillisecondsToSeconds(value, 2);
        }
        if (this._bounds.range < 30000) {
            return formatMillisecondsToSeconds(value, 1);
        }
        return formatMillisecondsToSeconds(value, 0);
    }
    canJumpToEntry(_entryIndex) {
        return false;
    }
    navStartTimes() {
        return new Map();
    }
}
//# sourceMappingURL=TickingFlameChart.js.map