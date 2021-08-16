declare class HARBase {
    _custom: Map<string, any>;
    constructor(data: any);
    static _safeDate(data: any): Date;
    static _safeNumber(data: any): number;
    static _optionalNumber(data: any): number | undefined;
    static _optionalString(data: any): string | undefined;
    customAsString(name: string): string | undefined;
    customAsNumber(name: string): number | undefined;
    customAsArray(name: string): any[] | undefined;
    customInitiator(): HARInitiator | undefined;
}
export declare class HARRoot extends HARBase {
    log: HARLog;
    constructor(data: any);
}
export declare class HARLog extends HARBase {
    version: string;
    creator: HARCreator;
    browser: HARCreator | undefined;
    pages: HARPage[];
    entries: HAREntry[];
    comment: string | undefined;
    constructor(data: any);
}
declare class HARCreator extends HARBase {
    name: string;
    version: string;
    comment: string | undefined;
    constructor(data: any);
}
export declare class HARPage extends HARBase {
    startedDateTime: Date;
    id: string;
    title: string;
    pageTimings: HARPageTimings;
    comment: string | undefined;
    constructor(data: any);
}
declare class HARPageTimings extends HARBase {
    onContentLoad: number | undefined;
    onLoad: number | undefined;
    comment: string | undefined;
    constructor(data: any);
}
export declare class HAREntry extends HARBase {
    pageref: string | undefined;
    startedDateTime: Date;
    time: number;
    request: HARRequest;
    response: HARResponse;
    cache: {};
    timings: HARTimings;
    serverIPAddress: string | undefined;
    connection: string | undefined;
    comment: string | undefined;
    constructor(data: any);
    _importInitiator(initiator: any): HARInitiator | undefined;
    _importWebSocketMessages(inputMessages: any): HARWebSocketMessage[] | undefined;
}
declare class HARRequest extends HARBase {
    method: string;
    url: string;
    httpVersion: string;
    cookies: HARCookie[];
    headers: HARHeader[];
    queryString: HARQueryString[];
    postData: HARPostData | undefined;
    headersSize: number;
    bodySize: number;
    comment: string | undefined;
    constructor(data: any);
}
declare class HARResponse extends HARBase {
    status: number;
    statusText: string;
    httpVersion: string;
    cookies: HARCookie[];
    headers: HARHeader[];
    content: HARContent;
    redirectURL: string;
    headersSize: number;
    bodySize: number;
    comment: string | undefined;
    constructor(data: any);
}
declare class HARCookie extends HARBase {
    name: string;
    value: string;
    path: string | undefined;
    domain: string | undefined;
    expires: Date | undefined;
    httpOnly: boolean | undefined;
    secure: boolean | undefined;
    comment: string | undefined;
    constructor(data: any);
}
declare class HARHeader extends HARBase {
    name: string;
    value: string;
    comment: string | undefined;
    constructor(data: any);
}
declare class HARQueryString extends HARBase {
    name: string;
    value: string;
    comment: string | undefined;
    constructor(data: any);
}
declare class HARPostData extends HARBase {
    mimeType: string;
    params: HARParam[];
    text: string;
    comment: string | undefined;
    constructor(data: any);
}
export declare class HARParam extends HARBase {
    name: string;
    value: string | undefined;
    fileName: string | undefined;
    contentType: string | undefined;
    comment: string | undefined;
    constructor(data: any);
}
declare class HARContent extends HARBase {
    size: number;
    compression: number | undefined;
    mimeType: string;
    text: string | undefined;
    encoding: string | undefined;
    comment: string | undefined;
    constructor(data: any);
}
export declare class HARTimings extends HARBase {
    blocked: number | undefined;
    dns: number | undefined;
    connect: number | undefined;
    send: number;
    wait: number;
    receive: number;
    ssl: number | undefined;
    comment: string | undefined;
    constructor(data: any);
}
export declare class HARInitiator extends HARBase {
    type: string | undefined;
    url: string | undefined;
    lineNumber: number | undefined;
    /**
     * Based on Initiator defined in browser_protocol.pdl
     */
    constructor(data: any);
}
declare class HARWebSocketMessage extends HARBase {
    time: number | undefined;
    opcode: number | undefined;
    data: string | undefined;
    type: string | undefined;
    constructor(data: any);
}
export {};
