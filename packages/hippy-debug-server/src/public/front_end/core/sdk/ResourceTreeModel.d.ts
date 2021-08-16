import * as Common from '../common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import type { DeferredDOMNode, DOMNode } from './DOMModel.js';
import { DOMModel } from './DOMModel.js';
import type { NetworkRequest } from './NetworkRequest.js';
import { Resource } from './Resource.js';
import { ExecutionContext } from './RuntimeModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { SecurityOriginManager } from './SecurityOriginManager.js';
export declare class ResourceTreeModel extends SDKModel {
    _agent: ProtocolProxyApi.PageApi;
    _securityOriginManager: SecurityOriginManager;
    _frames: Map<string, ResourceTreeFrame>;
    _cachedResourcesProcessed: boolean;
    _pendingReloadOptions: {
        ignoreCache: (boolean | undefined);
        scriptToEvaluateOnLoad: (string | undefined);
    } | null;
    _reloadSuspensionCount: number;
    _isInterstitialShowing: boolean;
    mainFrame: ResourceTreeFrame | null;
    private pendingBackForwardCacheNotUsedEvents;
    constructor(target: Target);
    static frameForRequest(request: NetworkRequest): ResourceTreeFrame | null;
    static frames(): ResourceTreeFrame[];
    static resourceForURL(url: string): Resource | null;
    static reloadAllPages(bypassCache?: boolean, scriptToEvaluateOnLoad?: string): void;
    domModel(): DOMModel;
    _processCachedResources(mainFramePayload: Protocol.Page.FrameResourceTree | null): void;
    cachedResourcesLoaded(): boolean;
    isInterstitialShowing(): boolean;
    _addFrame(frame: ResourceTreeFrame, _aboutToNavigate?: boolean): void;
    _frameAttached(frameId: string, parentFrameId: string | null, stackTrace?: Protocol.Runtime.StackTrace): ResourceTreeFrame | null;
    _frameNavigated(framePayload: Protocol.Page.Frame, type: Protocol.Page.NavigationType | undefined): void;
    _documentOpened(framePayload: Protocol.Page.Frame): void;
    _frameDetached(frameId: string, isSwap: boolean): void;
    _onRequestFinished(event: Common.EventTarget.EventTargetEvent): void;
    _onRequestUpdateDropped(event: Common.EventTarget.EventTargetEvent): void;
    frameForId(frameId: string): ResourceTreeFrame | null;
    forAllResources(callback: (arg0: Resource) => boolean): boolean;
    frames(): ResourceTreeFrame[];
    resourceForURL(url: string): Resource | null;
    _addFramesRecursively(sameTargetParentFrame: ResourceTreeFrame | null, frameTreePayload: Protocol.Page.FrameResourceTree): void;
    _createResourceFromFramePayload(frame: Protocol.Page.Frame, url: string, type: Common.ResourceType.ResourceType, mimeType: string, lastModifiedTime: number | null, contentSize: number | null): Resource;
    suspendReload(): void;
    resumeReload(): void;
    reloadPage(ignoreCache?: boolean, scriptToEvaluateOnLoad?: string): void;
    navigate(url: string): Promise<any>;
    navigationHistory(): Promise<{
        currentIndex: number;
        entries: Array<Protocol.Page.NavigationEntry>;
    } | null>;
    navigateToHistoryEntry(entry: Protocol.Page.NavigationEntry): void;
    setLifecycleEventsEnabled(enabled: boolean): Promise<Protocol.ProtocolResponseWithError>;
    fetchAppManifest(): Promise<{
        url: string;
        data: string | null;
        errors: Array<Protocol.Page.AppManifestError>;
    }>;
    getInstallabilityErrors(): Promise<Protocol.Page.InstallabilityError[]>;
    getManifestIcons(): Promise<{
        primaryIcon: string | null;
    }>;
    _executionContextComparator(a: ExecutionContext, b: ExecutionContext): number;
    _getSecurityOriginData(): SecurityOriginData;
    _updateSecurityOrigins(): void;
    getMainSecurityOrigin(): string | null;
    onBackForwardCacheNotUsed(event: Protocol.Page.BackForwardCacheNotUsedEvent): void;
    processPendingBackForwardCacheNotUsedEvents(frame: ResourceTreeFrame): void;
}
export declare enum Events {
    FrameAdded = "FrameAdded",
    FrameNavigated = "FrameNavigated",
    FrameDetached = "FrameDetached",
    FrameResized = "FrameResized",
    FrameWillNavigate = "FrameWillNavigate",
    MainFrameNavigated = "MainFrameNavigated",
    ResourceAdded = "ResourceAdded",
    WillLoadCachedResources = "WillLoadCachedResources",
    CachedResourcesLoaded = "CachedResourcesLoaded",
    DOMContentLoaded = "DOMContentLoaded",
    LifecycleEvent = "LifecycleEvent",
    Load = "Load",
    PageReloadRequested = "PageReloadRequested",
    WillReloadPage = "WillReloadPage",
    InterstitialShown = "InterstitialShown",
    InterstitialHidden = "InterstitialHidden",
    BackForwardCacheDetailsUpdated = "BackForwardCacheDetailsUpdated"
}
export declare class ResourceTreeFrame {
    _model: ResourceTreeModel;
    _sameTargetParentFrame: ResourceTreeFrame | null;
    _id: string;
    _crossTargetParentFrameId: string | null;
    _loaderId: string;
    _name: string | null | undefined;
    _url: string;
    _domainAndRegistry: string;
    _securityOrigin: string | null;
    _mimeType: string | null;
    _unreachableUrl: string;
    _adFrameType: Protocol.Page.AdFrameType;
    _secureContextType: Protocol.Page.SecureContextType | null;
    _crossOriginIsolatedContextType: Protocol.Page.CrossOriginIsolatedContextType | null;
    _gatedAPIFeatures: Protocol.Page.GatedAPIFeatures[] | null;
    private creationStackTrace;
    private creationStackTraceTarget;
    _childFrames: Set<ResourceTreeFrame>;
    _resourcesMap: Map<string, Resource>;
    backForwardCacheDetails: {
        restoredFromCache: boolean | undefined;
    };
    constructor(model: ResourceTreeModel, parentFrame: ResourceTreeFrame | null, frameId: string, payload: Protocol.Page.Frame | null, creationStackTrace: Protocol.Runtime.StackTrace | null);
    isSecureContext(): boolean;
    getSecureContextType(): Protocol.Page.SecureContextType | null;
    isCrossOriginIsolated(): boolean;
    getCrossOriginIsolatedContextType(): Protocol.Page.CrossOriginIsolatedContextType | null;
    getGatedAPIFeatures(): Protocol.Page.GatedAPIFeatures[] | null;
    getCreationStackTraceData(): {
        creationStackTrace: Protocol.Runtime.StackTrace | null;
        creationStackTraceTarget: Target;
    };
    _navigate(framePayload: Protocol.Page.Frame): void;
    resourceTreeModel(): ResourceTreeModel;
    get id(): string;
    get name(): string;
    get url(): string;
    domainAndRegistry(): string;
    get securityOrigin(): string | null;
    unreachableUrl(): string;
    get loaderId(): string;
    adFrameType(): Protocol.Page.AdFrameType;
    get childFrames(): ResourceTreeFrame[];
    /**
     * Returns the parent frame if both frames are part of the same process/target.
     */
    sameTargetParentFrame(): ResourceTreeFrame | null;
    /**
     * Returns the parent frame if both frames are part of different processes/targets (child is an OOPIF).
     */
    crossTargetParentFrame(): ResourceTreeFrame | null;
    /**
     * Returns the parent frame. There is only 1 parent and it's either in the
     * same target or it's cross-target.
     */
    parentFrame(): ResourceTreeFrame | null;
    /**
     * Returns true if this is the main frame of its target. For example, this returns true for the main frame
     * of an out-of-process iframe (OOPIF).
     */
    isMainFrame(): boolean;
    /**
     * Returns true if this is the top frame of the main target, i.e. if this is the top-most frame in the inspected
     * tab.
     */
    isTopFrame(): boolean;
    _removeChildFrame(frame: ResourceTreeFrame, isSwap: boolean): void;
    _removeChildFrames(): void;
    _remove(isSwap: boolean): void;
    addResource(resource: Resource): void;
    _addRequest(request: NetworkRequest): void;
    resources(): Resource[];
    resourceForURL(url: string): Resource | null;
    _callForFrameResources(callback: (arg0: Resource) => boolean): boolean;
    displayName(): string;
    getOwnerDeferredDOMNode(): Promise<DeferredDOMNode | null>;
    getOwnerDOMNodeOrDocument(): Promise<DOMNode | null>;
    highlight(): Promise<void>;
    getPermissionsPolicyState(): Promise<Protocol.Page.PermissionsPolicyFeatureState[] | null>;
    setCreationStackTrace(creationStackTraceData: {
        creationStackTrace: Protocol.Runtime.StackTrace | null;
        creationStackTraceTarget: Target;
    }): void;
}
export declare class PageDispatcher implements ProtocolProxyApi.PageDispatcher {
    _resourceTreeModel: ResourceTreeModel;
    constructor(resourceTreeModel: ResourceTreeModel);
    backForwardCacheNotUsed(params: Protocol.Page.BackForwardCacheNotUsedEvent): void;
    domContentEventFired({ timestamp }: Protocol.Page.DomContentEventFiredEvent): void;
    loadEventFired({ timestamp }: Protocol.Page.LoadEventFiredEvent): void;
    lifecycleEvent({ frameId, name }: Protocol.Page.LifecycleEventEvent): void;
    frameAttached({ frameId, parentFrameId, stack }: Protocol.Page.FrameAttachedEvent): void;
    frameNavigated({ frame, type }: Protocol.Page.FrameNavigatedEvent): void;
    documentOpened({ frame }: Protocol.Page.DocumentOpenedEvent): void;
    frameDetached({ frameId, reason }: Protocol.Page.FrameDetachedEvent): void;
    frameStartedLoading({}: Protocol.Page.FrameStartedLoadingEvent): void;
    frameStoppedLoading({}: Protocol.Page.FrameStoppedLoadingEvent): void;
    frameRequestedNavigation({}: Protocol.Page.FrameRequestedNavigationEvent): void;
    frameScheduledNavigation({}: Protocol.Page.FrameScheduledNavigationEvent): void;
    frameClearedScheduledNavigation({}: Protocol.Page.FrameClearedScheduledNavigationEvent): void;
    navigatedWithinDocument({}: Protocol.Page.NavigatedWithinDocumentEvent): void;
    frameResized(): void;
    javascriptDialogOpening({ hasBrowserHandler }: Protocol.Page.JavascriptDialogOpeningEvent): void;
    javascriptDialogClosed({}: Protocol.Page.JavascriptDialogClosedEvent): void;
    screencastFrame({}: Protocol.Page.ScreencastFrameEvent): void;
    screencastVisibilityChanged({}: Protocol.Page.ScreencastVisibilityChangedEvent): void;
    interstitialShown(): void;
    interstitialHidden(): void;
    windowOpen({}: Protocol.Page.WindowOpenEvent): void;
    compilationCacheProduced({}: Protocol.Page.CompilationCacheProducedEvent): void;
    fileChooserOpened({}: Protocol.Page.FileChooserOpenedEvent): void;
    downloadWillBegin({}: Protocol.Page.DownloadWillBeginEvent): void;
    downloadProgress(): void;
}
export interface SecurityOriginData {
    securityOrigins: Set<string>;
    mainSecurityOrigin: string | null;
    unreachableMainSecurityOrigin: string | null;
}
