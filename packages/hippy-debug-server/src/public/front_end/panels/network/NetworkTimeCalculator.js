// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008, 2009 Anthony Ricaud <rik@webkit.org>
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Latency download total format in Network Time Calculator of the Network panel
    *@example {20ms} PH1
    *@example {20ms} PH2
    *@example {40ms} PH3
    */
    sLatencySDownloadSTotal: '{PH1} latency, {PH2} download ({PH3} total)',
    /**
    *@description Latency format in Network Time Calculator of the Network panel
    *@example {20ms} PH1
    */
    sLatency: '{PH1} latency',
    /**
    * @description Duration of the download in ms/s shown for a completed network request.
    * @example {5ms} PH1
    */
    sDownload: '{PH1} download',
    /**
    *@description From service worker format in Network Time Calculator of the Network panel
    *@example {20ms latency} PH1
    */
    sFromServiceworker: '{PH1} (from `ServiceWorker`)',
    /**
    *@description From cache format in Network Time Calculator of the Network panel
    *@example {20ms latency} PH1
    */
    sFromCache: '{PH1} (from cache)',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/NetworkTimeCalculator.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class NetworkTimeBoundary {
    minimum;
    maximum;
    constructor(minimum, maximum) {
        this.minimum = minimum;
        this.maximum = maximum;
    }
    equals(other) {
        return (this.minimum === other.minimum) && (this.maximum === other.maximum);
    }
}
export class NetworkTimeCalculator extends Common.ObjectWrapper.ObjectWrapper {
    startAtZero;
    _minimumBoundary;
    _maximumBoundary;
    _boundryChangedEventThrottler;
    _window;
    _workingArea;
    constructor(startAtZero) {
        super();
        this.startAtZero = startAtZero;
        this._minimumBoundary = -1;
        this._maximumBoundary = -1;
        this._boundryChangedEventThrottler = new Common.Throttler.Throttler(0);
        this._window = null;
    }
    setWindow(window) {
        this._window = window;
        this._boundaryChanged();
    }
    setInitialUserFriendlyBoundaries() {
        this._minimumBoundary = 0;
        this._maximumBoundary = 1;
    }
    computePosition(time) {
        return (time - this.minimumBoundary()) / this.boundarySpan() * (this._workingArea || 0);
    }
    formatValue(value, precision) {
        return i18n.i18n.secondsToString(value, Boolean(precision));
    }
    minimumBoundary() {
        return this._window ? this._window.minimum : this._minimumBoundary;
    }
    zeroTime() {
        return this._minimumBoundary;
    }
    maximumBoundary() {
        return this._window ? this._window.maximum : this._maximumBoundary;
    }
    boundary() {
        return new NetworkTimeBoundary(this.minimumBoundary(), this.maximumBoundary());
    }
    boundarySpan() {
        return this.maximumBoundary() - this.minimumBoundary();
    }
    reset() {
        this._minimumBoundary = -1;
        this._maximumBoundary = -1;
        this._boundaryChanged();
    }
    _value() {
        return 0;
    }
    setDisplayWidth(clientWidth) {
        this._workingArea = clientWidth;
    }
    computeBarGraphPercentages(request) {
        let start;
        let middle;
        let end;
        if (request.startTime !== -1) {
            start = ((request.startTime - this.minimumBoundary()) / this.boundarySpan()) * 100;
        }
        else {
            start = 0;
        }
        if (request.responseReceivedTime !== -1) {
            middle = ((request.responseReceivedTime - this.minimumBoundary()) / this.boundarySpan()) * 100;
        }
        else {
            middle = (this.startAtZero ? start : 100);
        }
        if (request.endTime !== -1) {
            end = ((request.endTime - this.minimumBoundary()) / this.boundarySpan()) * 100;
        }
        else {
            end = (this.startAtZero ? middle : 100);
        }
        if (this.startAtZero) {
            end -= start;
            middle -= start;
            start = 0;
        }
        return { start: start, middle: middle, end: end };
    }
    computePercentageFromEventTime(eventTime) {
        // This function computes a percentage in terms of the total loading time
        // of a specific event. If startAtZero is set, then this is useless, and we
        // want to return 0.
        if (eventTime !== -1 && !this.startAtZero) {
            return ((eventTime - this.minimumBoundary()) / this.boundarySpan()) * 100;
        }
        return 0;
    }
    percentageToTime(percentage) {
        return percentage * this.boundarySpan() / 100 + this.minimumBoundary();
    }
    _boundaryChanged() {
        this._boundryChangedEventThrottler.schedule(async () => {
            this.dispatchEventToListeners(Events.BoundariesChanged);
        });
    }
    updateBoundariesForEventTime(eventTime) {
        if (eventTime === -1 || this.startAtZero) {
            return;
        }
        if (this._maximumBoundary === undefined || eventTime > this._maximumBoundary) {
            this._maximumBoundary = eventTime;
            this._boundaryChanged();
        }
    }
    computeBarGraphLabels(request) {
        let rightLabel = '';
        if (request.responseReceivedTime !== -1 && request.endTime !== -1) {
            rightLabel = i18n.i18n.secondsToString(request.endTime - request.responseReceivedTime);
        }
        const hasLatency = request.latency > 0;
        const leftLabel = hasLatency ? i18n.i18n.secondsToString(request.latency) : rightLabel;
        if (request.timing) {
            return { left: leftLabel, right: rightLabel, tooltip: undefined };
        }
        let tooltip;
        if (hasLatency && rightLabel) {
            const total = i18n.i18n.secondsToString(request.duration);
            tooltip = i18nString(UIStrings.sLatencySDownloadSTotal, { PH1: leftLabel, PH2: rightLabel, PH3: total });
        }
        else if (hasLatency) {
            tooltip = i18nString(UIStrings.sLatency, { PH1: leftLabel });
        }
        else if (rightLabel) {
            tooltip = i18nString(UIStrings.sDownload, { PH1: rightLabel });
        }
        if (request.fetchedViaServiceWorker) {
            tooltip = i18nString(UIStrings.sFromServiceworker, { PH1: tooltip });
        }
        else if (request.cached()) {
            tooltip = i18nString(UIStrings.sFromCache, { PH1: tooltip });
        }
        return { left: leftLabel, right: rightLabel, tooltip: tooltip };
    }
    updateBoundaries(request) {
        const lowerBound = this._lowerBound(request);
        const upperBound = this._upperBound(request);
        let changed = false;
        if (lowerBound !== -1 || this.startAtZero) {
            changed = this._extendBoundariesToIncludeTimestamp(this.startAtZero ? 0 : lowerBound);
        }
        if (upperBound !== -1) {
            changed = this._extendBoundariesToIncludeTimestamp(upperBound) || changed;
        }
        if (changed) {
            this._boundaryChanged();
        }
    }
    _extendBoundariesToIncludeTimestamp(timestamp) {
        const previousMinimumBoundary = this._minimumBoundary;
        const previousMaximumBoundary = this._maximumBoundary;
        const minOffset = _minimumSpread;
        if (this._minimumBoundary === -1 || this._maximumBoundary === -1) {
            this._minimumBoundary = timestamp;
            this._maximumBoundary = timestamp + minOffset;
        }
        else {
            this._minimumBoundary = Math.min(timestamp, this._minimumBoundary);
            this._maximumBoundary = Math.max(timestamp, this._minimumBoundary + minOffset, this._maximumBoundary);
        }
        return previousMinimumBoundary !== this._minimumBoundary || previousMaximumBoundary !== this._maximumBoundary;
    }
    _lowerBound(_request) {
        return 0;
    }
    _upperBound(_request) {
        return 0;
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _minimumSpread = 0.1;
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["BoundariesChanged"] = "BoundariesChanged";
})(Events || (Events = {}));
export class NetworkTransferTimeCalculator extends NetworkTimeCalculator {
    constructor() {
        super(false);
    }
    formatValue(value, precision) {
        return i18n.i18n.secondsToString(value - this.zeroTime(), Boolean(precision));
    }
    _lowerBound(request) {
        return request.issueTime();
    }
    _upperBound(request) {
        return request.endTime;
    }
}
export class NetworkTransferDurationCalculator extends NetworkTimeCalculator {
    constructor() {
        super(true);
    }
    formatValue(value, precision) {
        return i18n.i18n.secondsToString(value, Boolean(precision));
    }
    _upperBound(request) {
        return request.duration;
    }
}
//# sourceMappingURL=NetworkTimeCalculator.js.map