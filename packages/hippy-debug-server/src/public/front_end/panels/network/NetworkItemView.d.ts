import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { UIHeaderSection } from './NetworkSearchScope.js';
import type { NetworkTimeCalculator } from './NetworkTimeCalculator.js';
import { RequestCookiesView } from './RequestCookiesView.js';
import { RequestHeadersView } from './RequestHeadersView.js';
import { RequestResponseView } from './RequestResponseView.js';
export declare class NetworkItemView extends UI.TabbedPane.TabbedPane {
    _request: SDK.NetworkRequest.NetworkRequest;
    _resourceViewTabSetting: Common.Settings.Setting<Tabs>;
    _headersView: RequestHeadersView;
    _responseView: RequestResponseView | undefined;
    _cookiesView: RequestCookiesView | null;
    _initialTab?: Tabs;
    constructor(request: SDK.NetworkRequest.NetworkRequest, calculator: NetworkTimeCalculator, initialTab?: Tabs);
    wasShown(): void;
    willHide(): void;
    _maybeAppendCookiesPanel(): void;
    _maybeShowErrorIconInTrustTokenTabHeader(): void;
    _selectTab(tabId: string): void;
    _tabSelected(event: {
        data: any;
    }): void;
    request(): SDK.NetworkRequest.NetworkRequest;
    revealResponseBody(line?: number): Promise<void>;
    revealHeader(section: UIHeaderSection, header: string | undefined): void;
}
export declare enum Tabs {
    Cookies = "cookies",
    EventSource = "eventSource",
    Headers = "headers",
    Initiator = "initiator",
    Preview = "preview",
    Response = "response",
    Timing = "timing",
    TrustTokens = "trustTokens",
    WsFrames = "webSocketFrames"
}
