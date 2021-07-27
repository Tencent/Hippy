// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import { TimelineUIUtils } from './TimelineUIUtils.js';
export class IsLong extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    _minimumRecordDuration;
    constructor() {
        super();
        this._minimumRecordDuration = 0;
    }
    setMinimumRecordDuration(value) {
        this._minimumRecordDuration = value;
    }
    accept(event) {
        const duration = event.endTime ? event.endTime - event.startTime : 0;
        return duration >= this._minimumRecordDuration;
    }
}
export class Category extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    constructor() {
        super();
    }
    accept(event) {
        return !TimelineUIUtils.eventStyle(event).category.hidden;
    }
}
export class TimelineRegExp extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    _regExp;
    constructor(regExp) {
        super();
        this.setRegExp(regExp || null);
    }
    setRegExp(regExp) {
        this._regExp = regExp;
    }
    regExp() {
        return this._regExp;
    }
    accept(event) {
        return !this._regExp || TimelineUIUtils.testContentMatching(event, this._regExp);
    }
}
//# sourceMappingURL=TimelineFilters.js.map