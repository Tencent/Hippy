import type * as SDK from '../../core/sdk/sdk.js';
import { RecordType } from './TimelineModel.js';
export declare class TimelineModelFilter {
    accept(_event: SDK.TracingModel.Event): boolean;
}
export declare class TimelineVisibleEventsFilter extends TimelineModelFilter {
    _visibleTypes: Set<string>;
    constructor(visibleTypes: string[]);
    accept(event: SDK.TracingModel.Event): boolean;
    static _eventType(event: SDK.TracingModel.Event): RecordType;
}
export declare class TimelineInvisibleEventsFilter extends TimelineModelFilter {
    _invisibleTypes: Set<string>;
    constructor(invisibleTypes: string[]);
    accept(event: SDK.TracingModel.Event): boolean;
}
export declare class ExclusiveNameFilter extends TimelineModelFilter {
    _excludeNames: Set<string>;
    constructor(excludeNames: string[]);
    accept(event: SDK.TracingModel.Event): boolean;
}
