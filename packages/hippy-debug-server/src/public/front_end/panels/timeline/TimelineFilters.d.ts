import type * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
export declare class IsLong extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    _minimumRecordDuration: number;
    constructor();
    setMinimumRecordDuration(value: number): void;
    accept(event: SDK.TracingModel.Event): boolean;
}
export declare class Category extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    constructor();
    accept(event: SDK.TracingModel.Event): boolean;
}
export declare class TimelineRegExp extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    _regExp: RegExp | null;
    constructor(regExp?: RegExp);
    setRegExp(regExp: RegExp | null): void;
    regExp(): RegExp | null;
    accept(event: SDK.TracingModel.Event): boolean;
}
