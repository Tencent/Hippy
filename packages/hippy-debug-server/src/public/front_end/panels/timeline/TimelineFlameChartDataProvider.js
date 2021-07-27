/*
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
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { FlameChartStyle, Selection, TimelineFlameChartMarker } from './TimelineFlameChartView.js';
import { TimelineSelection } from './TimelinePanel.js';
import { TimelineUIUtils } from './TimelineUIUtils.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    onIgnoreList: 'On ignore list',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    input: 'Input',
    /**
    *@description Text that refers to the animation of the web page
    */
    animation: 'Animation',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    timings: 'Timings',
    /**
    *@description Title of the Console tool
    */
    console: 'Console',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    *@example {example.com} PH1
    */
    mainS: 'Main — {PH1}',
    /**
    *@description Text that refers to the main target
    */
    main: 'Main',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    *@example {https://example.com} PH1
    */
    frameS: 'Frame — {PH1}',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    subframe: 'Subframe',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    raster: 'Raster',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    *@example {2} PH1
    */
    rasterizerThreadS: 'Rasterizer Thread {PH1}',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    gpu: 'GPU',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    thread: 'Thread',
    /**
    *@description Text in Timeline for the Experience title
    */
    experience: 'Experience',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    interactions: 'Interactions',
    /**
    *@description Text for rendering frames
    */
    frames: 'Frames',
    /**
    * @description Text in the Performance panel to show how long was spent in a particular part of the code.
    * The first placeholder is the total time taken for this node and all children, the second is the self time
    * (time taken in this node, without children included).
    *@example {10ms} PH1
    *@example {10ms} PH2
    */
    sSelfS: '{PH1} (self {PH2})',
    /**
    *@description Tooltip text for the number of CLS occurences in Timeline
    *@example {4} PH1
    */
    occurrencesS: 'Occurrences: {PH1}',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    *@example {10ms} PH1
    *@example {100.0} PH2
    */
    sFfps: '{PH1} ~ {PH2} fps',
    /**
    *@description Text in Timeline Flame Chart Data Provider of the Performance panel
    */
    idleFrame: 'Idle Frame',
    /**
    *@description Text in Timeline Frame Chart Data Provider of the Performance panel
    */
    droppedFrame: 'Dropped Frame',
    /**
    *@description Text for a rendering frame
    */
    frame: 'Frame',
    /**
    *@description Warning text content in Timeline Flame Chart Data Provider of the Performance panel
    */
    longFrame: 'Long frame',
    /**
    * @description Text for the name of a thread of the page. Used when there are multiple threads but
    * a more specific name for this thread is not available. The placeholder is a number that uniquely
    * identifies this thread.
    * @example {1} PH1
    */
    threadS: 'Thread {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineFlameChartDataProvider.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineFlameChartDataProvider extends Common.ObjectWrapper.ObjectWrapper {
    _font;
    _timelineData;
    _currentLevel;
    _performanceModel;
    _model;
    _minimumBoundary;
    _maximumBoundary;
    _timeSpan;
    _consoleColorGenerator;
    _extensionColorGenerator;
    _headerLevel1;
    _headerLevel2;
    _staticHeader;
    _framesHeader;
    _collapsibleTimingsHeader;
    _timingsHeader;
    _screenshotsHeader;
    _interactionsHeaderLevel1;
    _interactionsHeaderLevel2;
    _experienceHeader;
    _flowEventIndexById;
    _entryData;
    _entryTypeByLevel;
    _markers;
    _asyncColorByInteractionPhase;
    _screenshotImageCache;
    _extensionInfo;
    _entryIndexToTitle;
    _asyncColorByCategory;
    _lastInitiatorEntry;
    _entryParent;
    _frameGroup;
    _lastSelection;
    _colorForEvent;
    constructor() {
        super();
        this.reset();
        this._font = '11px ' + Host.Platform.fontFamily();
        this._timelineData = null;
        this._currentLevel = 0;
        this._performanceModel = null;
        this._model = null;
        this._minimumBoundary = 0;
        this._maximumBoundary = 0;
        this._timeSpan = 0;
        this._consoleColorGenerator = new Common.Color.Generator({
            min: 30,
            max: 55,
            count: undefined,
        }, { min: 70, max: 100, count: 6 }, 50, 0.7);
        this._extensionColorGenerator = new Common.Color.Generator({
            min: 210,
            max: 300,
            count: undefined,
        }, { min: 70, max: 100, count: 6 }, 70, 0.7);
        this._headerLevel1 = this._buildGroupStyle({ shareHeaderLine: false });
        this._headerLevel2 = this._buildGroupStyle({ padding: 2, nestingLevel: 1, collapsible: false });
        this._staticHeader = this._buildGroupStyle({ collapsible: false });
        this._framesHeader = this._buildGroupStyle({ useFirstLineForOverview: true });
        this._collapsibleTimingsHeader =
            this._buildGroupStyle({ shareHeaderLine: true, useFirstLineForOverview: true, collapsible: true });
        this._timingsHeader =
            this._buildGroupStyle({ shareHeaderLine: true, useFirstLineForOverview: true, collapsible: false });
        this._screenshotsHeader =
            this._buildGroupStyle({ useFirstLineForOverview: true, nestingLevel: 1, collapsible: false, itemsHeight: 150 });
        this._interactionsHeaderLevel1 = this._buildGroupStyle({ useFirstLineForOverview: true });
        this._interactionsHeaderLevel2 = this._buildGroupStyle({ padding: 2, nestingLevel: 1 });
        this._experienceHeader = this._buildGroupStyle({ collapsible: false });
        this._flowEventIndexById = new Map();
    }
    _buildGroupStyle(extra) {
        const defaultGroupStyle = {
            padding: 4,
            height: 17,
            collapsible: true,
            color: ThemeSupport.ThemeSupport.instance().patchColorText('#222', ThemeSupport.ThemeSupport.ColorUsage.Foreground),
            backgroundColor: ThemeSupport.ThemeSupport.instance().patchColorText('white', ThemeSupport.ThemeSupport.ColorUsage.Background),
            font: this._font,
            nestingLevel: 0,
            shareHeaderLine: true,
        };
        return /** @type {!PerfUI.FlameChart.GroupStyle} */ Object.assign(defaultGroupStyle, extra);
    }
    setModel(performanceModel) {
        this.reset();
        this._performanceModel = performanceModel;
        this._model = performanceModel && performanceModel.timelineModel();
    }
    groupTrack(group) {
        return group.track || null;
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
    entryTitle(entryIndex) {
        const entryTypes = EntryType;
        const entryType = this._entryType(entryIndex);
        if (entryType === entryTypes.Event) {
            const event = this._entryData[entryIndex];
            if (event.phase === SDK.TracingModel.Phase.AsyncStepInto ||
                event.phase === SDK.TracingModel.Phase.AsyncStepPast) {
                return event.name + ':' + event.args['step'];
            }
            if (eventToDisallowRoot.get(event)) {
                return i18nString(UIStrings.onIgnoreList);
            }
            if (this._performanceModel && this._performanceModel.timelineModel().isMarkerEvent(event)) {
                return TimelineUIUtils.markerShortTitle(event);
            }
            return TimelineUIUtils.eventTitle(event);
        }
        if (entryType === entryTypes.ExtensionEvent) {
            const event = this._entryData[entryIndex];
            return event.name;
        }
        if (entryType === entryTypes.Screenshot) {
            return '';
        }
        let title = this._entryIndexToTitle[entryIndex];
        if (!title) {
            title = `Unexpected entryIndex ${entryIndex}`;
            console.error(title);
        }
        return title;
    }
    textColor(index) {
        const event = this._entryData[index];
        return event && eventToDisallowRoot.get(event) ? '#888' : FlameChartStyle.textColor;
    }
    entryFont(_index) {
        return this._font;
    }
    reset() {
        this._currentLevel = 0;
        this._timelineData = null;
        this._entryData = [];
        this._entryParent = [];
        this._entryTypeByLevel = [];
        this._entryIndexToTitle = [];
        this._markers = [];
        this._asyncColorByCategory = new Map();
        this._asyncColorByInteractionPhase = new Map();
        this._extensionInfo = [];
        this._screenshotImageCache = new Map();
    }
    maxStackDepth() {
        return this._currentLevel;
    }
    timelineData() {
        if (this._timelineData) {
            return this._timelineData;
        }
        this._timelineData = new PerfUI.FlameChart.TimelineData([], [], [], []);
        if (!this._model) {
            return this._timelineData;
        }
        this._flowEventIndexById.clear();
        this._minimumBoundary = this._model.minimumRecordTime();
        this._timeSpan = this._model.isEmpty() ? 1000 : this._model.maximumRecordTime() - this._minimumBoundary;
        this._currentLevel = 0;
        if (this._model.isGenericTrace()) {
            this._processGenericTrace();
        }
        else {
            this._processInspectorTrace();
        }
        return this._timelineData;
    }
    _processGenericTrace() {
        const processGroupStyle = this._buildGroupStyle({ shareHeaderLine: false });
        const threadGroupStyle = this._buildGroupStyle({ padding: 2, nestingLevel: 1, shareHeaderLine: false });
        const eventEntryType = EntryType.Event;
        const tracksByProcess = new Platform.MapUtilities.Multimap();
        if (!this._model) {
            return;
        }
        for (const track of this._model.tracks()) {
            if (track.thread !== null) {
                tracksByProcess.set(track.thread.process(), track);
            }
            else {
                // The Timings track can reach this point, so we should probably do something more useful.
                console.error('Failed to process track');
            }
        }
        for (const process of tracksByProcess.keysArray()) {
            if (tracksByProcess.size > 1) {
                const name = `${process.name()} ${process.id()}`;
                this._appendHeader(name, processGroupStyle, false /* selectable */);
            }
            for (const track of tracksByProcess.get(process)) {
                const group = this._appendSyncEvents(track, track.events, track.name, threadGroupStyle, eventEntryType, true /* selectable */);
                if (this._timelineData &&
                    (!this._timelineData.selectedGroup ||
                        track.name === TimelineModel.TimelineModel.TimelineModelImpl.BrowserMainThreadName)) {
                    this._timelineData.selectedGroup = group;
                }
            }
        }
    }
    _processInspectorTrace() {
        this._appendFrames();
        this._appendInteractionRecords();
        const eventEntryType = EntryType.Event;
        const weight = (track) => {
            switch (track.type) {
                case TimelineModel.TimelineModel.TrackType.Input:
                    return 0;
                case TimelineModel.TimelineModel.TrackType.Animation:
                    return 1;
                case TimelineModel.TimelineModel.TrackType.Timings:
                    return 2;
                case TimelineModel.TimelineModel.TrackType.Console:
                    return 3;
                case TimelineModel.TimelineModel.TrackType.Experience:
                    return 4;
                case TimelineModel.TimelineModel.TrackType.MainThread:
                    return track.forMainFrame ? 5 : 6;
                case TimelineModel.TimelineModel.TrackType.Worker:
                    return 7;
                case TimelineModel.TimelineModel.TrackType.Raster:
                    return 8;
                case TimelineModel.TimelineModel.TrackType.GPU:
                    return 9;
                case TimelineModel.TimelineModel.TrackType.Other:
                    return 10;
                default:
                    return -1;
            }
        };
        if (!this._model) {
            return;
        }
        const tracks = this._model.tracks().slice();
        tracks.sort((a, b) => weight(a) - weight(b));
        let rasterCount = 0;
        for (const track of tracks) {
            switch (track.type) {
                case TimelineModel.TimelineModel.TrackType.Input: {
                    this._appendAsyncEventsGroup(track, i18nString(UIStrings.input), track.asyncEvents, this._interactionsHeaderLevel2, eventEntryType, false /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.Animation: {
                    this._appendAsyncEventsGroup(track, i18nString(UIStrings.animation), track.asyncEvents, this._interactionsHeaderLevel2, eventEntryType, false /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.Timings: {
                    const style = track.asyncEvents.length > 0 ? this._collapsibleTimingsHeader : this._timingsHeader;
                    const group = this._appendHeader(i18nString(UIStrings.timings), style, true /* selectable */);
                    group.track = track;
                    this._appendPageMetrics();
                    this._copyPerfMarkEvents(track);
                    this._appendSyncEvents(track, track.events, null, null, eventEntryType, true /* selectable */);
                    this._appendAsyncEventsGroup(track, null, track.asyncEvents, null, eventEntryType, true /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.Console: {
                    this._appendAsyncEventsGroup(track, i18nString(UIStrings.console), track.asyncEvents, this._headerLevel1, eventEntryType, true /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.MainThread: {
                    if (track.forMainFrame) {
                        const group = this._appendSyncEvents(track, track.events, track.url ? i18nString(UIStrings.mainS, { PH1: track.url }) : i18nString(UIStrings.main), this._headerLevel1, eventEntryType, true /* selectable */);
                        if (group && this._timelineData) {
                            this._timelineData.selectedGroup = group;
                        }
                    }
                    else {
                        this._appendSyncEvents(track, track.events, track.url ? i18nString(UIStrings.frameS, { PH1: track.url }) : i18nString(UIStrings.subframe), this._headerLevel1, eventEntryType, true /* selectable */);
                    }
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.Worker: {
                    this._appendSyncEvents(track, track.events, track.name, this._headerLevel1, eventEntryType, true /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.Raster: {
                    if (!rasterCount) {
                        this._appendHeader(i18nString(UIStrings.raster), this._headerLevel1, false /* selectable */);
                    }
                    ++rasterCount;
                    this._appendSyncEvents(track, track.events, i18nString(UIStrings.rasterizerThreadS, { PH1: rasterCount }), this._headerLevel2, eventEntryType, true /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.GPU: {
                    this._appendSyncEvents(track, track.events, i18nString(UIStrings.gpu), this._headerLevel1, eventEntryType, true /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.Other: {
                    this._appendSyncEvents(track, track.events, track.name || i18nString(UIStrings.thread), this._headerLevel1, eventEntryType, true /* selectable */);
                    this._appendAsyncEventsGroup(track, track.name, track.asyncEvents, this._headerLevel1, eventEntryType, true /* selectable */);
                    break;
                }
                case TimelineModel.TimelineModel.TrackType.Experience: {
                    this._appendSyncEvents(track, track.events, i18nString(UIStrings.experience), this._experienceHeader, eventEntryType, true /* selectable */);
                    break;
                }
            }
        }
        if (this._timelineData && this._timelineData.selectedGroup) {
            this._timelineData.selectedGroup.expanded = true;
        }
        for (let extensionIndex = 0; extensionIndex < this._extensionInfo.length; extensionIndex++) {
            this._innerAppendExtensionEvents(extensionIndex);
        }
        this._markers.sort((a, b) => a.startTime() - b.startTime());
        if (this._timelineData) {
            this._timelineData.markers = this._markers;
        }
        this._flowEventIndexById.clear();
    }
    minimumBoundary() {
        return this._minimumBoundary;
    }
    totalTime() {
        return this._timeSpan;
    }
    search(startTime, endTime, filter) {
        const result = [];
        const entryTypes = EntryType;
        this.timelineData();
        for (let i = 0; i < this._entryData.length; ++i) {
            if (this._entryType(i) !== entryTypes.Event) {
                continue;
            }
            const event = this._entryData[i];
            if (event.startTime > endTime) {
                continue;
            }
            if ((event.endTime || event.startTime) < startTime) {
                continue;
            }
            if (filter.accept(event)) {
                result.push(i);
            }
        }
        result.sort((a, b) => SDK.TracingModel.Event.compareStartTime(this._entryData[a], this._entryData[b]));
        return result;
    }
    _appendSyncEvents(track, events, title, style, entryType, selectable) {
        if (!events.length) {
            return null;
        }
        if (!this._performanceModel || !this._model) {
            return null;
        }
        const isExtension = entryType === EntryType.ExtensionEvent;
        const openEvents = [];
        const ignoreListingEnabled = !isExtension && Root.Runtime.experiments.isEnabled('blackboxJSFramesOnTimeline');
        let maxStackDepth = 0;
        let group = null;
        if (track && track.type === TimelineModel.TimelineModel.TrackType.MainThread) {
            group = this._appendHeader(title, style, selectable);
            group.track = track;
        }
        for (let i = 0; i < events.length; ++i) {
            const e = events[i];
            // Skip Layout Shifts and TTI events when dealing with the main thread.
            if (this._performanceModel) {
                const isInteractiveTime = this._performanceModel.timelineModel().isInteractiveTimeEvent(e);
                const isLayoutShift = this._performanceModel.timelineModel().isLayoutShiftEvent(e);
                const skippableEvent = isInteractiveTime || isLayoutShift;
                if (track && track.type === TimelineModel.TimelineModel.TrackType.MainThread && skippableEvent) {
                    continue;
                }
            }
            if (this._performanceModel && this._performanceModel.timelineModel().isLayoutShiftEvent(e)) {
                // Expand layout shift events to the size of the frame in which it is situated.
                for (const frame of this._performanceModel.frames()) {
                    // Locate the correct frame and expand the event accordingly.
                    if (typeof e.endTime === 'undefined') {
                        e.setEndTime(e.startTime);
                    }
                    const isAfterStartTime = e.startTime >= frame.startTime;
                    const isBeforeEndTime = e.endTime && e.endTime <= frame.endTime;
                    const eventIsInFrame = isAfterStartTime && isBeforeEndTime;
                    if (!eventIsInFrame) {
                        continue;
                    }
                    e.startTime = frame.startTime;
                    e.setEndTime(frame.endTime);
                }
            }
            if (!isExtension && this._performanceModel.timelineModel().isMarkerEvent(e)) {
                this._markers.push(new TimelineFlameChartMarker(e.startTime, e.startTime - this._model.minimumRecordTime(), TimelineUIUtils.markerStyleForEvent(e)));
            }
            if (!SDK.TracingModel.TracingModel.isFlowPhase(e.phase)) {
                if (!e.endTime && e.phase !== SDK.TracingModel.Phase.Instant) {
                    continue;
                }
                if (SDK.TracingModel.TracingModel.isAsyncPhase(e.phase)) {
                    continue;
                }
                if (!isExtension && !this._performanceModel.isVisible(e)) {
                    continue;
                }
            }
            while (openEvents.length &&
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // @ts-expect-error
                (openEvents[openEvents.length - 1].endTime) <= e.startTime) {
                openEvents.pop();
            }
            eventToDisallowRoot.set(e, false);
            if (ignoreListingEnabled && this._isIgnoreListedEvent(e)) {
                const parent = openEvents[openEvents.length - 1];
                if (parent && eventToDisallowRoot.get(parent)) {
                    continue;
                }
                eventToDisallowRoot.set(e, true);
            }
            if (!group && title) {
                group = this._appendHeader(title, style, selectable);
                if (selectable) {
                    group.track = track;
                }
            }
            const level = this._currentLevel + openEvents.length;
            const index = this._appendEvent(e, level);
            if (openEvents.length) {
                this._entryParent[index] = openEvents[openEvents.length - 1];
            }
            if (!isExtension && this._performanceModel.timelineModel().isMarkerEvent(e)) {
                // @ts-ignore This is invalid code, but we should keep it for now
                this._timelineData.entryTotalTimes[this._entryData.length] = undefined;
            }
            maxStackDepth = Math.max(maxStackDepth, openEvents.length + 1);
            if (e.endTime) {
                openEvents.push(e);
            }
        }
        this._entryTypeByLevel.length = this._currentLevel + maxStackDepth;
        this._entryTypeByLevel.fill(entryType, this._currentLevel);
        this._currentLevel += maxStackDepth;
        return group;
    }
    _isIgnoreListedEvent(event) {
        if (event.name !== TimelineModel.TimelineModel.RecordType.JSFrame) {
            return false;
        }
        const url = event.args['data']['url'];
        return url && this._isIgnoreListedURL(url);
    }
    _isIgnoreListedURL(url) {
        return Bindings.IgnoreListManager.IgnoreListManager.instance().isIgnoreListedURL(url);
    }
    _appendAsyncEventsGroup(track, title, events, style, entryType, selectable) {
        if (!events.length) {
            return null;
        }
        const lastUsedTimeByLevel = [];
        let group = null;
        for (let i = 0; i < events.length; ++i) {
            const asyncEvent = events[i];
            if (!this._performanceModel || !this._performanceModel.isVisible(asyncEvent)) {
                continue;
            }
            if (!group && title) {
                group = this._appendHeader(title, style, selectable);
                if (selectable) {
                    group.track = track;
                }
            }
            const startTime = asyncEvent.startTime;
            let level;
            for (level = 0; level < lastUsedTimeByLevel.length && lastUsedTimeByLevel[level] > startTime; ++level) {
            }
            this._appendAsyncEvent(asyncEvent, this._currentLevel + level);
            lastUsedTimeByLevel[level] = asyncEvent.endTime;
        }
        this._entryTypeByLevel.length = this._currentLevel + lastUsedTimeByLevel.length;
        this._entryTypeByLevel.fill(entryType, this._currentLevel);
        this._currentLevel += lastUsedTimeByLevel.length;
        return group;
    }
    _appendInteractionRecords() {
        if (!this._performanceModel) {
            return;
        }
        const interactionRecords = this._performanceModel.interactionRecords();
        if (!interactionRecords.length) {
            return;
        }
        this._appendHeader(i18nString(UIStrings.interactions), this._interactionsHeaderLevel1, false /* selectable */);
        for (const segment of interactionRecords) {
            const index = this._entryData.length;
            this._entryData.push(segment.data);
            this._entryIndexToTitle[index] = segment.data;
            if (this._timelineData) {
                this._timelineData.entryLevels[index] = this._currentLevel;
                this._timelineData.entryTotalTimes[index] = segment.end - segment.begin;
                this._timelineData.entryStartTimes[index] = segment.begin;
            }
        }
        this._entryTypeByLevel[this._currentLevel++] = EntryType.InteractionRecord;
    }
    _appendPageMetrics() {
        this._entryTypeByLevel[this._currentLevel] = EntryType.Event;
        if (!this._performanceModel || !this._model) {
            return;
        }
        const metricEvents = [];
        const lcpEvents = [];
        const timelineModel = this._performanceModel.timelineModel();
        for (const track of this._model.tracks()) {
            for (const event of track.events) {
                if (!timelineModel.isMarkerEvent(event)) {
                    continue;
                }
                if (timelineModel.isLCPCandidateEvent(event) || timelineModel.isLCPInvalidateEvent(event)) {
                    lcpEvents.push(event);
                }
                else {
                    metricEvents.push(event);
                }
            }
        }
        // Only the LCP event with the largest candidate index is relevant.
        // Do not record an LCP event if it is an invalidate event.
        if (lcpEvents.length > 0) {
            const lcpEventsByNavigationId = new Map();
            for (const e of lcpEvents) {
                const key = e.args['data']['navigationId'];
                const previousLastEvent = lcpEventsByNavigationId.get(key);
                if (!previousLastEvent || previousLastEvent.args['data']['candidateIndex'] < e.args['data']['candidateIndex']) {
                    lcpEventsByNavigationId.set(key, e);
                }
            }
            const latestCandidates = Array.from(lcpEventsByNavigationId.values());
            const latestEvents = latestCandidates.filter(e => timelineModel.isLCPCandidateEvent(e));
            metricEvents.push(...latestEvents);
        }
        metricEvents.sort(SDK.TracingModel.Event.compareStartTime);
        if (this._timelineData) {
            const totalTimes = this._timelineData.entryTotalTimes;
            for (const event of metricEvents) {
                this._appendEvent(event, this._currentLevel);
                totalTimes[totalTimes.length - 1] = Number.NaN;
            }
        }
        ++this._currentLevel;
    }
    /**
     * This function pushes a copy of each performance.mark() event from the Main track
     * into Timings so they can be appended to the performance UI.
     * Performance.mark() are a part of the "blink.user_timing" category alongside
     * Navigation and Resource Timing events, so we must filter them out before pushing.
     */
    _copyPerfMarkEvents(timingTrack) {
        this._entryTypeByLevel[this._currentLevel] = EntryType.Event;
        if (!this._performanceModel || !this._model || !timingTrack) {
            return;
        }
        const timelineModel = this._performanceModel.timelineModel();
        const ResourceTimingNames = [
            'workerStart',
            'redirectStart',
            'redirectEnd',
            'fetchStart',
            'domainLookupStart',
            'domainLookupEnd',
            'connectStart',
            'connectEnd',
            'secureConnectionStart',
            'requestStart',
            'responseStart',
            'responseEnd',
        ];
        const NavTimingNames = [
            'navigationStart',
            'unloadEventStart',
            'unloadEventEnd',
            'redirectStart',
            'redirectEnd',
            'fetchStart',
            'domainLookupStart',
            'domainLookupEnd',
            'connectStart',
            'connectEnd',
            'secureConnectionStart',
            'requestStart',
            'responseStart',
            'responseEnd',
            'domLoading',
            'domInteractive',
            'domContentLoadedEventStart',
            'domContentLoadedEventEnd',
            'domComplete',
            'loadEventStart',
            'loadEventEnd',
        ];
        const IgnoreNames = [...ResourceTimingNames, ...NavTimingNames];
        for (const track of this._model.tracks()) {
            if (track.type === TimelineModel.TimelineModel.TrackType.MainThread) {
                for (const event of track.events) {
                    if (timelineModel.isUserTimingEvent(event)) {
                        if (IgnoreNames.includes(event.name)) {
                            continue;
                        }
                        if (SDK.TracingModel.TracingModel.isAsyncPhase(event.phase)) {
                            continue;
                        }
                        event.setEndTime(event.startTime);
                        timingTrack.events.push(event);
                    }
                }
            }
        }
        ++this._currentLevel;
    }
    _appendFrames() {
        if (!this._performanceModel || !this._timelineData || !this._model) {
            return;
        }
        const screenshots = this._performanceModel.filmStripModel().frames();
        const hasFilmStrip = Boolean(screenshots.length);
        this._framesHeader.collapsible = hasFilmStrip;
        this._appendHeader(i18nString(UIStrings.frames), this._framesHeader, false /* selectable */);
        this._frameGroup = this._timelineData.groups[this._timelineData.groups.length - 1];
        const style = TimelineUIUtils.markerStyleForFrame();
        this._entryTypeByLevel[this._currentLevel] = EntryType.Frame;
        for (const frame of this._performanceModel.frames()) {
            this._markers.push(new TimelineFlameChartMarker(frame.startTime, frame.startTime - this._model.minimumRecordTime(), style));
            this._appendFrame(frame);
        }
        ++this._currentLevel;
        if (!hasFilmStrip) {
            return;
        }
        this._appendHeader('', this._screenshotsHeader, false /* selectable */);
        this._entryTypeByLevel[this._currentLevel] = EntryType.Screenshot;
        let prevTimestamp;
        for (const screenshot of screenshots) {
            this._entryData.push(screenshot);
            this._timelineData.entryLevels.push(this._currentLevel);
            this._timelineData.entryStartTimes.push(screenshot.timestamp);
            if (prevTimestamp) {
                this._timelineData.entryTotalTimes.push(screenshot.timestamp - prevTimestamp);
            }
            prevTimestamp = screenshot.timestamp;
        }
        if (screenshots.length && prevTimestamp !== undefined) {
            this._timelineData.entryTotalTimes.push(this._model.maximumRecordTime() - prevTimestamp);
        }
        ++this._currentLevel;
    }
    _entryType(entryIndex) {
        return this._entryTypeByLevel[ /** @type {!PerfUI.FlameChart.TimelineData} */this._timelineData
            .entryLevels[entryIndex]];
    }
    prepareHighlightedEntryInfo(entryIndex) {
        let time = '';
        let title;
        let warning;
        let nameSpanTimelineInfoTime = 'timeline-info-time';
        const type = this._entryType(entryIndex);
        if (type === EntryType.Event) {
            const event = this._entryData[entryIndex];
            const totalTime = event.duration;
            const selfTime = event.selfTime;
            const eps = 1e-6;
            if (typeof totalTime === 'number') {
                time = Math.abs(totalTime - selfTime) > eps && selfTime > eps ?
                    i18nString(UIStrings.sSelfS, { PH1: i18n.i18n.millisToString(totalTime, true), PH2: i18n.i18n.millisToString(selfTime, true) }) :
                    i18n.i18n.millisToString(totalTime, true);
            }
            if (this._performanceModel && this._performanceModel.timelineModel().isMarkerEvent(event)) {
                title = TimelineUIUtils.eventTitle(event);
            }
            else {
                title = this.entryTitle(entryIndex);
            }
            warning = TimelineUIUtils.eventWarning(event);
            if (this._model && this._model.isLayoutShiftEvent(event)) {
                // TODO: Update this to be dynamic when the trace data supports it.
                const occurrences = 1;
                time = i18nString(UIStrings.occurrencesS, { PH1: occurrences });
            }
            if (this._model && this._model.isParseHTMLEvent(event)) {
                const startLine = event.args['beginData']['startLine'];
                const endLine = event.args['endData'] && event.args['endData']['endLine'];
                const url = Bindings.ResourceUtils.displayNameForURL(event.args['beginData']['url']);
                const range = (endLine !== -1 || endLine === startLine) ? `${startLine}...${endLine}` : startLine;
                title += ` - ${url} [${range}]`;
            }
        }
        else if (type === EntryType.Frame) {
            const frame = this._entryData[entryIndex];
            time = i18nString(UIStrings.sFfps, { PH1: i18n.i18n.preciseMillisToString(frame.duration, 1), PH2: (1000 / frame.duration).toFixed(0) });
            if (frame.idle) {
                title = i18nString(UIStrings.idleFrame);
            }
            else if (frame.dropped) {
                title = i18nString(UIStrings.droppedFrame);
                nameSpanTimelineInfoTime = 'timeline-info-warning';
            }
            else {
                title = i18nString(UIStrings.frame);
            }
            if (frame.hasWarnings()) {
                warning = document.createElement('span');
                warning.textContent = i18nString(UIStrings.longFrame);
            }
        }
        else {
            return null;
        }
        const element = document.createElement('div');
        const root = UI.Utils.createShadowRootWithCoreStyles(element, {
            cssFile: 'panels/timeline/timelineFlamechartPopover.css',
            enableLegacyPatching: false,
            delegatesFocus: undefined,
        });
        const contents = root.createChild('div', 'timeline-flamechart-popover');
        contents.createChild('span', nameSpanTimelineInfoTime).textContent = time;
        contents.createChild('span', 'timeline-info-title').textContent = title;
        if (warning) {
            warning.classList.add('timeline-info-warning');
            contents.appendChild(warning);
        }
        return element;
    }
    entryColor(entryIndex) {
        function patchColorAndCache(cache, key, lookupColor) {
            let color = cache.get(key);
            if (color) {
                return color;
            }
            const parsedColor = Common.Color.Color.parse(lookupColor(key));
            if (!parsedColor) {
                throw new Error('Could not parse color from entry');
            }
            color = parsedColor.setAlpha(0.7).asString(Common.Color.Format.RGBA) || '';
            cache.set(key, color);
            return color;
        }
        if (!this._performanceModel || !this._model) {
            return '';
        }
        const entryTypes = EntryType;
        const type = this._entryType(entryIndex);
        if (type === entryTypes.Event) {
            const event = this._entryData[entryIndex];
            if (this._model.isGenericTrace()) {
                return this._genericTraceEventColor(event);
            }
            if (this._performanceModel.timelineModel().isMarkerEvent(event)) {
                return TimelineUIUtils.markerStyleForEvent(event).color;
            }
            if (!SDK.TracingModel.TracingModel.isAsyncPhase(event.phase) && this._colorForEvent) {
                return this._colorForEvent(event);
            }
            if (event.hasCategory(TimelineModel.TimelineModel.TimelineModelImpl.Category.Console) ||
                event.hasCategory(TimelineModel.TimelineModel.TimelineModelImpl.Category.UserTiming)) {
                return this._consoleColorGenerator.colorForID(event.name);
            }
            if (event.hasCategory(TimelineModel.TimelineModel.TimelineModelImpl.Category.LatencyInfo)) {
                const phase = TimelineModel.TimelineIRModel.TimelineIRModel.phaseForEvent(event) ||
                    TimelineModel.TimelineIRModel.Phases.Uncategorized;
                return patchColorAndCache(this._asyncColorByInteractionPhase, phase, TimelineUIUtils.interactionPhaseColor);
            }
            const category = TimelineUIUtils.eventStyle(event).category;
            return patchColorAndCache(this._asyncColorByCategory, category, () => category.color);
        }
        if (type === entryTypes.Frame) {
            return 'white';
        }
        if (type === entryTypes.InteractionRecord) {
            return 'transparent';
        }
        if (type === entryTypes.ExtensionEvent) {
            const event = this._entryData[entryIndex];
            return this._extensionColorGenerator.colorForID(event.name);
        }
        return '';
    }
    _genericTraceEventColor(event) {
        const key = event.categoriesString || event.name;
        return key ? `hsl(${Platform.StringUtilities.hashCode(key) % 300 + 30}, 40%, 70%)` : '#ccc';
    }
    _drawFrame(entryIndex, context, text, barX, barY, barWidth, barHeight) {
        const hPadding = 1;
        const frame = this._entryData[entryIndex];
        barX += hPadding;
        barWidth -= 2 * hPadding;
        context.fillStyle =
            frame.idle ? 'white' : frame.dropped ? '#f0b7b1' : (frame.hasWarnings() ? '#fad1d1' : '#d7f0d1');
        context.fillRect(barX, barY, barWidth, barHeight);
        const frameDurationText = i18n.i18n.preciseMillisToString(frame.duration, 1);
        const textWidth = context.measureText(frameDurationText).width;
        if (textWidth <= barWidth) {
            context.fillStyle = this.textColor(entryIndex);
            context.fillText(frameDurationText, barX + (barWidth - textWidth) / 2, barY + barHeight - 4);
        }
    }
    async _drawScreenshot(entryIndex, context, barX, barY, barWidth, barHeight) {
        const screenshot = this._entryData[entryIndex];
        if (!this._screenshotImageCache.has(screenshot)) {
            this._screenshotImageCache.set(screenshot, null);
            const data = await screenshot.imageDataPromise();
            const image = await UI.UIUtils.loadImageFromData(data);
            this._screenshotImageCache.set(screenshot, image);
            this.dispatchEventToListeners(Events.DataChanged);
            return;
        }
        const image = this._screenshotImageCache.get(screenshot);
        if (!image) {
            return;
        }
        const imageX = barX + 1;
        const imageY = barY + 1;
        const imageHeight = barHeight - 2;
        const scale = imageHeight / image.naturalHeight;
        const imageWidth = Math.floor(image.naturalWidth * scale);
        context.save();
        context.beginPath();
        context.rect(barX, barY, barWidth, barHeight);
        context.clip();
        context.drawImage(image, imageX, imageY, imageWidth, imageHeight);
        context.strokeStyle = '#ccc';
        context.strokeRect(imageX - 0.5, imageY - 0.5, Math.min(barWidth - 1, imageWidth + 1), imageHeight);
        context.restore();
    }
    decorateEntry(entryIndex, context, text, barX, barY, barWidth, barHeight, unclippedBarX, timeToPixels) {
        const data = this._entryData[entryIndex];
        const type = this._entryType(entryIndex);
        const entryTypes = EntryType;
        if (type === entryTypes.Frame) {
            this._drawFrame(entryIndex, context, text, barX, barY, barWidth, barHeight);
            return true;
        }
        if (type === entryTypes.Screenshot) {
            this._drawScreenshot(entryIndex, context, barX, barY, barWidth, barHeight);
            return true;
        }
        if (type === entryTypes.InteractionRecord) {
            const color = TimelineUIUtils.interactionPhaseColor(data);
            context.fillStyle = color;
            context.fillRect(barX, barY, barWidth - 1, 2);
            context.fillRect(barX, barY - 3, 2, 3);
            context.fillRect(barX + barWidth - 3, barY - 3, 2, 3);
            return false;
        }
        if (type === entryTypes.Event) {
            const event = data;
            if (event.hasCategory(TimelineModel.TimelineModel.TimelineModelImpl.Category.LatencyInfo)) {
                const timeWaitingForMainThread = TimelineModel.TimelineModel.TimelineData.forEvent(event).timeWaitingForMainThread;
                if (timeWaitingForMainThread) {
                    context.fillStyle = 'hsla(0, 70%, 60%, 1)';
                    const width = Math.floor(unclippedBarX - barX + timeWaitingForMainThread * timeToPixels);
                    context.fillRect(barX, barY + barHeight - 3, width, 2);
                }
            }
            if (TimelineModel.TimelineModel.TimelineData.forEvent(event).warning) {
                paintWarningDecoration(barX, barWidth - 1.5);
            }
        }
        function paintWarningDecoration(x, width) {
            const /** @const */ triangleSize = 8;
            context.save();
            context.beginPath();
            context.rect(x, barY, width, barHeight);
            context.clip();
            context.beginPath();
            context.fillStyle = 'red';
            context.moveTo(x + width - triangleSize, barY);
            context.lineTo(x + width, barY);
            context.lineTo(x + width, barY + triangleSize);
            context.fill();
            context.restore();
        }
        return false;
    }
    forceDecoration(entryIndex) {
        const entryTypes = EntryType;
        const type = this._entryType(entryIndex);
        if (type === entryTypes.Frame) {
            return true;
        }
        if (type === entryTypes.Screenshot) {
            return true;
        }
        if (type === entryTypes.Event) {
            const event = this._entryData[entryIndex];
            return Boolean(TimelineModel.TimelineModel.TimelineData.forEvent(event).warning);
        }
        return false;
    }
    appendExtensionEvents(entry) {
        this._extensionInfo.push(entry);
        if (this._timelineData) {
            this._innerAppendExtensionEvents(this._extensionInfo.length - 1);
        }
    }
    _innerAppendExtensionEvents(index) {
        const entry = this._extensionInfo[index];
        const entryType = EntryType.ExtensionEvent;
        const allThreads = [...entry.model.sortedProcesses().map(process => process.sortedThreads())].flat();
        if (!allThreads.length) {
            return;
        }
        const singleTrack = allThreads.length === 1 && (!allThreads[0].events().length || !allThreads[0].asyncEvents().length);
        if (!singleTrack) {
            this._appendHeader(entry.title, this._headerLevel1, false /* selectable */);
        }
        const style = singleTrack ? this._headerLevel2 : this._headerLevel1;
        let threadIndex = 0;
        for (const thread of allThreads) {
            const title = singleTrack ? entry.title : thread.name() || i18nString(UIStrings.threadS, { PH1: ++threadIndex });
            this._appendAsyncEventsGroup(null, title, thread.asyncEvents(), style, entryType, false /* selectable */);
            this._appendSyncEvents(null, thread.events(), title, style, entryType, false /* selectable */);
        }
    }
    _appendHeader(title, style, selectable) {
        const group = { startLevel: this._currentLevel, name: title, style: style, selectable: selectable };
        this._timelineData.groups.push(group);
        return group;
    }
    _appendEvent(event, level) {
        const index = this._entryData.length;
        this._entryData.push(event);
        const timelineData = this._timelineData;
        timelineData.entryLevels[index] = level;
        timelineData.entryTotalTimes[index] = event.duration || InstantEventVisibleDurationMs;
        timelineData.entryStartTimes[index] = event.startTime;
        indexForEvent.set(event, index);
        return index;
    }
    _appendAsyncEvent(asyncEvent, level) {
        if (SDK.TracingModel.TracingModel.isNestableAsyncPhase(asyncEvent.phase)) {
            // FIXME: also add steps once we support event nesting in the FlameChart.
            this._appendEvent(asyncEvent, level);
            return;
        }
        const steps = asyncEvent.steps;
        // If we have past steps, put the end event for each range rather than start one.
        const eventOffset = steps.length > 1 && steps[1].phase === SDK.TracingModel.Phase.AsyncStepPast ? 1 : 0;
        for (let i = 0; i < steps.length - 1; ++i) {
            const index = this._entryData.length;
            this._entryData.push(steps[i + eventOffset]);
            const startTime = steps[i].startTime;
            const timelineData = this._timelineData;
            timelineData.entryLevels[index] = level;
            timelineData.entryTotalTimes[index] = steps[i + 1].startTime - startTime;
            timelineData.entryStartTimes[index] = startTime;
        }
    }
    _appendFrame(frame) {
        const index = this._entryData.length;
        this._entryData.push(frame);
        this._entryIndexToTitle[index] = i18n.i18n.millisToString(frame.duration, true);
        if (!this._timelineData) {
            return;
        }
        this._timelineData.entryLevels[index] = this._currentLevel;
        this._timelineData.entryTotalTimes[index] = frame.duration;
        this._timelineData.entryStartTimes[index] = frame.startTime;
    }
    createSelection(entryIndex) {
        const type = this._entryType(entryIndex);
        let timelineSelection = null;
        if (type === EntryType.Event) {
            timelineSelection = TimelineSelection.fromTraceEvent(this._entryData[entryIndex]);
        }
        else if (type === EntryType.Frame) {
            timelineSelection =
                TimelineSelection.fromFrame(this._entryData[entryIndex]);
        }
        if (timelineSelection) {
            this._lastSelection = new Selection(timelineSelection, entryIndex);
        }
        return timelineSelection;
    }
    formatValue(value, precision) {
        return i18n.i18n.preciseMillisToString(value, precision);
    }
    canJumpToEntry(_entryIndex) {
        return false;
    }
    entryIndexForSelection(selection) {
        if (!selection || selection.type() === TimelineSelection.Type.Range) {
            return -1;
        }
        if (this._lastSelection && this._lastSelection.timelineSelection.object() === selection.object()) {
            return this._lastSelection.entryIndex;
        }
        const index = this._entryData.indexOf(selection.object());
        if (index !== -1) {
            this._lastSelection = new Selection(selection, index);
        }
        return index;
    }
    buildFlowForInitiator(entryIndex) {
        if (this._lastInitiatorEntry === entryIndex) {
            return false;
        }
        this._lastInitiatorEntry = entryIndex;
        let event = this.eventByIndex(entryIndex);
        const td = this._timelineData;
        if (!td) {
            return false;
        }
        td.flowStartTimes = [];
        td.flowStartLevels = [];
        td.flowEndTimes = [];
        td.flowEndLevels = [];
        while (event) {
            // Find the closest ancestor with an initiator.
            let initiator;
            for (; event; event = this._eventParent(event)) {
                initiator = TimelineModel.TimelineModel.TimelineData.forEvent(event).initiator();
                if (initiator) {
                    break;
                }
            }
            if (!initiator || !event) {
                break;
            }
            const eventIndex = indexForEvent.get(event);
            const initiatorIndex = indexForEvent.get(initiator);
            td.flowStartTimes.push(initiator.endTime || initiator.startTime);
            td.flowStartLevels.push(td.entryLevels[initiatorIndex]);
            td.flowEndTimes.push(event.startTime);
            td.flowEndLevels.push(td.entryLevels[eventIndex]);
            event = initiator;
        }
        return true;
    }
    _eventParent(event) {
        const eventIndex = indexForEvent.get(event);
        if (eventIndex === undefined) {
            return null;
        }
        return this._entryParent[eventIndex] || null;
    }
    eventByIndex(entryIndex) {
        return entryIndex >= 0 && this._entryType(entryIndex) === EntryType.Event ?
            this._entryData[entryIndex] :
            null;
    }
    setEventColorMapping(colorForEvent) {
        this._colorForEvent = colorForEvent;
    }
}
export const InstantEventVisibleDurationMs = 0.001;
const eventToDisallowRoot = new WeakMap();
const indexForEvent = new WeakMap();
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["DataChanged"] = "DataChanged";
})(Events || (Events = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var EntryType;
(function (EntryType) {
    EntryType["Frame"] = "Frame";
    EntryType["Event"] = "Event";
    EntryType["InteractionRecord"] = "InteractionRecord";
    EntryType["ExtensionEvent"] = "ExtensionEvent";
    EntryType["Screenshot"] = "Screenshot";
})(EntryType || (EntryType = {}));
//# sourceMappingURL=TimelineFlameChartDataProvider.js.map