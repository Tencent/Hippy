// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import { TimelineUIUtils } from './TimelineUIUtils.js';
export class PerformanceModel extends Common.ObjectWrapper.ObjectWrapper {
    _mainTarget;
    _tracingModel;
    _filters;
    _timelineModel;
    _frameModel;
    _filmStripModel;
    _irModel;
    _window;
    _extensionTracingModels;
    _recordStartTime;
    constructor() {
        super();
        this._mainTarget = null;
        this._tracingModel = null;
        this._filters = [];
        this._timelineModel = new TimelineModel.TimelineModel.TimelineModelImpl();
        this._frameModel = new TimelineModel.TimelineFrameModel.TimelineFrameModel(event => TimelineUIUtils.eventStyle(event).category.name);
        this._filmStripModel = null;
        this._irModel = new TimelineModel.TimelineIRModel.TimelineIRModel();
        this._window = { left: 0, right: Infinity };
        this._extensionTracingModels = [];
        this._recordStartTime = undefined;
    }
    setMainTarget(target) {
        this._mainTarget = target;
    }
    mainTarget() {
        return this._mainTarget;
    }
    setRecordStartTime(time) {
        this._recordStartTime = time;
    }
    recordStartTime() {
        return this._recordStartTime;
    }
    setFilters(filters) {
        this._filters = filters;
    }
    filters() {
        return this._filters;
    }
    isVisible(event) {
        return this._filters.every(f => f.accept(event));
    }
    setTracingModel(model) {
        this._tracingModel = model;
        this._timelineModel.setEvents(model);
        let inputEvents = null;
        let animationEvents = null;
        for (const track of this._timelineModel.tracks()) {
            if (track.type === TimelineModel.TimelineModel.TrackType.Input) {
                inputEvents = track.asyncEvents;
            }
            if (track.type === TimelineModel.TimelineModel.TrackType.Animation) {
                animationEvents = track.asyncEvents;
            }
        }
        if (inputEvents || animationEvents) {
            this._irModel.populate(inputEvents || [], animationEvents || []);
        }
        const mainTracks = this._timelineModel.tracks().filter(track => track.type === TimelineModel.TimelineModel.TrackType.MainThread && track.forMainFrame &&
            track.events.length);
        const threadData = mainTracks.map(track => {
            const event = track.events[0];
            return { thread: event.thread, time: event.startTime };
        });
        this._frameModel.addTraceEvents(this._mainTarget, this._timelineModel.inspectedTargetEvents(), threadData);
        for (const entry of this._extensionTracingModels) {
            entry.model.adjustTime(this._tracingModel.minimumRecordTime() + (entry.timeOffset / 1000) - this._recordStartTime);
        }
        this._autoWindowTimes();
    }
    addExtensionEvents(title, model, timeOffset) {
        this._extensionTracingModels.push({ model: model, title: title, timeOffset: timeOffset });
        if (!this._tracingModel) {
            return;
        }
        model.adjustTime(this._tracingModel.minimumRecordTime() + (timeOffset / 1000) - this._recordStartTime);
        this.dispatchEventToListeners(Events.ExtensionDataAdded);
    }
    tracingModel() {
        if (!this._tracingModel) {
            throw 'call setTracingModel before accessing PerformanceModel';
        }
        return this._tracingModel;
    }
    timelineModel() {
        return this._timelineModel;
    }
    filmStripModel() {
        if (this._filmStripModel) {
            return this._filmStripModel;
        }
        if (!this._tracingModel) {
            throw 'call setTracingModel before accessing PerformanceModel';
        }
        this._filmStripModel = new SDK.FilmStripModel.FilmStripModel(this._tracingModel);
        return this._filmStripModel;
    }
    frames() {
        return this._frameModel.frames();
    }
    frameModel() {
        return this._frameModel;
    }
    interactionRecords() {
        return this._irModel.interactionRecords();
    }
    extensionInfo() {
        return this._extensionTracingModels;
    }
    dispose() {
        if (this._tracingModel) {
            this._tracingModel.dispose();
        }
        for (const extensionEntry of this._extensionTracingModels) {
            extensionEntry.model.dispose();
        }
    }
    filmStripModelFrame(frame) {
        // For idle frames, look at the state at the beginning of the frame.
        const screenshotTime = frame.idle ? frame.startTime : frame.endTime;
        const filmStripModel = this._filmStripModel;
        const filmStripFrame = filmStripModel.frameByTimestamp(screenshotTime);
        return filmStripFrame && filmStripFrame.timestamp - frame.endTime < 10 ? filmStripFrame : null;
    }
    save(stream) {
        if (!this._tracingModel) {
            throw 'call setTracingModel before accessing PerformanceModel';
        }
        const backingStorage = this._tracingModel.backingStorage();
        return backingStorage.writeToStream(stream);
    }
    setWindow(window, animate) {
        this._window = window;
        this.dispatchEventToListeners(Events.WindowChanged, { window, animate });
    }
    window() {
        return this._window;
    }
    _autoWindowTimes() {
        const timelineModel = this._timelineModel;
        let tasks = [];
        for (const track of timelineModel.tracks()) {
            // Deliberately pick up last main frame's track.
            if (track.type === TimelineModel.TimelineModel.TrackType.MainThread && track.forMainFrame) {
                tasks = track.tasks;
            }
        }
        if (!tasks.length) {
            this.setWindow({ left: timelineModel.minimumRecordTime(), right: timelineModel.maximumRecordTime() });
            return;
        }
        function findLowUtilizationRegion(startIndex, stopIndex) {
            const threshold = 0.1;
            let cutIndex = startIndex;
            let cutTime = (tasks[cutIndex].startTime + tasks[cutIndex].endTime) / 2;
            let usedTime = 0;
            const step = Math.sign(stopIndex - startIndex);
            for (let i = startIndex; i !== stopIndex; i += step) {
                const task = tasks[i];
                const taskTime = (task.startTime + task.endTime) / 2;
                const interval = Math.abs(cutTime - taskTime);
                if (usedTime < threshold * interval) {
                    cutIndex = i;
                    cutTime = taskTime;
                    usedTime = 0;
                }
                usedTime += task.duration;
            }
            return cutIndex;
        }
        const rightIndex = findLowUtilizationRegion(tasks.length - 1, 0);
        const leftIndex = findLowUtilizationRegion(0, rightIndex);
        let leftTime = tasks[leftIndex].startTime;
        let rightTime = tasks[rightIndex].endTime;
        const span = rightTime - leftTime;
        const totalSpan = timelineModel.maximumRecordTime() - timelineModel.minimumRecordTime();
        if (span < totalSpan * 0.1) {
            leftTime = timelineModel.minimumRecordTime();
            rightTime = timelineModel.maximumRecordTime();
        }
        else {
            leftTime = Math.max(leftTime - 0.05 * span, timelineModel.minimumRecordTime());
            rightTime = Math.min(rightTime + 0.05 * span, timelineModel.maximumRecordTime());
        }
        this.setWindow({ left: leftTime, right: rightTime });
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ExtensionDataAdded"] = "ExtensionDataAdded";
    Events["WindowChanged"] = "WindowChanged";
})(Events || (Events = {}));
//# sourceMappingURL=PerformanceModel.js.map