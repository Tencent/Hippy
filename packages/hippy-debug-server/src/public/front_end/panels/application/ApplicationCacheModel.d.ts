import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class ApplicationCacheModel extends SDK.SDKModel.SDKModel {
    _agent: ProtocolProxyApi.ApplicationCacheApi;
    _statuses: Map<string, number>;
    _manifestURLsByFrame: Map<string, string>;
    _onLine: boolean;
    constructor(target: SDK.Target.Target);
    _frameNavigatedCallback(event: Common.EventTarget.EventTargetEvent): void;
    _frameNavigated(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _frameDetached(event: Common.EventTarget.EventTargetEvent): void;
    reset(): void;
    _mainFrameNavigated(): Promise<void>;
    _frameManifestUpdated(frameId: string, manifestURL: string, status: number): void;
    _frameManifestRemoved(frameId: string): void;
    frameManifestURL(frameId: string): string;
    frameManifestStatus(frameId: string): number;
    get onLine(): boolean;
    _statusUpdated(frameId: string, manifestURL: string, status: number): void;
    requestApplicationCache(frameId: string): Promise<Protocol.ApplicationCache.ApplicationCache | null>;
    _networkStateUpdated(isNowOnline: boolean): void;
}
export declare enum Events {
    FrameManifestStatusUpdated = "FrameManifestStatusUpdated",
    FrameManifestAdded = "FrameManifestAdded",
    FrameManifestRemoved = "FrameManifestRemoved",
    FrameManifestsReset = "FrameManifestsReset",
    NetworkStateChanged = "NetworkStateChanged"
}
export declare class ApplicationCacheDispatcher implements ProtocolProxyApi.ApplicationCacheDispatcher {
    _applicationCacheModel: ApplicationCacheModel;
    constructor(applicationCacheModel: ApplicationCacheModel);
    applicationCacheStatusUpdated({ frameId, manifestURL, status }: Protocol.ApplicationCache.ApplicationCacheStatusUpdatedEvent): void;
    networkStateUpdated({ isNowOnline }: Protocol.ApplicationCache.NetworkStateUpdatedEvent): void;
}
export declare const UNCACHED = 0;
export declare const IDLE = 1;
export declare const CHECKING = 2;
export declare const DOWNLOADING = 3;
export declare const UPDATEREADY = 4;
export declare const OBSOLETE = 5;
