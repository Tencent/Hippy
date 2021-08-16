import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class RequestResponseView extends UI.Widget.VBox {
    request: SDK.NetworkRequest.NetworkRequest;
    _contentViewPromise: Promise<UI.Widget.Widget> | null;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    static _hasTextContent(request: SDK.NetworkRequest.NetworkRequest, contentData: SDK.NetworkRequest.ContentData): boolean;
    static sourceViewForRequest(request: SDK.NetworkRequest.NetworkRequest): Promise<UI.Widget.Widget | null>;
    wasShown(): void;
    _doShowPreview(): Promise<UI.Widget.Widget>;
    showPreview(): Promise<UI.Widget.Widget>;
    createPreview(): Promise<UI.Widget.Widget>;
    revealLine(line: number): Promise<void>;
}
