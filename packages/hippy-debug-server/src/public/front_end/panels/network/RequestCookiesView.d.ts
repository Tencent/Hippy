import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as CookieTable from '../../ui/legacy/components/cookie_table/cookie_table.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class RequestCookiesView extends UI.Widget.Widget {
    _request: SDK.NetworkRequest.NetworkRequest;
    _showFilteredOutCookiesSetting: Common.Settings.Setting<boolean>;
    _emptyWidget: UI.EmptyWidget.EmptyWidget;
    _requestCookiesTitle: HTMLElement;
    _requestCookiesEmpty: HTMLElement;
    _requestCookiesTable: CookieTable.CookiesTable.CookiesTable;
    _responseCookiesTitle: HTMLElement;
    _responseCookiesTable: CookieTable.CookiesTable.CookiesTable;
    _malformedResponseCookiesTitle: HTMLElement;
    _malformedResponseCookiesList: HTMLElement;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    _getRequestCookies(): {
        requestCookies: Array<SDK.Cookie.Cookie>;
        requestCookieToBlockedReasons: Map<SDK.Cookie.Cookie, SDK.CookieModel.BlockedReason[]>;
    };
    _getResponseCookies(): {
        responseCookies: Array<SDK.Cookie.Cookie>;
        responseCookieToBlockedReasons: Map<SDK.Cookie.Cookie, Array<SDK.CookieModel.BlockedReason>>;
        malformedResponseCookies: Array<SDK.NetworkRequest.BlockedSetCookieWithReason>;
    };
    _refreshRequestCookiesView(): void;
    wasShown(): void;
    willHide(): void;
}
