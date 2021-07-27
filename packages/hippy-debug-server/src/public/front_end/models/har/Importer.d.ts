import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type { HAREntry, HARLog, HARPage, HARTimings } from './HARFormat.js';
export declare class Importer {
    static requestsFromHARLog(log: HARLog): SDK.NetworkRequest.NetworkRequest[];
    static _buildPageLoad(page: HARPage, mainRequest: SDK.NetworkRequest.NetworkRequest): SDK.PageLoad.PageLoad;
    static _fillRequestFromHAREntry(request: SDK.NetworkRequest.NetworkRequest, entry: HAREntry, pageLoad: SDK.PageLoad.PageLoad | undefined): void;
    static _getResourceType(request: SDK.NetworkRequest.NetworkRequest, entry: HAREntry, pageLoad: SDK.PageLoad.PageLoad | undefined): Common.ResourceType.ResourceType;
    static _setupTiming(request: SDK.NetworkRequest.NetworkRequest, issueTime: number, entryTotalDuration: number, timings: HARTimings): void;
}
