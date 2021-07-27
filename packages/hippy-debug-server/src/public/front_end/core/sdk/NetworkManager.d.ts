import type * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as Platform from '../platform/platform.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import type { ContentData, ExtraRequestInfo, ExtraResponseInfo, NameValue, WebBundleInfo, WebBundleInnerRequestInfo } from './NetworkRequest.js';
import { NetworkRequest } from './NetworkRequest.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import type { SDKModelObserver } from './TargetManager.js';
export declare class NetworkManager extends SDKModel {
    _dispatcher: NetworkDispatcher;
    _networkAgent: ProtocolProxyApi.NetworkApi;
    _bypassServiceWorkerSetting: Common.Settings.Setting<boolean>;
    constructor(target: Target);
    static forRequest(request: NetworkRequest): NetworkManager | null;
    static canReplayRequest(request: NetworkRequest): boolean;
    static replayRequest(request: NetworkRequest): void;
    static searchInRequest(request: NetworkRequest, query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
    static requestContentData(request: NetworkRequest): Promise<ContentData>;
    static requestPostData(request: NetworkRequest): Promise<string | null>;
    static _connectionType(conditions: Conditions): Protocol.Network.ConnectionType;
    static lowercaseHeaders(headers: {
        [x: string]: string;
    }): {
        [x: string]: string;
    };
    requestForURL(url: string): NetworkRequest | null;
    _cacheDisabledSettingChanged(event: Common.EventTarget.EventTargetEvent): void;
    dispose(): void;
    _bypassServiceWorkerChanged(): void;
    getSecurityIsolationStatus(frameId: string): Promise<Protocol.Network.SecurityIsolationStatus | null>;
    loadNetworkResource(frameId: string, url: string, options: Protocol.Network.LoadNetworkResourceOptions): Promise<Protocol.Network.LoadNetworkResourcePageResult>;
    clearRequests(): void;
}
export declare enum Events {
    RequestStarted = "RequestStarted",
    RequestUpdated = "RequestUpdated",
    RequestFinished = "RequestFinished",
    RequestUpdateDropped = "RequestUpdateDropped",
    ResponseReceived = "ResponseReceived",
    MessageGenerated = "MessageGenerated",
    RequestRedirected = "RequestRedirected",
    LoadingFinished = "LoadingFinished"
}
export declare const NoThrottlingConditions: Conditions;
export declare const OfflineConditions: Conditions;
export declare const Slow3GConditions: Conditions;
export declare const Fast3GConditions: Conditions;
export declare class NetworkDispatcher implements ProtocolProxyApi.NetworkDispatcher {
    _manager: NetworkManager;
    private requestsById;
    private requestsByURL;
    _requestIdToExtraInfoBuilder: Map<string, ExtraInfoBuilder>;
    _requestIdToTrustTokenEvent: Map<string, Protocol.Network.TrustTokenOperationDoneEvent>;
    constructor(manager: NetworkManager);
    _headersMapToHeadersArray(headersMap: Protocol.Network.Headers): NameValue[];
    _updateNetworkRequestWithRequest(networkRequest: NetworkRequest, request: Protocol.Network.Request): void;
    _updateNetworkRequestWithResponse(networkRequest: NetworkRequest, response: Protocol.Network.Response): void;
    requestForId(url: string): NetworkRequest | null;
    requestForURL(url: string): NetworkRequest | null;
    resourceChangedPriority({ requestId, newPriority }: Protocol.Network.ResourceChangedPriorityEvent): void;
    signedExchangeReceived({ requestId, info }: Protocol.Network.SignedExchangeReceivedEvent): void;
    requestWillBeSent({ requestId, loaderId, documentURL, request, timestamp, wallTime, initiator, redirectResponse, type, frameId }: Protocol.Network.RequestWillBeSentEvent): void;
    requestServedFromCache({ requestId }: Protocol.Network.RequestServedFromCacheEvent): void;
    responseReceived({ requestId, loaderId, timestamp, type, response, frameId }: Protocol.Network.ResponseReceivedEvent): void;
    dataReceived({ requestId, timestamp, dataLength, encodedDataLength }: Protocol.Network.DataReceivedEvent): void;
    loadingFinished({ requestId, timestamp: finishTime, encodedDataLength, shouldReportCorbBlocking }: Protocol.Network.LoadingFinishedEvent): void;
    loadingFailed({ requestId, timestamp: time, type: resourceType, errorText: localizedDescription, canceled, blockedReason, corsErrorStatus, }: Protocol.Network.LoadingFailedEvent): void;
    webSocketCreated({ requestId, url: requestURL, initiator }: Protocol.Network.WebSocketCreatedEvent): void;
    webSocketWillSendHandshakeRequest({ requestId, timestamp: time, wallTime, request }: Protocol.Network.WebSocketWillSendHandshakeRequestEvent): void;
    webSocketHandshakeResponseReceived({ requestId, timestamp: time, response }: Protocol.Network.WebSocketHandshakeResponseReceivedEvent): void;
    webSocketFrameReceived({ requestId, timestamp: time, response }: Protocol.Network.WebSocketFrameReceivedEvent): void;
    webSocketFrameSent({ requestId, timestamp: time, response }: Protocol.Network.WebSocketFrameSentEvent): void;
    webSocketFrameError({ requestId, timestamp: time, errorMessage }: Protocol.Network.WebSocketFrameErrorEvent): void;
    webSocketClosed({ requestId, timestamp: time }: Protocol.Network.WebSocketClosedEvent): void;
    eventSourceMessageReceived({ requestId, timestamp: time, eventName, eventId, data }: Protocol.Network.EventSourceMessageReceivedEvent): void;
    requestIntercepted({ interceptionId, request, frameId, resourceType, isNavigationRequest, isDownload, redirectUrl, authChallenge, responseErrorReason, responseStatusCode, responseHeaders, requestId, }: Protocol.Network.RequestInterceptedEvent): void;
    requestWillBeSentExtraInfo({ requestId, associatedCookies, headers, clientSecurityState }: Protocol.Network.RequestWillBeSentExtraInfoEvent): void;
    responseReceivedExtraInfo({ requestId, blockedCookies, headers, headersText, resourceIPAddressSpace }: Protocol.Network.ResponseReceivedExtraInfoEvent): void;
    _getExtraInfoBuilder(requestId: string): ExtraInfoBuilder;
    _appendRedirect(requestId: string, time: number, redirectURL: string): NetworkRequest;
    _maybeAdoptMainResourceRequest(requestId: string): NetworkRequest | null;
    _startNetworkRequest(networkRequest: NetworkRequest, originalRequest: Protocol.Network.Request | null): void;
    _updateNetworkRequest(networkRequest: NetworkRequest): void;
    _finishNetworkRequest(networkRequest: NetworkRequest, finishTime: number, encodedDataLength: number, shouldReportCorbBlocking?: boolean): void;
    _createNetworkRequest(requestId: string, frameId: string, loaderId: string, url: string, documentURL: string, initiator: Protocol.Network.Initiator | null): NetworkRequest;
    clearRequests(): void;
    webTransportCreated({ transportId, url: requestURL, timestamp: time, initiator }: Protocol.Network.WebTransportCreatedEvent): void;
    webTransportConnectionEstablished({ transportId, timestamp: time }: Protocol.Network.WebTransportConnectionEstablishedEvent): void;
    webTransportClosed({ transportId, timestamp: time }: Protocol.Network.WebTransportClosedEvent): void;
    trustTokenOperationDone(event: Protocol.Network.TrustTokenOperationDoneEvent): void;
    subresourceWebBundleMetadataReceived({ requestId, urls }: Protocol.Network.SubresourceWebBundleMetadataReceivedEvent): void;
    subresourceWebBundleMetadataError({ requestId, errorMessage }: Protocol.Network.SubresourceWebBundleMetadataErrorEvent): void;
    subresourceWebBundleInnerResponseParsed({ innerRequestId, bundleRequestId }: Protocol.Network.SubresourceWebBundleInnerResponseParsedEvent): void;
    subresourceWebBundleInnerResponseError({ innerRequestId, errorMessage }: Protocol.Network.SubresourceWebBundleInnerResponseErrorEvent): void;
}
export declare class MultitargetNetworkManager extends Common.ObjectWrapper.ObjectWrapper implements SDKModelObserver<NetworkManager> {
    _userAgentOverride: string;
    _userAgentMetadataOverride: Protocol.Emulation.UserAgentMetadata | null;
    _customAcceptedEncodings: Protocol.Network.ContentEncoding[] | null;
    _agents: Set<ProtocolProxyApi.NetworkApi>;
    _inflightMainResourceRequests: Map<string, NetworkRequest>;
    _networkConditions: Conditions;
    _updatingInterceptionPatternsPromise: Promise<void> | null;
    _blockingEnabledSetting: Common.Settings.Setting<any>;
    _blockedPatternsSetting: Common.Settings.Setting<any>;
    _effectiveBlockedURLs: string[];
    _urlsForRequestInterceptor: Platform.MapUtilities.Multimap<(arg0: InterceptedRequest) => Promise<void>, InterceptionPattern>;
    _extraHeaders?: Protocol.Network.Headers;
    _customUserAgent?: string;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): MultitargetNetworkManager;
    static getChromeVersion(): string;
    static patchUserAgentWithChromeVersion(uaString: string): string;
    static patchUserAgentMetadataWithChromeVersion(userAgentMetadata: Protocol.Emulation.UserAgentMetadata): void;
    modelAdded(networkManager: NetworkManager): void;
    modelRemoved(networkManager: NetworkManager): void;
    isThrottling(): boolean;
    isOffline(): boolean;
    setNetworkConditions(conditions: Conditions): void;
    networkConditions(): Conditions;
    _updateNetworkConditions(networkAgent: ProtocolProxyApi.NetworkApi): void;
    setExtraHTTPHeaders(headers: Protocol.Network.Headers): void;
    currentUserAgent(): string;
    _updateUserAgentOverride(): void;
    setUserAgentOverride(userAgent: string, userAgentMetadataOverride: Protocol.Emulation.UserAgentMetadata | null): void;
    userAgentOverride(): string;
    setCustomUserAgentOverride(userAgent: string, userAgentMetadataOverride?: Protocol.Emulation.UserAgentMetadata | null): void;
    setCustomAcceptedEncodingsOverride(acceptedEncodings: Protocol.Network.ContentEncoding[]): void;
    clearCustomAcceptedEncodingsOverride(): void;
    isAcceptedEncodingOverrideSet(): boolean;
    _updateAcceptedEncodingsOverride(): void;
    blockedPatterns(): BlockedPattern[];
    blockingEnabled(): boolean;
    isBlocking(): boolean;
    setBlockedPatterns(patterns: BlockedPattern[]): void;
    setBlockingEnabled(enabled: boolean): void;
    _updateBlockedPatterns(): void;
    isIntercepting(): boolean;
    setInterceptionHandlerForPatterns(patterns: InterceptionPattern[], requestInterceptor: (arg0: InterceptedRequest) => Promise<void>): Promise<void>;
    _updateInterceptionPatternsOnNextTick(): Promise<void>;
    _updateInterceptionPatterns(): Promise<void>;
    _requestIntercepted(interceptedRequest: InterceptedRequest): Promise<void>;
    clearBrowserCache(): void;
    clearBrowserCookies(): void;
    getCertificate(origin: string): Promise<string[]>;
    loadResource(url: string): Promise<{
        success: boolean;
        content: string;
        errorDescription: Host.ResourceLoader.LoadErrorDescription;
    }>;
}
export declare namespace MultitargetNetworkManager {
    enum Events {
        BlockedPatternsChanged = "BlockedPatternsChanged",
        ConditionsChanged = "ConditionsChanged",
        UserAgentChanged = "UserAgentChanged",
        InterceptorsChanged = "InterceptorsChanged",
        AcceptedEncodingsChanged = "AcceptedEncodingsChanged"
    }
}
export declare class InterceptedRequest {
    _networkAgent: ProtocolProxyApi.NetworkApi;
    _interceptionId: string;
    _hasResponded: boolean;
    request: Protocol.Network.Request;
    frameId: string;
    resourceType: Protocol.Network.ResourceType;
    isNavigationRequest: boolean;
    isDownload: boolean;
    redirectUrl: string | undefined;
    authChallenge: Protocol.Network.AuthChallenge | undefined;
    responseErrorReason: Protocol.Network.ErrorReason | undefined;
    responseStatusCode: number | undefined;
    responseHeaders: Protocol.Network.Headers | undefined;
    requestId: string | undefined;
    constructor(networkAgent: ProtocolProxyApi.NetworkApi, interceptionId: string, request: Protocol.Network.Request, frameId: string, resourceType: Protocol.Network.ResourceType, isNavigationRequest: boolean, isDownload?: boolean, redirectUrl?: string, authChallenge?: Protocol.Network.AuthChallenge, responseErrorReason?: Protocol.Network.ErrorReason, responseStatusCode?: number, responseHeaders?: Protocol.Network.Headers, requestId?: string);
    hasResponded(): boolean;
    continueRequestWithContent(contentBlob: Blob): Promise<void>;
    continueRequestWithoutChange(): void;
    continueRequestWithError(errorReason: Protocol.Network.ErrorReason): void;
    responseBody(): Promise<ContentData>;
}
/**
 * Helper class to match requests created from requestWillBeSent with
 * requestWillBeSentExtraInfo and responseReceivedExtraInfo when they have the
 * same requestId due to redirects.
 */
