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
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Coverage from '../coverage/coverage.js';
import { TimelineUIUtils } from './TimelineUIUtils.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Short for Network. Label for the network requests section of the Performance panel.
    */
    net: 'NET',
    /**
    *@description Text in Timeline Event Overview of the Performance panel
    */
    cpu: 'CPU',
    /**
    *@description Text in Timeline Event Overview of the Performance panel
    */
    fps: 'FPS',
    /**
    *@description Text in Timeline Event Overview of the Performance panel
    */
    heap: 'HEAP',
    /**
    *@description Heap size label text content in Timeline Event Overview of the Performance panel
    *@example {10 MB} PH1
    *@example {30 MB} PH2
    */
    sSDash: '{PH1} – {PH2}',
    /**
    *@description Text in Timeline Event Overview of the Performance panel
    */
    coverage: 'COVERAGE',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineEventOverview.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineEventOverview extends PerfUI.TimelineOverviewPane.TimelineOverviewBase {
    _model;
    constructor(id, title) {
        super();
        this.element.id = 'timeline-overview-' + id;
        this.element.classList.add('overview-strip');
        this._model = null;
        if (title) {
            this.element.createChild('div', 'timeline-overview-strip-title').textContent = title;
        }
    }
    setModel(model) {
        this._model = model;
    }
    _renderBar(begin, end, position, height, color) {
        const x = begin;
        const width = end - begin;
        const ctx = this.context();
        ctx.fillStyle = color;
        ctx.fillRect(x, position, width, height);
    }
}
export class TimelineEventOverviewInput extends TimelineEventOverview {
    constructor() {
        super('input', null);
    }
    update() {
        super.update();
        if (!this._model) {
            return;
        }
        const height = this.height();
        const descriptors = TimelineUIUtils.eventDispatchDesciptors();
        const descriptorsByType = new Map();
        let maxPriority = -1;
        for (const descriptor of descriptors) {
            for (const type of descriptor.eventTypes) {
                descriptorsByType.set(type, descriptor);
            }
            maxPriority = Math.max(maxPriority, descriptor.priority);
        }
        const minWidth = 2 * window.devicePixelRatio;
        const timeOffset = this._model.timelineModel().minimumRecordTime();
        const timeSpan = this._model.timelineModel().maximumRecordTime() - timeOffset;
        const canvasWidth = this.width();
        const scale = canvasWidth / timeSpan;
        for (let priority = 0; priority <= maxPriority; ++priority) {
            for (const track of this._model.timelineModel().tracks()) {
                for (let i = 0; i < track.events.length; ++i) {
                    const event = track.events[i];
                    if (event.name !== TimelineModel.TimelineModel.RecordType.EventDispatch) {
                        continue;
                    }
                    const descriptor = descriptorsByType.get(event.args['data']['type']);
                    if (!descriptor || descriptor.priority !== priority) {
                        continue;
                    }
                    if (event.endTime === undefined) {
                        continue;
                    }
                    const start = Platform.NumberUtilities.clamp(Math.floor((event.startTime - timeOffset) * scale), 0, canvasWidth);
                    const end = Platform.NumberUtilities.clamp(Math.ceil((event.endTime - timeOffset) * scale), 0, canvasWidth);
                    const width = Math.max(end - start, minWidth);
                    this._renderBar(start, start + width, 0, height, descriptor.color);
                }
            }
        }
    }
}
export class TimelineEventOverviewNetwork extends TimelineEventOverview {
    constructor() {
        super('network', i18nString(UIStrings.net));
    }
    update() {
        super.update();
        if (!this._model) {
            return;
        }
        const timelineModel = this._model.timelineModel();
        const bandHeight = this.height() / 2;
        const timeOffset = timelineModel.minimumRecordTime();
        const timeSpan = timelineModel.maximumRecordTime() - timeOffset;
        const canvasWidth = this.width();
        const scale = canvasWidth / timeSpan;
        const highPath = new Path2D();
        const lowPath = new Path2D();
        const highPrioritySet = new Set([
            "VeryHigh" /* VeryHigh */,
            "High" /* High */,
            "Medium" /* Medium */,
        ]);
        for (const request of timelineModel.networkRequests()) {
            const path = highPrioritySet.has(request.priority) ? highPath : lowPath;
            const s = Math.max(Math.floor((request.startTime - timeOffset) * scale), 0);
            const e = Math.min(Math.ceil((request.endTime - timeOffset) * scale + 1), canvasWidth);
            path.rect(s, 0, e - s, bandHeight - 1);
        }
        const ctx = this.context();
        ctx.save();
        ctx.fillStyle = 'hsl(214, 60%, 60%)';
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctx.fill(highPath);
        ctx.translate(0, bandHeight);
        ctx.fillStyle = 'hsl(214, 80%, 80%)';
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctx.fill(lowPath);
        ctx.restore();
    }
}
const categoryToIndex = new WeakMap();
export class TimelineEventOverviewCPUActivity extends TimelineEventOverview {
    _backgroundCanvas;
    constructor() {
        super('cpu-activity', i18nString(UIStrings.cpu));
        this._backgroundCanvas = this.element.createChild('canvas', 'fill background');
    }
    resetCanvas() {
        super.resetCanvas();
        this._backgroundCanvas.width = this.element.clientWidth * window.devicePixelRatio;
        this._backgroundCanvas.height = this.element.clientHeight * window.devicePixelRatio;
    }
    update() {
        super.update();
        if (!this._model) {
            return;
        }
        const timelineModel = this._model.timelineModel();
        const /** @const */ quantSizePx = 4 * window.devicePixelRatio;
        const width = this.width();
        const height = this.height();
        const baseLine = height;
        const timeOffset = timelineModel.minimumRecordTime();
        const timeSpan = timelineModel.maximumRecordTime() - timeOffset;
        const scale = width / timeSpan;
        const quantTime = quantSizePx / scale;
        const categories = TimelineUIUtils.categories();
        const categoryOrder = TimelineUIUtils.getTimelineMainEventCategories();
        const otherIndex = categoryOrder.indexOf('other');
        const idleIndex = 0;
        console.assert(idleIndex === categoryOrder.indexOf('idle'));
        for (let i = idleIndex + 1; i < categoryOrder.length; ++i) {
            categoryToIndex.set(categories[categoryOrder[i]], i);
        }
        const backgroundContext = this._backgroundCanvas.getContext('2d');
        if (!backgroundContext) {
            throw new Error('Could not find 2d canvas');
        }
        for (const track of timelineModel.tracks()) {
            if (track.type === TimelineModel.TimelineModel.TrackType.MainThread && track.forMainFrame) {
                drawThreadEvents(this.context(), track.events);
            }
            else {
                drawThreadEvents(backgroundContext, track.events);
            }
        }
        applyPattern(backgroundContext);
        function drawThreadEvents(ctx, events) {
            const quantizer = new Quantizer(timeOffset, quantTime, drawSample);
            let x = 0;
            const categoryIndexStack = [];
            const paths = [];
            const lastY = [];
            for (let i = 0; i < categoryOrder.length; ++i) {
                paths[i] = new Path2D();
                paths[i].moveTo(0, height);
                lastY[i] = height;
            }
            function drawSample(counters) {
                let y = baseLine;
                for (let i = idleIndex + 1; i < categoryOrder.length; ++i) {
                    const h = (counters[i] || 0) / quantTime * height;
                    y -= h;
                    paths[i].bezierCurveTo(x, lastY[i], x, y, x + quantSizePx / 2, y);
                    lastY[i] = y;
                }
                x += quantSizePx;
            }
            function onEventStart(e) {
                const index = categoryIndexStack.length ? categoryIndexStack[categoryIndexStack.length - 1] : idleIndex;
                quantizer.appendInterval(e.startTime, index);
                categoryIndexStack.push(categoryToIndex.get(TimelineUIUtils.eventStyle(e).category) || otherIndex);
            }
            function onEventEnd(e) {
                const lastCategoryIndex = categoryIndexStack.pop();
                if (e.endTime !== undefined && lastCategoryIndex) {
                    quantizer.appendInterval(e.endTime, lastCategoryIndex);
                }
            }
            TimelineModel.TimelineModel.TimelineModelImpl.forEachEvent(events, onEventStart, onEventEnd);
            quantizer.appendInterval(timeOffset + timeSpan + quantTime, idleIndex); // Kick drawing the last bucket.
            for (let i = categoryOrder.length - 1; i > 0; --i) {
                paths[i].lineTo(width, height);
                ctx.fillStyle = categories[categoryOrder[i]].color;
                ctx.fill(paths[i]);
            }
        }
        function applyPattern(ctx) {
            const step = 4 * window.devicePixelRatio;
            ctx.save();
            ctx.lineWidth = step / Math.sqrt(8);
            for (let x = 0.5; x < width + height; x += step) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x - height, height);
            }
            ctx.globalCompositeOperation = 'destination-out';
            ctx.stroke();
            ctx.restore();
        }
    }
}
export class TimelineEventOverviewResponsiveness extends TimelineEventOverview {
    constructor() {
        super('responsiveness', null);
    }
    update() {
        super.update();
        if (!this._model) {
            return;
        }
        const height = this.height();
        const timeOffset = this._model.timelineModel().minimumRecordTime();
        const timeSpan = this._model.timelineModel().maximumRecordTime() - timeOffset;
        const scale = this.width() / timeSpan;
        const frames = this._model.frames();
        const ctx = this.context();
        const fillPath = new Path2D();
        const markersPath = new Path2D();
        for (let i = 0; i < frames.length; ++i) {
            const frame = frames[i];
            if (!frame.hasWarnings()) {
                continue;
            }
            paintWarningDecoration(frame.startTime, frame.duration);
        }
        for (const track of this._model.timelineModel().tracks()) {
            const events = track.events;
            for (let i = 0; i < events.length; ++i) {
                if (!TimelineModel.TimelineModel.TimelineData.forEvent(events[i]).warning) {
                    continue;
                }
                const duration = events[i].duration;
                if (duration !== undefined) {
                    paintWarningDecoration(events[i].startTime, duration);
                }
            }
        }
        ctx.fillStyle = 'hsl(0, 80%, 90%)';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 * window.devicePixelRatio;
        ctx.fill(fillPath);
        ctx.stroke(markersPath);
        function paintWarningDecoration(time, duration) {
            const x = Math.round(scale * (time - timeOffset));
            const w = Math.round(scale * duration);
            fillPath.rect(x, 0, w, height);
            markersPath.moveTo(x + w, 0);
            markersPath.lineTo(x + w, height);
        }
    }
}
export class TimelineFilmStripOverview extends TimelineEventOverview {
    _frameToImagePromise;
    _lastFrame;
    _lastElement;
    _drawGeneration;
    _emptyImage;
    _imageWidth;
    constructor() {
        super('filmstrip', null);
        this._frameToImagePromise = new Map();
        this._lastFrame = null;
        this._lastElement = null;
        this.reset();
    }
    update() {
        super.update();
        const frames = this._model ? this._model.filmStripModel().frames() : [];
        if (!frames.length) {
            return;
        }
        const drawGeneration = Symbol('drawGeneration');
        this._drawGeneration = drawGeneration;
        this._imageByFrame(frames[0]).then(image => {
            if (this._drawGeneration !== drawGeneration) {
                return;
            }
            if (!image || !image.naturalWidth || !image.naturalHeight) {
                return;
            }
            const imageHeight = this.height() - 2 * TimelineFilmStripOverview.Padding;
            const imageWidth = Math.ceil(imageHeight * image.naturalWidth / image.naturalHeight);
            const popoverScale = Math.min(200 / image.naturalWidth, 1);
            this._emptyImage = new Image(image.naturalWidth * popoverScale, image.naturalHeight * popoverScale);
            this._drawFrames(imageWidth, imageHeight);
        });
    }
    async _imageByFrame(frame) {
        let imagePromise = this._frameToImagePromise.get(frame);
        if (!imagePromise) {
            const data = await frame.imageDataPromise();
            imagePromise = UI.UIUtils.loadImageFromData(data);
            this._frameToImagePromise.set(frame, imagePromise);
        }
        return imagePromise;
    }
    _drawFrames(imageWidth, imageHeight) {
        if (!imageWidth || !this._model) {
            return;
        }
        const filmStripModel = this._model.filmStripModel();
        if (!filmStripModel.frames().length) {
            return;
        }
        const padding = TimelineFilmStripOverview.Padding;
        const width = this.width();
        const zeroTime = filmStripModel.zeroTime();
        const spanTime = filmStripModel.spanTime();
        const scale = spanTime / width;
        const context = this.context();
        const drawGeneration = this._drawGeneration;
        context.beginPath();
        for (let x = padding; x < width; x += imageWidth + 2 * padding) {
            const time = zeroTime + (x + imageWidth / 2) * scale;
            const frame = filmStripModel.frameByTimestamp(time);
            if (!frame) {
                continue;
            }
            context.rect(x - 0.5, 0.5, imageWidth + 1, imageHeight + 1);
            this._imageByFrame(frame).then(drawFrameImage.bind(this, x));
        }
        context.strokeStyle = '#ddd';
        context.stroke();
        function drawFrameImage(x, image) {
            // Ignore draws deferred from a previous update call.
            if (this._drawGeneration !== drawGeneration || !image) {
                return;
            }
            context.drawImage(image, x, 1, imageWidth, imageHeight);
        }
    }
    async overviewInfoPromise(x) {
        if (!this._model || !this._model.filmStripModel().frames().length) {
            return null;
        }
        const calculator = this.calculator();
        if (!calculator) {
            return null;
        }
        const time = calculator.positionToTime(x);
        const frame = this._model.filmStripModel().frameByTimestamp(time);
        if (frame === this._lastFrame) {
            return this._lastElement;
        }
        const imagePromise = frame ? this._imageByFrame(frame) : Promise.resolve(this._emptyImage);
        const image = await imagePromise;
        const element = document.createElement('div');
        element.classList.add('frame');
        if (image) {
            element.createChild('div', 'thumbnail').appendChild(image);
        }
        this._lastFrame = frame;
        this._lastElement = element;
        return element;
    }
    reset() {
        this._lastFrame = null;
        this._lastElement = null;
        this._frameToImagePromise = new Map();
        this._imageWidth = 0;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static Padding = 2;
}
export class TimelineEventOverviewFrames extends TimelineEventOverview {
    constructor() {
        super('framerate', i18nString(UIStrings.fps));
    }
    update() {
        super.update();
        if (!this._model) {
            return;
        }
        const frames = this._model.frames();
        if (!frames.length) {
            return;
        }
        const height = this.height();
        const padding = Number(window.devicePixelRatio);
        const baseFrameDurationMs = 1e3 / 60;
        const visualHeight = height - 2 * padding;
        const timeOffset = this._model.timelineModel().minimumRecordTime();
        const timeSpan = this._model.timelineModel().maximumRecordTime() - timeOffset;
        const scale = this.width() / timeSpan;
        const baseY = height - padding;
        const ctx = this.context();
        const bottomY = baseY + 10 * window.devicePixelRatio;
        let x = 0;
        let y = bottomY;
        const lineWidth = window.devicePixelRatio;
        const offset = lineWidth & 1 ? 0.5 : 0;
        const tickDepth = 1.5 * window.devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let i = 0; i < frames.length; ++i) {
            const frame = frames[i];
            x = Math.round((frame.startTime - timeOffset) * scale) + offset;
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + tickDepth);
            y = frame.idle ? bottomY :
                Math.round(baseY - visualHeight * Math.min(baseFrameDurationMs / frame.duration, 1)) - offset;
            ctx.lineTo(x, y + tickDepth);
            ctx.lineTo(x, y);
        }
        const lastFrame = frames[frames.length - 1];
        if (lastFrame) {
            x = Math.round((lastFrame.startTime + lastFrame.duration - timeOffset) * scale) + offset;
        }
        ctx.lineTo(x, y);
        ctx.lineTo(x, bottomY);
        ctx.fillStyle = 'hsl(110, 50%, 88%)';
        ctx.strokeStyle = 'hsl(110, 50%, 60%)';
        ctx.lineWidth = lineWidth;
        ctx.fill();
        ctx.stroke();
    }
}
export class TimelineEventOverviewMemory extends TimelineEventOverview {
    _heapSizeLabel;
    constructor() {
        super('memory', i18nString(UIStrings.heap));
        this._heapSizeLabel = this.element.createChild('div', 'memory-graph-label');
    }
    resetHeapSizeLabels() {
        this._heapSizeLabel.textContent = '';
    }
    update() {
        super.update();
        const ratio = window.devicePixelRatio;
        if (!this._model) {
            this.resetHeapSizeLabels();
            return;
        }
        const tracks = this._model.timelineModel().tracks().filter(track => track.type === TimelineModel.TimelineModel.TrackType.MainThread && track.forMainFrame);
        const trackEvents = tracks.map(track => track.events);
        const lowerOffset = 3 * ratio;
        let maxUsedHeapSize = 0;
        let minUsedHeapSize = 100000000000;
        const minTime = this._model.timelineModel().minimumRecordTime();
        const maxTime = this._model.timelineModel().maximumRecordTime();
        function isUpdateCountersEvent(event) {
            return event.name === TimelineModel.TimelineModel.RecordType.UpdateCounters;
        }
        for (let i = 0; i < trackEvents.length; i++) {
            trackEvents[i] = trackEvents[i].filter(isUpdateCountersEvent);
        }
        function calculateMinMaxSizes(event) {
            const counters = event.args.data;
            if (!counters || !counters.jsHeapSizeUsed) {
                return;
            }
            maxUsedHeapSize = Math.max(maxUsedHeapSize, counters.jsHeapSizeUsed);
            minUsedHeapSize = Math.min(minUsedHeapSize, counters.jsHeapSizeUsed);
        }
        for (let i = 0; i < trackEvents.length; i++) {
            trackEvents[i].forEach(calculateMinMaxSizes);
        }
        minUsedHeapSize = Math.min(minUsedHeapSize, maxUsedHeapSize);
        const lineWidth = 1;
        const width = this.width();
        const height = this.height() - lowerOffset;
        const xFactor = width / (maxTime - minTime);
        const yFactor = (height - lineWidth) / Math.max(maxUsedHeapSize - minUsedHeapSize, 1);
        const histogram = new Array(width);
        function buildHistogram(event) {
            const counters = event.args.data;
            if (!counters || !counters.jsHeapSizeUsed) {
                return;
            }
            const x = Math.round((event.startTime - minTime) * xFactor);
            const y = Math.round((counters.jsHeapSizeUsed - minUsedHeapSize) * yFactor);
            // TODO(alph): use sum instead of max.
            histogram[x] = Math.max(histogram[x] || 0, y);
        }
        for (let i = 0; i < trackEvents.length; i++) {
            trackEvents[i].forEach(buildHistogram);
        }
        const ctx = this.context();
        const heightBeyondView = height + lowerOffset + lineWidth;
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(-lineWidth, heightBeyondView);
        let y = 0;
        let isFirstPoint = true;
        let lastX = 0;
        for (let x = 0; x < histogram.length; x++) {
            if (typeof histogram[x] === 'undefined') {
                continue;
            }
            if (isFirstPoint) {
                isFirstPoint = false;
                y = histogram[x];
                ctx.lineTo(-lineWidth, height - y);
            }
            const nextY = histogram[x];
            if (Math.abs(nextY - y) > 2 && Math.abs(x - lastX) > 1) {
                ctx.lineTo(x, height - y);
            }
            y = nextY;
            ctx.lineTo(x, height - y);
            lastX = x;
        }
        ctx.lineTo(width + lineWidth, height - y);
        ctx.lineTo(width + lineWidth, heightBeyondView);
        ctx.closePath();
        ctx.fillStyle = 'hsla(220, 90%, 70%, 0.2)';
        ctx.fill();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'hsl(220, 90%, 70%)';
        ctx.stroke();
        this._heapSizeLabel.textContent = i18nString(UIStrings.sSDash, {
            PH1: Platform.NumberUtilities.bytesToString(minUsedHeapSize),
            PH2: Platform.NumberUtilities.bytesToString(maxUsedHeapSize),
        });
    }
}
export class Quantizer {
    _lastTime;
    _quantDuration;
    _callback;
    _counters;
    _remainder;
    constructor(startTime, quantDuration, callback) {
        this._lastTime = startTime;
        this._quantDuration = quantDuration;
        this._callback = callback;
        this._counters = [];
        this._remainder = quantDuration;
    }
    appendInterval(time, group) {
        let interval = time - this._lastTime;
        if (interval <= this._remainder) {
            this._counters[group] = (this._counters[group] || 0) + interval;
            this._remainder -= interval;
            this._lastTime = time;
            return;
        }
        this._counters[group] = (this._counters[group] || 0) + this._remainder;
        this._callback(this._counters);
        interval -= this._remainder;
        while (interval >= this._quantDuration) {
            const counters = [];
            counters[group] = this._quantDuration;
            this._callback(counters);
            interval -= this._quantDuration;
        }
        this._counters = [];
        this._counters[group] = interval;
        this._lastTime = time;
        this._remainder = this._quantDuration - interval;
    }
}
export class TimelineEventOverviewCoverage extends TimelineEventOverview {
    _heapSizeLabel;
    _coverageModel;
    constructor() {
        super('coverage', i18nString(UIStrings.coverage));
        this._heapSizeLabel = this.element.createChild('div', 'timeline-overview-coverage-label');
    }
    resetHeapSizeLabels() {
        this._heapSizeLabel.textContent = '';
    }
    setModel(model) {
        super.setModel(model);
        if (model) {
            const mainTarget = model.mainTarget();
            if (mainTarget) {
                this._coverageModel = mainTarget.model(Coverage.CoverageModel.CoverageModel);
            }
        }
    }
    update() {
        super.update();
        const ratio = window.devicePixelRatio;
        if (!this._coverageModel) {
            return;
        }
        let total = 0;
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/naming-convention
        let total_used = 0;
        const usedByTimestamp = new Map();
        const totalByTimestamp = new Map();
        for (const urlInfo of this._coverageModel.entries()) {
            for (const info of urlInfo.entries()) {
                total += info.size();
                for (const [stamp, used] of info.usedByTimestamp()) {
                    total_used += used;
                    let uniqueTimestamps = totalByTimestamp.get(stamp);
                    if (uniqueTimestamps === undefined) {
                        uniqueTimestamps = new Set();
                        totalByTimestamp.set(stamp, uniqueTimestamps);
                    }
                    uniqueTimestamps.add(info);
                    const previousCount = usedByTimestamp.get(stamp);
                    if (previousCount === undefined) {
                        usedByTimestamp.set(stamp, used);
                    }
                    else {
                        usedByTimestamp.set(stamp, previousCount + used);
                    }
                }
            }
        }
        const seen = new Set();
        const coverageByTimestamp = new Map();
        let sumTotal = 0, sumUsed = 0;
        const sortedByTimestamp = Array.from(totalByTimestamp.entries()).sort((a, b) => a[0] - b[0]);
        for (const [stamp, infos] of sortedByTimestamp) {
            for (const info of infos.values()) {
                if (seen.has(info)) {
                    continue;
                }
                seen.add(info);
                sumTotal += info.size();
            }
            sumUsed += usedByTimestamp.get(stamp) || 0;
            coverageByTimestamp.set(stamp, sumUsed / sumTotal);
        }
        const percentUsed = total ? Math.round(100 * total_used / total) : 0;
        const lowerOffset = 3 * ratio;
        const millisecondsPerSecond = 1000;
        if (!this._model) {
            return;
        }
        const minTime = this._model.timelineModel().minimumRecordTime() / millisecondsPerSecond;
        const maxTime = this._model.timelineModel().maximumRecordTime() / millisecondsPerSecond;
        const lineWidth = 1;
        const width = this.width();
        const height = this.height() - lowerOffset;
        const xFactor = width / (maxTime - minTime);
        const yFactor = height - lineWidth;
        let yOffset = 0;
        const ctx = this.context();
        const heightBeyondView = height + lowerOffset + lineWidth;
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(-lineWidth, heightBeyondView);
        ctx.lineTo(-lineWidth, height - yOffset);
        let previous = null;
        for (const stamp of this._coverageModel.coverageUpdateTimes()) {
            const coverage = coverageByTimestamp.get(stamp) || previous;
            previous = coverage;
            if (!coverage) {
                continue;
            }
            if (stamp > maxTime) {
                break;
            }
            const x = (stamp - minTime) * xFactor;
            yOffset = coverage * yFactor;
            ctx.lineTo(x, height - yOffset);
        }
        const white = 'hsl(0, 100%, 100%)';
        const blue = 'hsl(220, 90%, 70%)';
        const transparentBlue = 'hsla(220, 90%, 70%, 0.2)';
        ctx.lineTo(width + lineWidth, height - yOffset);
        ctx.lineTo(width + lineWidth, heightBeyondView);
        ctx.closePath();
        ctx.fillStyle = transparentBlue;
        ctx.fill();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = blue;
        ctx.stroke();
        previous = null;
        for (const stamp of this._coverageModel.coverageUpdateTimes()) {
            const coverage = coverageByTimestamp.get(stamp) || previous;
            previous = coverage;
            if (!coverage) {
                continue;
            }
            ctx.beginPath();
            const x = (stamp - minTime) * xFactor;
            const y = height - coverage * yFactor;
            ctx.arc(x, y, 2 * lineWidth, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = coverageByTimestamp.has(stamp) ? blue : white;
            ctx.fill();
        }
        this._heapSizeLabel.textContent = `${percentUsed}% used`;
    }
}
//# sourceMappingURL=TimelineEventOverview.js.map