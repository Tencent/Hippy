import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class SignedExchangeInfoView extends UI.Widget.VBox {
    _responseHeadersItem?: UI.TreeOutline.TreeElement;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    _formatHeader(name: string, value: string, highlighted?: boolean): DocumentFragment;
    _formatHeaderForHexData(name: string, value: string, highlighted?: boolean): DocumentFragment;
}
export declare class Category extends UI.TreeOutline.TreeElement {
    toggleOnClick: boolean;
    expanded: boolean;
    constructor(root: UI.TreeOutline.TreeOutline, title?: string | Node);
    createLeaf(title?: string | Node): UI.TreeOutline.TreeElement;
}
