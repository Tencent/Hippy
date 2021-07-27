import type { NetworkRequest } from './NetworkRequest.js';
export declare class PageLoad {
    id: number;
    url: string;
    startTime: number;
    loadTime: number;
    contentLoadTime: number;
    mainRequest: NetworkRequest;
    constructor(mainRequest: NetworkRequest);
    static forRequest(request: NetworkRequest): PageLoad | null;
    bindRequest(request: NetworkRequest): void;
    private static lastIdentifier;
}
