import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import type * as Protocol from '../../generated/protocol.js';
import type { Target } from './Target.js';
export declare type PageResourceLoadInitiator = {
    target: null;
    frameId: Protocol.Page.FrameId;
    initiatorUrl: string | null;
} | {
    target: Target;
    frameId: Protocol.Page.FrameId | null;
    initiatorUrl: string | null;
};
export interface PageResource {
    success: boolean | null;
    errorMessage?: string;
    initiator: PageResourceLoadInitiator;
    url: string;
    size: number | null;
}
/**
 * The page resource loader is a bottleneck for all DevTools-initiated resource loads. For each such load, it keeps a
 * `PageResource` object around that holds meta information. This can be as the basis for reporting to the user which
 * resources were loaded, and whether there was a load error.
 */
export declare class PageResourceLoader extends Common.ObjectWrapper.ObjectWrapper {
    _currentlyLoading: number;
    _maxConcurrentLoads: number;
    _pageResources: Map<string, PageResource>;
    _queuedLoads: {
        resolve: (arg0: any) => void;
        reject: (arg0: any) => void;
    }[];
    _loadOverride: ((arg0: string) => Promise<{
        success: boolean;
        content: string;
        errorDescription: Host.ResourceLoader.LoadErrorDescription;
    }>) | null;
    _loadTimeout: number;
    constructor(loadOverride: ((arg0: string) => Promise<{
        success: boolean;
        content: string;
        errorDescription: Host.ResourceLoader.LoadErrorDescription;
    }>) | null, maxConcurrentLoads: number, loadTimeout: number);
    static instance({ forceNew, loadOverride, maxConcurrentLoads, loadTimeout }?: {
        forceNew: boolean;
        loadOverride: (null | ((arg0: string) => Promise<{
            success: boolean;
            content: string;
            errorDescription: Host.ResourceLoader.LoadErrorDescription;
        }>));
        maxConcurrentLoads: number;
        loadTimeout: number;
    }): PageResourceLoader;
    _onMainFrameNavigated(event: any): void;
    getResourcesLoaded(): Map<string, PageResource>;
    /**
     * Loading is the number of currently loading and queued items. Resources is the total number of resources,
     * including loading and queued resources, but not including resources that are still loading but scheduled
     * for cancelation.;
     */
    getNumberOfResources(): {
        loading: number;
        queued: number;
        resources: number;
    };
    _acquireLoadSlot(): Promise<void>;
    _releaseLoadSlot(): void;
    static _withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T>;
    static makeKey(url: string, initiator: PageResourceLoadInitiator): string;
    loadResource(url: string, initiator: PageResourceLoadInitiator): Promise<{
        content: string;
    }>;
    _dispatchLoad(url: string, initiator: PageResourceLoadInitiator): Promise<{
        success: boolean;
        content: string;
        errorDescription: Host.ResourceLoader.LoadErrorDescription;
    }>;
    _getDeveloperResourceScheme(parsedURL: Common.ParsedURL.ParsedURL | null): Host.UserMetrics.DeveloperResourceScheme;
    _loadFromTarget(target: Target, frameId: string | null, url: string): Promise<{
        success: boolean;
        content: string;
        errorDescription: {
            statusCode: number;
            netError: number | undefined;
            netErrorName: string | undefined;
            message: string;
            urlValid: undefined;
        };
    }>;
}
export declare function getLoadThroughTargetSetting(): Common.Settings.Setting<boolean>;
export declare enum Events {
    Update = "Update"
}
