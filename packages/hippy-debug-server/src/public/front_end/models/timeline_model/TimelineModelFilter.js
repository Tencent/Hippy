// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { RecordType, TimelineModelImpl } from './TimelineModel.js';
export class TimelineModelFilter {
    accept(_event) {
        return true;
    }
}
export class TimelineVisibleEventsFilter extends TimelineModelFilter {
    _visibleTypes;
    constructor(visibleTypes) {
        super();
        this._visibleTypes = new Set(visibleTypes);
    }
    accept(event) {
        return this._visibleTypes.has(TimelineVisibleEventsFilter._eventType(event));
    }
    static _eventType(event) {
        if (event.hasCategory(TimelineModelImpl.Category.Console)) {
            return RecordType.ConsoleTime;
        }
        if (event.hasCategory(TimelineModelImpl.Category.UserTiming)) {
            return RecordType.UserTiming;
        }
        if (event.hasCategory(TimelineModelImpl.Category.LatencyInfo)) {
            return RecordType.LatencyInfo;
        }
        return event.name;
    }
}
export class TimelineInvisibleEventsFilter extends TimelineModelFilter {
    _invisibleTypes;
    constructor(invisibleTypes) {
        super();
        this._invisibleTypes = new Set(invisibleTypes);
    }
    accept(event) {
        return !this._invisibleTypes.has(TimelineVisibleEventsFilter._eventType(event));
    }
}
export class ExclusiveNameFilter extends TimelineModelFilter {
    _excludeNames;
    constructor(excludeNames) {
        super();
        this._excludeNames = new Set(excludeNames);
    }
    accept(event) {
        return !this._excludeNames.has(event.name);
    }
}
//# sourceMappingURL=TimelineModelFilter.js.map