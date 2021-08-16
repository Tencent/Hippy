import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { RequestResponseView } from './RequestResponseView.js';
export declare class RequestPreviewView extends RequestResponseView {
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    showPreview(): Promise<UI.Widget.Widget>;
    _htmlPreview(): Promise<UI.Widget.Widget | null>;
    createPreview(): Promise<UI.Widget.Widget>;
}
