import type { EventPayload } from './TracingManager.js';
export declare class TracingModel {
    _backingStorage: BackingStorage;
    _firstWritePending: boolean;
    _processById: Map<string | number, Process>;
    _processByName: Map<any, any>;
    _minimumRecordTime: number;
    _maximumRecordTime: number;
    _devToolsMetadataEvents: Event[];
    _asyncEvents: AsyncEvent[];
    _openAsyncEvents: Map<string, AsyncEvent>;
    _openNestableAsyncEvents: Map<string, AsyncEvent[]>;
    _profileGroups: Map<string, ProfileEventsGroup>;
    _parsedCategories: Map<string, Set<string>>;
    _mainFrameNavStartTimes: Map<string, Event>;
    constructor(backingStorage: BackingStorage);
    static isNestableAsyncPhase(phase: string): boolean;
    static isAsyncBeginPhase(phase: string): boolean;
    static isAsyncPhase(phase: string): boolean;
    static isFlowPhase(phase: string): boolean;
    static isCompletePhase(phase: string): boolean;
    static isTopLevelEvent(event: Event): boolean;
    static _extractId(payload: EventPayload): string | undefined;
    static browserMainThread(tracingModel: TracingModel): Thread | null;
    devToolsMetadataEvents(): Event[];
    addEvents(events: EventPayload[]): void;
    tracingComplete(): void;
    dispose(): void;
    adjustTime(offset: number): void;
    _addEvent(payload: EventPayload): void;
    _addSampleEvent(event: Event): void;
    profileGroup(event: Event): ProfileEventsGroup | null;
    minimumRecordTime(): number;
    maximumRecordTime(): number;
    navStartTimes(): Map<string, Event>;
    sortedProcesses(): Process[];
    processByName(name: string): Process | null;
    processById(pid: number): Process | null;
    threadByName(processName: string, threadName: string): Thread | null;
    extractEventsFromThreadByName(processName: string, threadName: string, eventName: string): Event[];
    _processPendingAsyncEvents(): void;
    _closeOpenAsyncEvents(): void;
    _addNestableAsyncEvent(event: Event): void;
    _addAsyncEvent(event: Event): void;
    backingStorage(): BackingStorage;
    _parsedCategoriesForString(str: string): Set<string>;
}
export declare enum Phase {
    Begin = "B",
    End = "E",
    Complete = "X",
    Instant = "I",
    AsyncBegin = "S",
    AsyncStepInto = "T",
    AsyncStepPast = "p",
    AsyncEnd = "F",
    NestableAsyncBegin = "b",
    NestableAsyncEnd = "e",
    NestableAsyncInstant = "n",
    FlowBegin = "s",
    FlowStep = "t",
    FlowEnd = "f",
    Metadata = "M",
    Counter = "C",
    Sample = "P",
    CreateObject = "N",
    SnapshotObject = "O",
    DeleteObject = "D"
}
export declare const MetadataEvent: {
    ProcessSortIndex: string;
    ProcessName: string;
    ThreadSortIndex: string;
    ThreadName: string;
};
export declare const LegacyTopLevelEventCategory = "toplevel";
export declare const DevToolsMetadataEventCategory = "disabled-by-default-devtools.timeline";
export declare const DevToolsTimelineEventCategory = "disabled-by-default-devtools.timeline";
export declare abstract class BackingStorage {
    appendString(_string: string): void;
    abstract appendAccessibleString(string: string): () => Promise<string | null>;
    finishWriting(): void;
    reset(): void;
}
export declare class Event {
    categoriesString: string;
    _parsedCategories: Set<string>;
    name: string;
    phase: Phase;
    startTime: number;
    thread: Thread;
    args: any;
    id: string | null;
    bind_id: string | null;
    ordinal: number;
    selfTime: number;
    endTime?: number;
    duration?: number;
    constructor(categories: string | undefined, name: string, phase: Phase, startTime: number, thread: Thread);
    static fromPayload(payload: EventPayload, thread: Thread): Event;
    static compareStartTime(a: Event | null, b: Event | null): number;
    static orderedCompareStartTime(a: Event, b: Event): number;
    hasCategory(categoryName: string): boolean;
    setEndTime(endTime: number): void;
    addArgs(args: any): void;
    _complete(endEvent: Event): void;
    _setBackingStorage(_backingStorage: (() => Promise<string | null>) | null): void;
}
export declare class ObjectSnapshot extends Event {
    _backingStorage: (() => Promise<string | null>) | null;
    _objectPromise: Promise<ObjectSnapshot | null> | null;
    constructor(category: string | undefined, name: string, startTime: number, thread: Thread);
    static fromPayload(payload: EventPayload, thread: Thread): ObjectSnapshot;
    requestObject(callback: (arg0: ObjectSnapshot | null) => void): void;
    objectPromise(): Promise<ObjectSnapshot | null>;
    _setBackingStorage(backingStorage: (() => Promise<string | null>) | null): void;
}
export declare class AsyncEvent extends Event {
    steps: Event[];
    causedFrame: boolean;
    constructor(startEvent: Event);
    _addStep(event: Event): void;
}
declare class ProfileEventsGroup {
    children: Event[];
    constructor(event: Event);
    _addChild(event: Event): void;
}
declare class NamedObject {
    _model: TracingModel;
    _id: number;
    _name: string;
    _sortIndex: number;
    constructor(model: TracingModel, id: number);
    _setName(name: string): void;
    name(): string;
    _setSortIndex(sortIndex: number): void;
}
export declare class Process extends NamedObject {
    _threads: Map<number, Thread>;
    _threadByName: Map<string, Thread | null>;
    constructor(model: TracingModel, id: number);
    id(): number;
    threadById(id: number): Thread;
    threadByName(name: string): Thread | null;
    _setThreadByName(name: string, thread: Thread): void;
    _addEvent(payload: EventPayload): Event | null;
    sortedThreads(): Thread[];
}
export declare class Thread extends NamedObject {
    _process: Process;
    _events: Event[];
    _asyncEvents: AsyncEvent[];
    _lastTopLevelEvent: Event | null;
    constructor(process: Process, id: number);
    tracingComplete(): void;
    _addEvent(payload: EventPayload): Event | null;
    _addAsyncEvent(asyncEvent: AsyncEvent): void;
    _setName(name: string): void;
    id(): number;
    process(): Process;
    events(): Event[];
    asyncEvents(): AsyncEvent[];
    removeEventsByName(name: string): Event[];
}
export {};
