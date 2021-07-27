import * as SDK from '../../core/sdk/sdk.js';
import * as puppeteer from '../../third_party/puppeteer/puppeteer.js';
export declare class Transport implements puppeteer.ConnectionTransport {
    private connection;
    private knownIds;
    private knownTargets;
    constructor(connection: SDK.Connections.ParallelConnection);
    send(data: string): void;
    close(): void;
    set onmessage(cb: (message: string) => void);
    set onclose(cb: () => void);
}
export declare function getPuppeteerConnection(): Promise<{
    page: puppeteer.Page | null;
    connection: SDK.Connections.ParallelConnection;
    browser: puppeteer.Browser;
}>;
