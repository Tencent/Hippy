import * as SDK from '../../core/sdk/sdk.js';
import * as Logs from '../../models/logs/logs.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class RequestInitiatorView extends UI.Widget.VBox {
    _linkifier: Components.Linkifier.Linkifier;
    _request: SDK.NetworkRequest.NetworkRequest;
    _emptyWidget: UI.EmptyWidget.EmptyWidget;
    _hasShown: boolean;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    static createStackTracePreview(request: SDK.NetworkRequest.NetworkRequest, linkifier: Components.Linkifier.Linkifier, focusableLink?: boolean): {
        element: Element;
        links: Array<Element>;
    } | null;
    _createTree(): UI.TreeOutline.TreeOutlineInShadow;
    _buildRequestChainTree(initiatorGraph: Logs.NetworkLog.InitiatorGraph, title: string, tree: UI.TreeOutline.TreeOutlineInShadow): UI.TreeOutline.TreeElement;
    _depthFirstSearchTreeBuilder(initiated: Map<SDK.NetworkRequest.NetworkRequest, SDK.NetworkRequest.NetworkRequest>, parentElement: UI.TreeOutline.TreeElement, parentRequest: SDK.NetworkRequest.NetworkRequest): void;
    _buildStackTraceSection(content: Element, title: string, tree: UI.TreeOutline.TreeOutlineInShadow): void;
    wasShown(): void;
}
