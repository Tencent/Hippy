import type * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import type * as TextUtils from '../../models/text_utils/text_utils.js';
import type * as Search from '../search/search.js';
export declare class NetworkSearchScope implements Search.SearchConfig.SearchScope {
    performIndexing(progress: Common.Progress.Progress): void;
    performSearch(searchConfig: Search.SearchConfig.SearchConfig, progress: Common.Progress.Progress, searchResultCallback: (arg0: Search.SearchConfig.SearchResult) => void, searchFinishedCallback: (arg0: boolean) => void): Promise<void>;
    _searchRequest(searchConfig: Search.SearchConfig.SearchConfig, request: SDK.NetworkRequest.NetworkRequest, progress: Common.Progress.Progress): Promise<NetworkSearchResult | null>;
    stopSearch(): void;
}
export declare enum UIHeaderSection {
    General = "General",
    Request = "Request",
    Response = "Response"
}
interface UIHeaderLocation {
    section: UIHeaderSection;
    header: SDK.NetworkRequest.NameValue | null;
}
export declare class UIRequestLocation {
    request: SDK.NetworkRequest.NetworkRequest;
    header: UIHeaderLocation | null;
    searchMatch: TextUtils.ContentProvider.SearchMatch | null;
    isUrlMatch: boolean;
    private constructor();
    static requestHeaderMatch(request: SDK.NetworkRequest.NetworkRequest, header: SDK.NetworkRequest.NameValue | null): UIRequestLocation;
    static responseHeaderMatch(request: SDK.NetworkRequest.NetworkRequest, header: SDK.NetworkRequest.NameValue | null): UIRequestLocation;
    static bodyMatch(request: SDK.NetworkRequest.NetworkRequest, searchMatch: TextUtils.ContentProvider.SearchMatch | null): UIRequestLocation;
    static urlMatch(request: SDK.NetworkRequest.NetworkRequest): UIRequestLocation;
    static header(request: SDK.NetworkRequest.NetworkRequest, section: UIHeaderSection, name: string): UIRequestLocation;
}
export declare class NetworkSearchResult implements Search.SearchConfig.SearchResult {
    _request: SDK.NetworkRequest.NetworkRequest;
    _locations: UIRequestLocation[];
    constructor(request: SDK.NetworkRequest.NetworkRequest, locations: UIRequestLocation[]);
    matchesCount(): number;
    label(): string;
    description(): string;
    matchLineContent(index: number): string;
    matchRevealable(index: number): Object;
    matchLabel(index: number): string;
}
export {};
