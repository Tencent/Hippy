import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare const ProtocolError: unique symbol;
export declare type ProtocolError = string;
export declare const DevToolsStubErrorCode = -32015;
export declare type Message = {
    sessionId?: string;
    url?: string;
    id?: number;
    error?: Object | null;
    result?: Object | null;
    method?: string;
    params?: Array<string>;
};
export declare class InspectorBackend {
    _agentPrototypes: Map<string, _AgentPrototype>;
    _dispatcherPrototypes: Map<string, _DispatcherPrototype>;
    _initialized: boolean;
    constructor();
    static reportProtocolError(error: string, messageObject: Object): void;
    static reportProtocolWarning(error: string, messageObject: Object): void;
    isInitialized(): boolean;
    _addAgentGetterMethodToProtocolTargetPrototype(domain: string): void;
    _agentPrototype(domain: string): _AgentPrototype;
    _dispatcherPrototype(domain: string): _DispatcherPrototype;
    registerCommand(method: string, signature: {
        name: string;
        type: string;
        optional: boolean;
    }[], replyArgs: string[]): void;
    registerEnum(type: string, values: Object): void;
    registerEvent(eventName: string, params: Object): void;
    wrapClientCallback<T, S>(clientCallback: (arg0: (T | undefined)) => void, errorPrefix: string, constructor?: (new (arg1: S) => T), defaultValue?: T): (arg0: string | null, arg1: S) => void;
}
export declare class Connection {
    _onMessage: ((arg0: Object) => void) | null;
    constructor();
    setOnMessage(_onMessage: (arg0: (Object | string)) => void): void;
    setOnDisconnect(_onDisconnect: (arg0: string) => void): void;
    sendRawMessage(_message: string): void;
    disconnect(): Promise<void>;
    static setFactory(factory: () => Connection): void;
    static getFactory(): () => Connection;
}
declare type SendRawMessageCallback = (...args: unknown[]) => void;
export declare const test: {
    /**
     * This will get called for every protocol message.
     * ProtocolClient.test.dumpProtocol = console.log
     */
    dumpProtocol: ((arg0: string) => void) | null;
    /**
     * Runs a function when no protocol activity is present.
     * ProtocolClient.test.deprecatedRunAfterPendingDispatches(() => console.log('done'))
     */
    deprecatedRunAfterPendingDispatches: ((arg0: () => void) => void) | null;
    /**
     * Sends a raw message over main connection.
     * ProtocolClient.test.sendRawMessage('Page.enable', {}, console.log)
     */
    sendRawMessage: ((arg0: string, arg1: Object | null, arg2: SendRawMessageCallback) => void) | null;
    /**
     * Set to true to not log any errors.
     */
    suppressRequestErrors: boolean;
    /**
     * Set to get notified about any messages sent over protocol.
     */
    onMessageSent: ((message: {
        domain: string;
        method: string;
        params: Object;
        id: number;
        sessionId?: string;
    }, target: TargetBase | null) => void) | null;
    /**
     * Set to get notified about any messages received over protocol.
     */
    onMessageReceived: ((message: Object, target: TargetBase | null) => void) | null;
};
export declare class SessionRouter {
    _connection: Connection;
    _lastMessageId: number;
    _pendingResponsesCount: number;
    _pendingLongPollingMessageIds: Set<number>;
    _domainToLogger: Map<any, any>;
    _sessions: Map<string, {
        target: TargetBase;
        callbacks: Map<number, _CallbackWithDebugInfo>;
        proxyConnection: ((Connection | undefined) | null);
    }>;
    _pendingScripts: (() => void)[];
    constructor(connection: Connection);
    registerSession(target: TargetBase, sessionId: string, proxyConnection?: Connection | null): void;
    unregisterSession(sessionId: string): void;
    _getTargetBySessionId(sessionId: string): TargetBase | null;
    _nextMessageId(): number;
    connection(): Connection;
    sendMessage(sessionId: string, domain: string, method: string, params: Object | null, callback: _Callback): void;
    _sendRawMessageForTesting(method: string, params: Object | null, callback: ((...arg0: any[]) => void) | null): void;
    _onMessage(message: string | Object): void;
    _hasOutstandingNonLongPollingRequests(): boolean;
    _deprecatedRunAfterPendingDispatches(script?: (() => void)): void;
    _executeAfterPendingDispatches(): void;
    static dispatchConnectionError(callback: _Callback, method: string): void;
    static dispatchUnregisterSessionError({ callback, method }: _CallbackWithDebugInfo): void;
}
export declare class TargetBase {
    _needsNodeJSPatching: boolean;
    _sessionId: string;
    _router: SessionRouter | null;
    _agents: {
        [x: string]: _AgentPrototype;
    };
    _dispatchers: {
        [x: string]: _DispatcherPrototype;
    };
    constructor(needsNodeJSPatching: boolean, parentTarget: TargetBase | null, sessionId: string, connection: Connection | null);
    registerDispatcher(domain: string, dispatcher: Object): void;
    unregisterDispatcher(domain: string, dispatcher: Object): void;
    dispose(_reason: string): void;
    isDisposed(): boolean;
    markAsNodeJSForTest(): void;
    router(): SessionRouter | null;
    accessibilityAgent(): ProtocolProxyApi.AccessibilityApi;
    animationAgent(): ProtocolProxyApi.AnimationApi;
    applicationCacheAgent(): ProtocolProxyApi.ApplicationCacheApi;
    auditsAgent(): ProtocolProxyApi.AuditsApi;
    backgroundServiceAgent(): ProtocolProxyApi.BackgroundServiceApi;
    cacheStorageAgent(): ProtocolProxyApi.CacheStorageApi;
    cssAgent(): ProtocolProxyApi.CSSApi;
    databaseAgent(): ProtocolProxyApi.DatabaseApi;
    debuggerAgent(): ProtocolProxyApi.DebuggerApi;
    deviceOrientationAgent(): ProtocolProxyApi.DeviceOrientationApi;
    domAgent(): ProtocolProxyApi.DOMApi;
    domdebuggerAgent(): ProtocolProxyApi.DOMDebuggerApi;
    domsnapshotAgent(): ProtocolProxyApi.DOMSnapshotApi;
    domstorageAgent(): ProtocolProxyApi.DOMStorageApi;
    emulationAgent(): ProtocolProxyApi.EmulationApi;
    heapProfilerAgent(): ProtocolProxyApi.HeapProfilerApi;
    indexedDBAgent(): ProtocolProxyApi.IndexedDBApi;
    inputAgent(): ProtocolProxyApi.InputApi;
    ioAgent(): ProtocolProxyApi.IOApi;
    inspectorAgent(): ProtocolProxyApi.InspectorApi;
    layerTreeAgent(): ProtocolProxyApi.LayerTreeApi;
    logAgent(): ProtocolProxyApi.LogApi;
    mediaAgent(): ProtocolProxyApi.MediaApi;
    memoryAgent(): ProtocolProxyApi.MemoryApi;
    networkAgent(): ProtocolProxyApi.NetworkApi;
    overlayAgent(): ProtocolProxyApi.OverlayApi;
    pageAgent(): ProtocolProxyApi.PageApi;
    profilerAgent(): ProtocolProxyApi.ProfilerApi;
    performanceAgent(): ProtocolProxyApi.PerformanceApi;
    runtimeAgent(): ProtocolProxyApi.RuntimeApi;
    securityAgent(): ProtocolProxyApi.SecurityApi;
    serviceWorkerAgent(): ProtocolProxyApi.ServiceWorkerApi;
    storageAgent(): ProtocolProxyApi.StorageApi;
    targetAgent(): ProtocolProxyApi.TargetApi;
    tracingAgent(): ProtocolProxyApi.TracingApi;
    webAudioAgent(): ProtocolProxyApi.WebAudioApi;
    webAuthnAgent(): ProtocolProxyApi.WebAuthnApi;
    registerAnimationDispatcher(_dispatcher: ProtocolProxyApi.AnimationDispatcher): void;
    registerApplicationCacheDispatcher(_dispatcher: ProtocolProxyApi.ApplicationCacheDispatcher): void;
    registerAuditsDispatcher(_dispatcher: ProtocolProxyApi.AuditsDispatcher): void;
    registerCSSDispatcher(_dispatcher: ProtocolProxyApi.CSSDispatcher): void;
    registerDatabaseDispatcher(_dispatcher: ProtocolProxyApi.DatabaseDispatcher): void;
    registerBackgroundServiceDispatcher(_dispatcher: ProtocolProxyApi.BackgroundServiceDispatcher): void;
    registerDebuggerDispatcher(_dispatcher: ProtocolProxyApi.DebuggerDispatcher): void;
    unregisterDebuggerDispatcher(_dispatcher: ProtocolProxyApi.DebuggerDispatcher): void;
    registerDOMDispatcher(_dispatcher: ProtocolProxyApi.DOMDispatcher): void;
    registerDOMStorageDispatcher(_dispatcher: ProtocolProxyApi.DOMStorageDispatcher): void;
    registerHeapProfilerDispatcher(_dispatcher: ProtocolProxyApi.HeapProfilerDispatcher): void;
    registerInspectorDispatcher(_dispatcher: ProtocolProxyApi.InspectorDispatcher): void;
    registerLayerTreeDispatcher(_dispatcher: ProtocolProxyApi.LayerTreeDispatcher): void;
    registerLogDispatcher(_dispatcher: ProtocolProxyApi.LogDispatcher): void;
    registerMediaDispatcher(_dispatcher: ProtocolProxyApi.MediaDispatcher): void;
    registerNetworkDispatcher(_dispatcher: ProtocolProxyApi.NetworkDispatcher): void;
    registerOverlayDispatcher(_dispatcher: ProtocolProxyApi.OverlayDispatcher): void;
    registerPageDispatcher(_dispatcher: ProtocolProxyApi.PageDispatcher): void;
    registerProfilerDispatcher(_dispatcher: ProtocolProxyApi.ProfilerDispatcher): void;
    registerRuntimeDispatcher(_dispatcher: ProtocolProxyApi.RuntimeDispatcher): void;
    registerSecurityDispatcher(_dispatcher: ProtocolProxyApi.SecurityDispatcher): void;
    registerServiceWorkerDispatcher(_dispatcher: ProtocolProxyApi.ServiceWorkerDispatcher): void;
    registerStorageDispatcher(_dispatcher: ProtocolProxyApi.StorageDispatcher): void;
    registerTargetDispatcher(_dispatcher: ProtocolProxyApi.TargetDispatcher): void;
    registerTracingDispatcher(_dispatcher: ProtocolProxyApi.TracingDispatcher): void;
    registerWebAudioDispatcher(_dispatcher: ProtocolProxyApi.WebAudioDispatcher): void;
}
declare class _AgentPrototype {
    _replyArgs: {
        [x: string]: string[];
    };
    _domain: string;
    _target: TargetBase;
    constructor(domain: string);
    registerCommand(methodName: string, signature: {
        name: string;
        type: string;
        optional: boolean;
    }[], replyArgs: string[]): void;
    _prepareParameters(method: string, signature: {
        name: string;
        type: string;
        optional: boolean;
    }[], args: any[], errorCallback: (arg0: string) => void): Object | null;
    _sendMessageToBackendPromise(method: string, signature: {
        name: string;
        type: string;
        optional: boolean;
    }[], args: any[]): Promise<any>;
    _invoke(method: string, request: Object | null): Promise<Object>;
}
declare class _DispatcherPrototype {
    _eventArgs: {
        [x: string]: any;
    };
    _dispatchers: any[];
    constructor();
    registerEvent(eventName: string, params: Object): void;
    addDomainDispatcher(dispatcher: Object): void;
    removeDomainDispatcher(dispatcher: Object): void;
    dispatch(functionName: string, messageObject: {
        method: string;
        params: ({
            [x: string]: any;
        } | undefined) | null;
    }): void;
}
export declare type _Callback = (arg0: Object | null, arg1: Object | null) => void;
export interface _CallbackWithDebugInfo {
    callback: (arg0: Object | null, arg1: Object | null) => void;
    method: string;
}
export declare const inspectorBackend: InspectorBackend;
export {};
