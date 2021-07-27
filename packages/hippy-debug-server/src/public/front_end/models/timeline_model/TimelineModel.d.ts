import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class TimelineModelImpl {
    _isGenericTrace: boolean;
    _tracks: Track[];
    _namedTracks: Map<TrackType, Track>;
    _inspectedTargetEvents: SDK.TracingModel.Event[];
    _timeMarkerEvents: SDK.TracingModel.Event[];
    _sessionId: string | null;
    _mainFrameNodeId: number | null;
    _pageFrames: Map<string, PageFrame>;
    _cpuProfiles: SDK.CPUProfileDataModel.CPUProfileDataModel[];
    _workerIdByThread: WeakMap<SDK.TracingModel.Thread, string>;
    _requestsFromBrowser: Map<string, SDK.TracingModel.Event>;
    _mainFrame: PageFrame;
    _minimumRecordTime: number;
    _maximumRecordTime: number;
    _totalBlockingTime: number;
    _estimatedTotalBlockingTime: number;
    _asyncEventTracker: TimelineAsyncEventTracker;
    _invalidationTracker: InvalidationTracker;
    _layoutInvalidate: {
        [x: string]: SDK.TracingModel.Event | null;
    };
    _lastScheduleStyleRecalculation: {
        [x: string]: SDK.TracingModel.Event;
    };
    _paintImageEventByPixelRefId: {
        [x: string]: SDK.TracingModel.Event;
    };
    _lastPaintForLayer: {
        [x: string]: SDK.TracingModel.Event;
    };
    _lastRecalculateStylesEvent: SDK.TracingModel.Event | null;
    _currentScriptEvent: SDK.TracingModel.Event | null;
    _eventStack: SDK.TracingModel.Event[];
    _knownInputEvents: Set<string>;
    _browserFrameTracking: boolean;
    _persistentIds: boolean;
    _legacyCurrentPage: any;
    _currentTaskLayoutAndRecalcEvents: SDK.TracingModel.Event[];
    _tracingModel: SDK.TracingModel.TracingModel | null;
    _mainFrameLayerTreeId?: any;
    constructor();
    static forEachEvent(events: SDK.TracingModel.Event[], onStartEvent: (arg0: SDK.TracingModel.Event) => void, onEndEvent: (arg0: SDK.TracingModel.Event) => void, onInstantEvent?: ((arg0: SDK.TracingModel.Event, arg1: SDK.TracingModel.Event | null) => any), startTime?: number, endTime?: number, filter?: ((arg0: SDK.TracingModel.Event) => boolean)): void;
    static _topLevelEventEndingAfter(events: SDK.TracingModel.Event[], time: number): number;
    isMarkerEvent(event: SDK.TracingModel.Event): boolean;
    isInteractiveTimeEvent(event: SDK.TracingModel.Event): boolean;
    isLayoutShiftEvent(event: SDK.TracingModel.Event): boolean;
    isUserTimingEvent(event: SDK.TracingModel.Event): boolean;
    isParseHTMLEvent(event: SDK.TracingModel.Event): boolean;
    isLCPCandidateEvent(event: SDK.TracingModel.Event): boolean;
    isLCPInvalidateEvent(event: SDK.TracingModel.Event): boolean;
    isFCPEvent(event: SDK.TracingModel.Event): boolean;
    isLongRunningTask(event: SDK.TracingModel.Event): boolean;
    isNavigationStartEvent(event: SDK.TracingModel.Event): boolean;
    isMainFrameNavigationStartEvent(event: SDK.TracingModel.Event): boolean;
    static globalEventId(event: SDK.TracingModel.Event, field: string): string;
    static eventFrameId(event: SDK.TracingModel.Event): string;
    cpuProfiles(): SDK.CPUProfileDataModel.CPUProfileDataModel[];
    totalBlockingTime(): {
        time: number;
        estimated: boolean;
    };
    targetByEvent(event: SDK.TracingModel.Event): SDK.Target.Target | null;
    navStartTimes(): Map<string, SDK.TracingModel.Event>;
    setEvents(tracingModel: SDK.TracingModel.TracingModel): void;
    _processGenericTrace(tracingModel: SDK.TracingModel.TracingModel): void;
    _processMetadataAndThreads(tracingModel: SDK.TracingModel.TracingModel, metadataEvents: MetadataEvents): void;
    _processThreadsForBrowserFrames(tracingModel: SDK.TracingModel.TracingModel): void;
    _processMetadataEvents(tracingModel: SDK.TracingModel.TracingModel): MetadataEvents | null;
    _processSyncBrowserEvents(tracingModel: SDK.TracingModel.TracingModel): void;
    _processAsyncBrowserEvents(tracingModel: SDK.TracingModel.TracingModel): void;
    _buildGPUEvents(tracingModel: SDK.TracingModel.TracingModel): void;
    _buildLoadingEvents(tracingModel: SDK.TracingModel.TracingModel, events: SDK.TracingModel.Event[]): void;
    _resetProcessingState(): void;
    _extractCpuProfile(tracingModel: SDK.TracingModel.TracingModel, thread: SDK.TracingModel.Thread): SDK.CPUProfileDataModel.CPUProfileDataModel | null;
    _injectJSFrameEvents(tracingModel: SDK.TracingModel.TracingModel, thread: SDK.TracingModel.Thread): SDK.TracingModel.Event[];
    _processThreadEvents(tracingModel: SDK.TracingModel.TracingModel, ranges: {
        from: number;
        to: number;
    }[], thread: SDK.TracingModel.Thread, isMainThread: boolean, isWorker: boolean, forMainFrame: boolean, url: string | null): void;
    _fixNegativeDuration(event: SDK.TracingModel.Event, child: SDK.TracingModel.Event): void;
    _processAsyncEvents(thread: SDK.TracingModel.Thread, ranges: {
        from: number;
        to: number;
    }[]): void;
    _processEvent(event: SDK.TracingModel.Event): boolean;
    _processBrowserEvent(event: SDK.TracingModel.Event): void;
    _ensureNamedTrack(type: TrackType): Track;
    _findAncestorEvent(name: string): SDK.TracingModel.Event | null;
    _addPageFrame(event: SDK.TracingModel.Event, payload: any): boolean;
    _reset(): void;
    isGenericTrace(): boolean;
    tracingModel(): SDK.TracingModel.TracingModel | null;
    minimumRecordTime(): number;
    maximumRecordTime(): number;
    inspectedTargetEvents(): SDK.TracingModel.Event[];
    tracks(): Track[];
    isEmpty(): boolean;
    timeMarkerEvents(): SDK.TracingModel.Event[];
    rootFrames(): PageFrame[];
    pageURL(): string;
    pageFrameById(frameId: string): PageFrame | null;
    networkRequests(): NetworkRequest[];
}
export declare enum RecordType {
    Task = "RunTask",
    Program = "Program",
    EventDispatch = "EventDispatch",
    GPUTask = "GPUTask",
    Animation = "Animation",
    RequestMainThreadFrame = "RequestMainThreadFrame",
    BeginFrame = "BeginFrame",
    NeedsBeginFrameChanged = "NeedsBeginFrameChanged",
    BeginMainThreadFrame = "BeginMainThreadFrame",
    ActivateLayerTree = "ActivateLayerTree",
    DrawFrame = "DrawFrame",
    DroppedFrame = "DroppedFrame",
    HitTest = "HitTest",
    ScheduleStyleRecalculation = "ScheduleStyleRecalculation",
    RecalculateStyles = "RecalculateStyles",
    UpdateLayoutTree = "UpdateLayoutTree",
    InvalidateLayout = "InvalidateLayout",
    Layout = "Layout",
    LayoutShift = "LayoutShift",
    UpdateLayer = "UpdateLayer",
    UpdateLayerTree = "UpdateLayerTree",
    PaintSetup = "PaintSetup",
    Paint = "Paint",
    PaintImage = "PaintImage",
    Rasterize = "Rasterize",
    RasterTask = "RasterTask",
    ScrollLayer = "ScrollLayer",
    CompositeLayers = "CompositeLayers",
    ComputeIntersections = "IntersectionObserverController::computeIntersections",
    InteractiveTime = "InteractiveTime",
    ScheduleStyleInvalidationTracking = "ScheduleStyleInvalidationTracking",
    StyleRecalcInvalidationTracking = "StyleRecalcInvalidationTracking",
    StyleInvalidatorInvalidationTracking = "StyleInvalidatorInvalidationTracking",
    LayoutInvalidationTracking = "LayoutInvalidationTracking",
    ParseHTML = "ParseHTML",
    ParseAuthorStyleSheet = "ParseAuthorStyleSheet",
    TimerInstall = "TimerInstall",
    TimerRemove = "TimerRemove",
    TimerFire = "TimerFire",
    XHRReadyStateChange = "XHRReadyStateChange",
    XHRLoad = "XHRLoad",
    CompileScript = "v8.compile",
    EvaluateScript = "EvaluateScript",
    CompileModule = "v8.compileModule",
    EvaluateModule = "v8.evaluateModule",
    WasmStreamFromResponseCallback = "v8.wasm.streamFromResponseCallback",
    WasmCompiledModule = "v8.wasm.compiledModule",
    WasmCachedModule = "v8.wasm.cachedModule",
    WasmModuleCacheHit = "v8.wasm.moduleCacheHit",
    WasmModuleCacheInvalid = "v8.wasm.moduleCacheInvalid",
    FrameStartedLoading = "FrameStartedLoading",
    CommitLoad = "CommitLoad",
    MarkLoad = "MarkLoad",
    MarkDOMContent = "MarkDOMContent",
    MarkFirstPaint = "firstPaint",
    MarkFCP = "firstContentfulPaint",
    MarkLCPCandidate = "largestContentfulPaint::Candidate",
    MarkLCPInvalidate = "largestContentfulPaint::Invalidate",
    NavigationStart = "navigationStart",
    TimeStamp = "TimeStamp",
    ConsoleTime = "ConsoleTime",
    UserTiming = "UserTiming",
    ResourceWillSendRequest = "ResourceWillSendRequest",
    ResourceSendRequest = "ResourceSendRequest",
    ResourceReceiveResponse = "ResourceReceiveResponse",
    ResourceReceivedData = "ResourceReceivedData",
    ResourceFinish = "ResourceFinish",
    ResourceMarkAsCached = "ResourceMarkAsCached",
    RunMicrotasks = "RunMicrotasks",
    FunctionCall = "FunctionCall",
    GCEvent = "GCEvent",
    MajorGC = "MajorGC",
    MinorGC = "MinorGC",
    JSFrame = "JSFrame",
    JSSample = "JSSample",
    V8Sample = "V8Sample",
    JitCodeAdded = "JitCodeAdded",
    JitCodeMoved = "JitCodeMoved",
    StreamingCompileScript = "v8.parseOnBackground",
    StreamingCompileScriptWaiting = "v8.parseOnBackgroundWaiting",
    StreamingCompileScriptParsing = "v8.parseOnBackgroundParsing",
    V8Execute = "V8.Execute",
    UpdateCounters = "UpdateCounters",
    RequestAnimationFrame = "RequestAnimationFrame",
    CancelAnimationFrame = "CancelAnimationFrame",
    FireAnimationFrame = "FireAnimationFrame",
    RequestIdleCallback = "RequestIdleCallback",
    CancelIdleCallback = "CancelIdleCallback",
    FireIdleCallback = "FireIdleCallback",
    WebSocketCreate = "WebSocketCreate",
    WebSocketSendHandshakeRequest = "WebSocketSendHandshakeRequest",
    WebSocketReceiveHandshakeResponse = "WebSocketReceiveHandshakeResponse",
    WebSocketDestroy = "WebSocketDestroy",
    EmbedderCallback = "EmbedderCallback",
    SetLayerTreeId = "SetLayerTreeId",
    TracingStartedInPage = "TracingStartedInPage",
    TracingSessionIdForWorker = "TracingSessionIdForWorker",
    DecodeImage = "Decode Image",
    ResizeImage = "Resize Image",
    DrawLazyPixelRef = "Draw LazyPixelRef",
    DecodeLazyPixelRef = "Decode LazyPixelRef",
    LazyPixelRef = "LazyPixelRef",
    LayerTreeHostImplSnapshot = "cc::LayerTreeHostImpl",
    PictureSnapshot = "cc::Picture",
    DisplayItemListSnapshot = "cc::DisplayItemList",
    LatencyInfo = "LatencyInfo",
    LatencyInfoFlow = "LatencyInfo.Flow",
    InputLatencyMouseMove = "InputLatency::MouseMove",
    InputLatencyMouseWheel = "InputLatency::MouseWheel",
    ImplSideFling = "InputHandlerProxy::HandleGestureFling::started",
    GCCollectGarbage = "BlinkGC.AtomicPhase",
    CryptoDoEncrypt = "DoEncrypt",
    CryptoDoEncryptReply = "DoEncryptReply",
    CryptoDoDecrypt = "DoDecrypt",
    CryptoDoDecryptReply = "DoDecryptReply",
    CryptoDoDigest = "DoDigest",
    CryptoDoDigestReply = "DoDigestReply",
    CryptoDoSign = "DoSign",
    CryptoDoSignReply = "DoSignReply",
    CryptoDoVerify = "DoVerify",
    CryptoDoVerifyReply = "DoVerifyReply",
    CpuProfile = "CpuProfile",
    Profile = "Profile",
    AsyncTask = "AsyncTask"
}
export declare namespace TimelineModelImpl {
    const Category: {
        Console: string;
        UserTiming: string;
        LatencyInfo: string;
        Loading: string;
    };
    enum WarningType {
        LongTask = "LongTask",
        ForcedStyle = "ForcedStyle",
        ForcedLayout = "ForcedLayout",
        IdleDeadlineExceeded = "IdleDeadlineExceeded",
        LongHandler = "LongHandler",
        LongRecurringHandler = "LongRecurringHandler",
        V8Deopt = "V8Deopt"
    }
    const WorkerThreadName = "DedicatedWorker thread";
    const WorkerThreadNameLegacy = "DedicatedWorker Thread";
    const RendererMainThreadName = "CrRendererMain";
    const BrowserMainThreadName = "CrBrowserMain";
    const DevToolsMetadataEvent: {
        TracingStartedInBrowser: string;
        TracingStartedInPage: string;
        TracingSessionIdForWorker: string;
        FrameCommittedInBrowser: string;
        ProcessReadyInBrowser: string;
        FrameDeletedInBrowser: string;
    };
    const Thresholds: {
        LongTask: number;
        Handler: number;
        RecurringHandler: number;
        ForcedLayout: number;
        IdleCallbackAddon: number;
    };
}
export declare class Track {
    name: string;
    type: TrackType;
    forMainFrame: boolean;
    url: string;
    events: SDK.TracingModel.Event[];
    asyncEvents: SDK.TracingModel.AsyncEvent[];
    tasks: SDK.TracingModel.Event[];
    _syncEvents: SDK.TracingModel.Event[] | null;
    thread: SDK.TracingModel.Thread | null;
    constructor();
    syncEvents(): SDK.TracingModel.Event[];
}
export declare enum TrackType {
    MainThread = "MainThread",
    Worker = "Worker",
    Input = "Input",
    Animation = "Animation",
    Timings = "Timings",
    Console = "Console",
    Raster = "Raster",
    GPU = "GPU",
    Experience = "Experience",
    Other = "Other"
}
export declare class PageFrame {
    frameId: any;
    url: any;
    name: any;
    children: PageFrame[];
    parent: PageFrame | null;
    processes: {
        time: number;
        processId: number;
        processPseudoId: string | null;
        url: string;
    }[];
    deletedTime: number | null;
    ownerNode: SDK.DOMModel.DeferredDOMNode | null;
    constructor(payload: any);
    update(time: number, payload: any): void;
    processReady(processPseudoId: string, processId: number): void;
    addChild(child: PageFrame): void;
}
export declare class NetworkRequest {
    startTime: number;
    endTime: number;
    encodedDataLength: number;
    decodedBodyLength: number;
    children: SDK.TracingModel.Event[];
    timing: {
        pushStart: number;
        requestTime: number;
        sendStart: number;
        receiveHeadersEnd: number;
    };
    mimeType: string;
    url: string;
    requestMethod: string;
    _transferSize: number;
    _maybeDiskCached: boolean;
    _memoryCached: boolean;
    priority?: any;
    finishTime?: number;
    responseTime?: number;
    fromServiceWorker?: boolean;
    hasCachedResource?: boolean;
    constructor(event: SDK.TracingModel.Event);
    addEvent(event: SDK.TracingModel.Event): void;
    /**
     * Return whether this request was cached. This works around BUG(chromium:998397),
     * which reports pushed resources, and resources serverd by a service worker as
     * disk cached. Pushed resources that were not disk cached, however, have a non-zero
     * `_transferSize`.
     */
    cached(): boolean;
    /**
     * Return whether this request was served from a memory cache.
     */
    memoryCached(): boolean;
    /**
     * Get the timing information for this request. If the request was cached,
     * the timing refers to the original (uncached) load, and should not be used.
     */
    getSendReceiveTiming(): {
        sendStartTime: number;
        headersEndTime: number;
    };
    /**
     * Get the start time of this request, i.e. the time when the browser or
     * renderer queued this request. There are two cases where request time is
     * earlier than `startTime`: (1) if the request is served from cache, because
     * it refers to the original load of the resource. (2) if the request was
     * initiated by the browser instead of the renderer. Only in case (2) the
     * the request time must be used instead of the start time to work around
     * BUG(chromium:865066).
     */
    getStartTime(): number;
    /**
     * Returns the time where the earliest event belonging to this request starts.
     * This differs from `getStartTime()` if a previous HTTP/2 request pushed the
     * resource proactively: Then `beginTime()` refers to the time the push was received.
     */
    beginTime(): number;
}
export declare class InvalidationTrackingEvent {
    type: string;
    startTime: number;
    _tracingEvent: SDK.TracingModel.Event;
    frame: number;
    nodeId: number | null;
    nodeName: string | null;
    invalidationSet: number | null;
    invalidatedSelectorId: string | null;
    changedId: string | null;
    changedClass: string | null;
    changedAttribute: string | null;
    changedPseudo: string | null;
    selectorPart: string | null;
    extraData: string | null;
    invalidationList: {
        [x: string]: number;
    }[] | null;
    cause: InvalidationCause;
    linkedRecalcStyleEvent: boolean;
    linkedLayoutEvent: boolean;
    constructor(event: SDK.TracingModel.Event, timelineData: TimelineData);
}
export declare class InvalidationTracker {
    _lastRecalcStyle: SDK.TracingModel.Event | null;
    _lastPaintWithLayer: SDK.TracingModel.Event | null;
    _didPaint: boolean;
    _invalidations: {
        [x: string]: InvalidationTrackingEvent[];
    };
    _invalidationsByNodeId: {
        [x: number]: InvalidationTrackingEvent[];
    };
    constructor();
    static invalidationEventsFor(event: SDK.TracingModel.Event): InvalidationTrackingEvent[] | null;
    addInvalidation(invalidation: InvalidationTrackingEvent): void;
    didRecalcStyle(recalcStyleEvent: SDK.TracingModel.Event): void;
    _associateWithLastRecalcStyleEvent(invalidation: InvalidationTrackingEvent): void;
    _addSyntheticStyleRecalcInvalidations(event: SDK.TracingModel.Event, frameId: number, styleInvalidatorInvalidation: InvalidationTrackingEvent): void;
    _addSyntheticStyleRecalcInvalidation(baseEvent: SDK.TracingModel.Event, styleInvalidatorInvalidation: InvalidationTrackingEvent): void;
    didLayout(layoutEvent: SDK.TracingModel.Event): void;
    didPaint(_paintEvent: SDK.TracingModel.Event): void;
    _addInvalidationToEvent(event: SDK.TracingModel.Event, eventFrameId: number, invalidation: InvalidationTrackingEvent): void;
    _invalidationsOfTypes(types?: string[]): Generator<InvalidationTrackingEvent, any, any>;
    _startNewFrameIfNeeded(): void;
    _initializePerFrameState(): void;
}
export declare class TimelineAsyncEventTracker {
    _initiatorByType: Map<RecordType, Map<RecordType, SDK.TracingModel.Event>>;
    constructor();
    static _initialize(): void;
    processEvent(event: SDK.TracingModel.Event): void;
    static _asyncEvents: Map<RecordType, {
        causes: RecordType[];
        joinBy: string;
    }> | null;
    static _typeToInitiator: Map<RecordType, RecordType> | null;
}
export declare class TimelineData {
    warning: string | null;
    previewElement: Element | null;
    url: string | null;
    backendNodeIds: number[];
    stackTrace: Protocol.Runtime.CallFrame[] | null;
    picture: SDK.TracingModel.ObjectSnapshot | null;
    _initiator: SDK.TracingModel.Event | null;
    frameId: string;
    timeWaitingForMainThread?: number;
    constructor();
    setInitiator(initiator: SDK.TracingModel.Event | null): void;
    initiator(): SDK.TracingModel.Event | null;
    topFrame(): Protocol.Runtime.CallFrame | null;
    stackTraceForSelfOrInitiator(): Protocol.Runtime.CallFrame[] | null;
    static forEvent(event: SDK.TracingModel.Event): TimelineData;
}
export interface InvalidationCause {
    reason: string;
    stackTrace: Protocol.Runtime.CallFrame[] | null;
}
export interface MetadataEvents {
    page: SDK.TracingModel.Event[];
    workers: SDK.TracingModel.Event[];
}
