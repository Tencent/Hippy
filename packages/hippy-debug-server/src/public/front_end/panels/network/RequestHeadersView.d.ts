import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { UIHeaderSection } from './NetworkSearchScope.js';
export declare class RequestHeadersView extends UI.Widget.VBox {
    _request: SDK.NetworkRequest.NetworkRequest;
    _decodeRequestParameters: boolean;
    _showRequestHeadersText: boolean;
    _showResponseHeadersText: boolean;
    _highlightedElement: UI.TreeOutline.TreeElement | null;
    _root: Category;
    _urlItem: UI.TreeOutline.TreeElement;
    _requestMethodItem: UI.TreeOutline.TreeElement;
    _statusCodeItem: UI.TreeOutline.TreeElement;
    _remoteAddressItem: UI.TreeOutline.TreeElement;
    _referrerPolicyItem: UI.TreeOutline.TreeElement;
    _responseHeadersCategory: Category;
    _requestHeadersCategory: Category;
    _queryStringCategory: Category;
    _formDataCategory: Category;
    _requestPayloadCategory: Category;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    wasShown(): void;
    willHide(): void;
    _addEntryContextMenuHandler(treeElement: UI.TreeOutline.TreeElement, value: string): void;
    _formatHeader(name: string, value: string): DocumentFragment;
    _formatHeaderObject(header: BlockedReasonDetailDescriptor): DocumentFragment;
    _formatParameter(value: string, className: string, decodeParameters: boolean): Element;
    _refreshURL(): void;
    _refreshQueryString(): void;
    _refreshFormData(): Promise<void>;
    _populateTreeElementWithSourceText(treeElement: UI.TreeOutline.TreeElement, sourceText: string | null): void;
    _refreshParams(title: string, params: SDK.NetworkRequest.NameValue[] | null, sourceText: string | null, paramsTreeElement: UI.TreeOutline.TreeElement): void;
    _appendParamsSource(title: string, params: SDK.NetworkRequest.NameValue[] | null, sourceText: string | null, paramsTreeElement: UI.TreeOutline.TreeElement): void;
    _appendParamsParsed(title: string, params: SDK.NetworkRequest.NameValue[] | null, sourceText: string | null, paramsTreeElement: UI.TreeOutline.TreeElement): void;
    _refreshRequestJSONPayload(parsedObject: any, sourceText: string): void;
    _appendJSONPayloadSource(rootListItem: Category, parsedObject: any, sourceText: string): void;
    _appendJSONPayloadParsed(rootListItem: Category, parsedObject: any, sourceText: string): void;
    _createViewSourceToggle(viewSource: boolean, handler: (arg0: Event) => void): Element;
    _toggleURLDecoding(event: Event): void;
    _refreshRequestHeaders(): void;
    _refreshResponseHeaders(): void;
    _refreshHTTPInformation(): void;
    _refreshHeadersTitle(title: string, headersTreeElement: UI.TreeOutline.TreeElement, headersLength: number): void;
    _refreshHeaders(title: string, headers: SDK.NetworkRequest.NameValue[], headersTreeElement: UI.TreeOutline.TreeElement, provisionalHeaders?: boolean, blockedResponseCookies?: SDK.NetworkRequest.BlockedSetCookieWithReason[]): void;
    _refreshHeadersText(title: string, count: number, headersText: string, headersTreeElement: UI.TreeOutline.TreeElement): void;
    _refreshRemoteAddress(): void;
    _refreshReferrerPolicy(): void;
    _toggleRequestHeadersText(event: Event): void;
    _toggleResponseHeadersText(event: Event): void;
    _createToggleButton(title: string): Element;
    _createHeadersToggleButton(isHeadersTextShown: boolean): Element;
    _clearHighlight(): void;
    _revealAndHighlight(category: UI.TreeOutline.TreeElement | null, name?: string): void;
    private getCategoryForSection;
    revealHeader(section: UIHeaderSection, header?: string): void;
}
export declare class Category extends UI.TreeOutline.TreeElement {
    toggleOnClick: boolean;
    _expandedSetting: Common.Settings.Setting<boolean>;
    expanded: boolean;
    constructor(root: UI.TreeOutline.TreeOutline, name: string, title?: string);
    createLeaf(): UI.TreeOutline.TreeElement;
    onexpand(): void;
    oncollapse(): void;
}
interface BlockedReasonDetailDescriptor {
    name: string;
    value: Object | null;
    headerValueIncorrect: boolean | null;
    details: {
        explanation: () => string;
        examples: Array<{
            codeSnippet: string;
            comment?: (() => string);
        }>;
        link: {
            url: string;
        } | null;
    };
    headerNotSet: boolean | null;
}
export {};
