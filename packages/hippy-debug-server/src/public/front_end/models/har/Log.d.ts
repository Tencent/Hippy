import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class Log {
    static pseudoWallTime(request: SDK.NetworkRequest.NetworkRequest, monotonicTime: number): Date;
    static build(requests: SDK.NetworkRequest.NetworkRequest[]): Promise<LogDTO>;
    _creator(): Creator;
    _buildPages(requests: SDK.NetworkRequest.NetworkRequest[]): Page[];
    _convertPage(page: SDK.PageLoad.PageLoad, request: SDK.NetworkRequest.NetworkRequest): Page;
    _pageEventTime(page: SDK.PageLoad.PageLoad, time: number): number;
}
export declare class Entry {
    _request: SDK.NetworkRequest.NetworkRequest;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    static _toMilliseconds(time: number): number;
    static build(request: SDK.NetworkRequest.NetworkRequest): Promise<EntryDTO>;
    _buildRequest(): Promise<Request>;
    _buildResponse(): Response;
    _buildContent(): Content;
    _buildTimings(): Timing;
    _buildPostData(): Promise<PostData | null>;
    _buildParameters(parameters: Parameter[]): Parameter[];
    _buildRequestURL(url: string): string;
    _buildCookies(cookies: SDK.Cookie.Cookie[]): CookieDTO[];
    _buildCookie(cookie: SDK.Cookie.Cookie): CookieDTO;
    _requestBodySize(): Promise<number>;
    get responseBodySize(): number;
    get responseCompression(): number | undefined;
}
export interface Timing {
    blocked: number;
    dns: number;
    ssl: number;
    connect: number;
    send: number;
    wait: number;
    receive: number;
    _blocked_queueing: number;
    _blocked_proxy?: number;
}
export interface Parameter {
    name: string;
    value: string;
}
export interface Content {
    size: number;
    mimeType: string;
    compression?: number;
    text?: string;
    encoding?: string;
}
export interface Request {
    method: string;
    url: string;
    httpVersion: string;
    headers: Object;
    queryString: Parameter[];
    cookies: CookieDTO[];
    headersSize: number;
    bodySize: number;
    postData?: PostData;
}
export interface Response {
    status: number;
    statusText: string;
    httpVersion: string;
    headers: Object;
    cookies: CookieDTO[];
    content: Content;
    redirectURL: string;
    headersSize: number;
    bodySize: number;
    _transferSize: number;
    _error: string | null;
}
export interface EntryDTO {
    _fromCache?: string;
    _initiator: Protocol.Network.Initiator | null;
    _priority: Protocol.Network.ResourcePriority | null;
    _resourceType: string;
    _webSocketMessages?: Object[];
    cache: Object;
    connection?: string;
    pageref?: string;
    request: Request;
    response: Response;
    serverIPAddress: string;
    startedDateTime: string | Object;
    time: number;
    timings: Timing;
}
export interface PostData {
    mimeType: string;
    params?: Parameter[];
    text: string;
}
export interface CookieDTO {
    name: string;
    value: string;
    path: string;
    domain: string;
    expires: Date | null;
    httpOnly: boolean;
    secure: boolean;
    sameSite?: Protocol.Network.CookieSameSite;
}
export interface Page {
    startedDateTime: string | Object;
    id: string;
    title: string;
    pageTimings: {
        onContentLoad: number;
        onLoad: number;
    };
}
export interface Creator {
    version: string;
    name: string;
}
export interface LogDTO {
    version: string;
    creator: Creator;
    pages: Page[];
    entries: EntryDTO[];
}