declare class ExtraInfoBuilder {
    _requests: NetworkRequest[];
    _requestExtraInfos: (ExtraRequestInfo | null)[];
    _responseExtraInfos: (ExtraResponseInfo | null)[];
    _finished: boolean;
    _hasExtraInfo: boolean;
    private webBundleInfo;
    private webBundleInnerRequestInfo;
    constructor();
    addRequest(req: NetworkRequest): void;
    addRequestExtraInfo(info: ExtraRequestInfo): void;
    addResponseExtraInfo(info: ExtraResponseInfo): void;
    setWebBundleInfo(info: WebBundleInfo): void;
    setWebBundleInnerRequestInfo(info: WebBundleInnerRequestInfo): void;
    finished(): void;
    _sync(index: number): void;
    private updateFinalRequest;
}
export interface Conditions {
    download: number;
    upload: number;
    latency: number;
    title: string | (() => string);
}
export interface BlockedPattern {
    url: string;
    enabled: boolean;
}
export interface Message {
    message: string;
    requestId: string;
    warning: boolean;
}
export interface InterceptionPattern {
    urlPattern: string;
    interceptionStage: Protocol.Network.InterceptionStage;
}
export declare type RequestInterceptor = (request: InterceptedRequest) => Promise<void>;
export interface RequestUpdateDroppedEventData {
    url: string;
    frameId: string;
    loaderId: string;
    resourceType: Protocol.Network.ResourceType;
    mimeType: string;
    lastModified: Date | null;
}
export {};
