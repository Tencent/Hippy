/*
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
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../../core/common/common.js';
import * as UI from '../../legacy.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import { Events as OverviewGridEvents, OverviewGrid } from './OverviewGrid.js';
export class TimelineOverviewPane extends UI.Widget.VBox {
    _overviewCalculator;
    _overviewGrid;
    _cursorArea;
    _cursorElement;
    _overviewControls;
    _markers;
    _overviewInfo;
    _updateThrottler;
    _cursorEnabled;
    _cursorPosition;
    _lastWidth;
    _windowStartTime;
    _windowEndTime;
    _muteOnWindowChanged;
    constructor(prefix) {
        super();
        this.element.id = prefix + '-overview-pane';
        this._overviewCalculator = new TimelineOverviewCalculator();
        this._overviewGrid = new OverviewGrid(prefix, this._overviewCalculator);
        this.element.appendChild(this._overviewGrid.element);
        this._cursorArea = this._overviewGrid.element.createChild('div', 'overview-grid-cursor-area');
        this._cursorElement = this._overviewGrid.element.createChild('div', 'overview-grid-cursor-position');
        this._cursorArea.addEventListener('mousemove', this._onMouseMove.bind(this), true);
        this._cursorArea.addEventListener('mouseleave', this._hideCursor.bind(this), true);
        this._overviewGrid.setResizeEnabled(false);
        this._overviewGrid.addEventListener(OverviewGridEvents.WindowChanged, this._onWindowChanged, this);
        this._overviewGrid.setClickHandler(this._onClick.bind(this));
        this._overviewControls = [];
        this._markers = new Map();
        this._overviewInfo = new OverviewInfo(this._cursorElement);
        this._updateThrottler = new Common.Throttler.Throttler(100);
        this._cursorEnabled = false;
        this._cursorPosition = 0;
        this._lastWidth = 0;
        this._windowStartTime = 0;
        this._windowEndTime = Infinity;
        this._muteOnWindowChanged = false;
    }
    _onMouseMove(event) {
        if (!this._cursorEnabled) {
            return;
        }
        const mouseEvent = event;
        const target = event.target;
        this._cursorPosition = mouseEvent.offsetX + target.offsetLeft;
        this._cursorElement.style.left = this._cursorPosition + 'px';
        this._cursorElement.style.visibility = 'visible';
        this._overviewInfo.setContent(this._buildOverviewInfo());
    }
    async _buildOverviewInfo() {
        const document = this.element.ownerDocument;
        const x = this._cursorPosition;
        const elements = await Promise.all(this._overviewControls.map(control => control.overviewInfoPromise(x)));
        const fragment = document.createDocumentFragment();
        const nonNullElements = elements.filter(element => element !== null);
        fragment.append(...nonNullElements);
        return fragment;
    }
    _hideCursor() {
        this._cursorElement.style.visibility = 'hidden';
        this._overviewInfo.hide();
    }
    wasShown() {
        this._update();
    }
    willHide() {
        this._overviewInfo.hide();
    }
    onResize() {
        const width = this.element.offsetWidth;
        if (width === this._lastWidth) {
            return;
        }
        this._lastWidth = width;
        this.scheduleUpdate();
    }
    setOverviewControls(overviewControls) {
        for (let i = 0; i < this._overviewControls.length; ++i) {
            this._overviewControls[i].dispose();
        }
        for (let i = 0; i < overviewControls.length; ++i) {
            overviewControls[i].setCalculator(this._overviewCalculator);
            overviewControls[i].show(this._overviewGrid.element);
        }
        this._overviewControls = overviewControls;
        this._update();
    }
    setBounds(minimumBoundary, maximumBoundary) {
        this._overviewCalculator.setBounds(minimumBoundary, maximumBoundary);
        this._overviewGrid.setResizeEnabled(true);
        this._cursorEnabled = true;
    }
    setNavStartTimes(navStartTimes) {
        this._overviewCalculator.setNavStartTimes(navStartTimes);
    }
    scheduleUpdate() {
        this._updateThrottler.schedule(async () => {
            this._update();
        });
    }
    _update() {
        if (!this.isShowing()) {
            return;
        }
        this._overviewCalculator.setDisplayWidth(this._overviewGrid.clientWidth());
        for (let i = 0; i < this._overviewControls.length; ++i) {
            this._overviewControls[i].update();
        }
        this._overviewGrid.updateDividers(this._overviewCalculator);
        this._updateMarkers();
        this._updateWindow();
    }
    setMarkers(markers) {
        this._markers = markers;
    }
    _updateMarkers() {
        const filteredMarkers = new Map();
        for (const time of this._markers.keys()) {
            const marker = this._markers.get(time);
            const position = Math.round(this._overviewCalculator.computePosition(time));
            // Limit the number of markers to one per pixel.
            if (filteredMarkers.has(position)) {
                continue;
            }
            filteredMarkers.set(position, marker);
            marker.style.left = position + 'px';
        }
        this._overviewGrid.removeEventDividers();
        this._overviewGrid.addEventDividers([...filteredMarkers.values()]);
    }
    reset() {
        this._windowStartTime = 0;
        this._windowEndTime = Infinity;
        this._overviewCalculator.reset();
        this._overviewGrid.reset();
        this._overviewGrid.setResizeEnabled(false);
        this._cursorEnabled = false;
        this._hideCursor();
        this._markers = new Map();
        for (const control of this._overviewControls) {
            control.reset();
        }
        this._overviewInfo.hide();
        this.scheduleUpdate();
    }
    _onClick(event) {
        return this._overviewControls.some(control => control.onClick(event));
    }
    _onWindowChanged(event) {
        if (this._muteOnWindowChanged) {
            return;
        }
        // Always use first control as a time converter.
        if (!this._overviewControls.length) {
            return;
        }
        this._windowStartTime = event.data.rawStartValue;
        this._windowEndTime = event.data.rawEndValue;
        const windowTimes = { startTime: this._windowStartTime, endTime: this._windowEndTime };
        this.dispatchEventToListeners(Events.WindowChanged, windowTimes);
    }
    setWindowTimes(startTime, endTime) {
        if (startTime === this._windowStartTime && endTime === this._windowEndTime) {
            return;
        }
        this._windowStartTime = startTime;
        this._windowEndTime = endTime;
        this._updateWindow();
        this.dispatchEventToListeners(Events.WindowChanged, { startTime: startTime, endTime: endTime });
    }
    _updateWindow() {
        if (!this._overviewControls.length) {
            return;
        }
        const absoluteMin = this._overviewCalculator.minimumBoundary();
        const timeSpan = this._overviewCalculator.maximumBoundary() - absoluteMin;
        const haveRecords = absoluteMin > 0;
        const left = haveRecords && this._windowStartTime ? Math.min((this._windowStartTime - absoluteMin) / timeSpan, 1) : 0;
        const right = haveRecords && this._windowEndTime < Infinity ? (this._windowEndTime - absoluteMin) / timeSpan : 1;
        this._muteOnWindowChanged = true;
        this._overviewGrid.setWindow(left, right);
        this._muteOnWindowChanged = false;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["WindowChanged"] = "WindowChanged";
})(Events || (Events = {}));
export class TimelineOverviewCalculator {
    _minimumBoundary;
    _maximumBoundary;
    _workingArea;
    _navStartTimes;
    constructor() {
        this.reset();
    }
    computePosition(time) {
        return (time - this._minimumBoundary) / this.boundarySpan() * this._workingArea;
    }
    positionToTime(position) {
        return position / this._workingArea * this.boundarySpan() + this._minimumBoundary;
    }
    setBounds(minimumBoundary, maximumBoundary) {
        this._minimumBoundary = minimumBoundary;
        this._maximumBoundary = maximumBoundary;
    }
    setNavStartTimes(navStartTimes) {
        this._navStartTimes = navStartTimes;
    }
    setDisplayWidth(clientWidth) {
        this._workingArea = clientWidth;
    }
    reset() {
        this.setBounds(0, 100);
    }
    formatValue(value, precision) {
        // If there are nav start times the value needs to be remapped.
        if (this._navStartTimes) {
            // Find the latest possible nav start time which is considered earlier
            // than the value passed through.
            const navStartTimes = Array.from(this._navStartTimes.values());
            for (let i = navStartTimes.length - 1; i >= 0; i--) {
                if (value > navStartTimes[i].startTime) {
                    value -= (navStartTimes[i].startTime - this.zeroTime());
                    break;
                }
            }
        }
        return i18n.i18n.preciseMillisToString(value - this.zeroTime(), precision);
    }
    maximumBoundary() {
        return this._maximumBoundary;
    }
    minimumBoundary() {
        return this._minimumBoundary;
    }
    zeroTime() {
        return this._minimumBoundary;
    }
    boundarySpan() {
        return this._maximumBoundary - this._minimumBoundary;
    }
}
export class TimelineOverviewBase extends UI.Widget.VBox {
    _calculator;
    _canvas;
    _context;
    constructor() {
        super();
        this._calculator = null;
        this._canvas = this.element.createChild('canvas', 'fill');
        this._context = this._canvas.getContext('2d');
    }
    width() {
        return this._canvas.width;
    }
    height() {
        return this._canvas.height;
    }
    context() {
        if (!this._context) {
            throw new Error('Unable to retrieve canvas context');
        }
        return this._context;
    }
    calculator() {
        return this._calculator;
    }
    update() {
        this.resetCanvas();
    }
    dispose() {
        this.detach();
    }
    reset() {
    }
    overviewInfoPromise(_x) {
        return Promise.resolve(null);
    }
    setCalculator(calculator) {
        this._calculator = calculator;
    }
    onClick(_event) {
        return false;
    }
    resetCanvas() {
        if (this.element.clientWidth) {
            this.setCanvasSize(this.element.clientWidth, this.element.clientHeight);
        }
    }
    setCanvasSize(width, height) {
        this._canvas.width = width * window.devicePixelRatio;
        this._canvas.height = height * window.devicePixelRatio;
    }
}
export class OverviewInfo {
    _anchorElement;
    _glassPane;
    _visible;
    _element;
    constructor(anchor) {
        this._anchorElement = anchor;
        this._glassPane = new UI.GlassPane.GlassPane();
        this._glassPane.setPointerEventsBehavior(UI.GlassPane.PointerEventsBehavior.PierceContents);
        this._glassPane.setMarginBehavior(UI.GlassPane.MarginBehavior.Arrow);
        this._glassPane.setSizeBehavior(UI.GlassPane.SizeBehavior.MeasureContent);
        this._visible = false;
        this._element = UI.Utils
            .createShadowRootWithCoreStyles(this._glassPane.contentElement, {
            cssFile: 'ui/legacy/components/perf_ui/timelineOverviewInfo.css',
            enableLegacyPatching: false,
            delegatesFocus: undefined,
        })
            .createChild('div', 'overview-info');
    }
    async setContent(contentPromise) {
        this._visible = true;
        const content = await contentPromise;
        if (!this._visible) {
            return;
        }
        this._element.removeChildren();
        this._element.appendChild(content);
        this._glassPane.setContentAnchorBox(this._anchorElement.boxInWindow());
        if (!this._glassPane.isShowing()) {
            this._glassPane.show(this._anchorElement.ownerDocument);
        }
    }
    hide() {
        this._visible = false;
        this._glassPane.hide();
    }
}
//# sourceMappingURL=TimelineOverviewPane.js.map