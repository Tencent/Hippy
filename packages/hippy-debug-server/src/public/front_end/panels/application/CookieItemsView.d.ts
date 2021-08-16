import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as CookieTable from '../../ui/legacy/components/cookie_table/cookie_table.js';
import * as UI from '../../ui/legacy/legacy.js';
import { StorageItemsView } from './StorageItemsView.js';
declare class CookiePreviewWidget extends UI.Widget.VBox {
    _cookie: SDK.Cookie.Cookie | null;
    _showDecodedSetting: Common.Settings.Setting<boolean>;
    _toggle: UI.UIUtils.CheckboxLabel;
    _value: HTMLDivElement;
    constructor();
    showDecoded(decoded: boolean): void;
    _updatePreview(): void;
    setCookie(cookie: SDK.Cookie.Cookie): void;
    /**
     * Select all text even if there a spaces in it
     */
    handleDblClickOnCookieValue(event: Event): void;
}
export declare class CookieItemsView extends StorageItemsView {
    _model: SDK.CookieModel.CookieModel;
    _cookieDomain: string;
    _totalSize: number;
    _cookiesTable: CookieTable.CookiesTable.CookiesTable;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _previewPanel: UI.Widget.VBox;
    _previewWidget: CookiePreviewWidget;
    _emptyWidget: UI.EmptyWidget.EmptyWidget;
    _onlyIssuesFilterUI: UI.Toolbar.ToolbarCheckbox;
    _refreshThrottler: Common.Throttler.Throttler;
    _eventDescriptors: Common.EventTarget.EventDescriptor[];
    _allCookies: SDK.Cookie.Cookie[];
    _shownCookies: SDK.Cookie.Cookie[];
    _selectedCookie: SDK.Cookie.Cookie | null;
    constructor(model: SDK.CookieModel.CookieModel, cookieDomain: string);
    setCookiesDomain(model: SDK.CookieModel.CookieModel, domain: string): void;
    _showPreview(cookie: SDK.Cookie.Cookie | null): void;
    _handleCookieSelected(): void;
    _saveCookie(newCookie: SDK.Cookie.Cookie, oldCookie: SDK.Cookie.Cookie | null): Promise<boolean>;
    _deleteCookie(cookie: SDK.Cookie.Cookie, callback: () => void): void;
    _updateWithCookies(allCookies: SDK.Cookie.Cookie[]): void;
    filter<T>(items: T[], keyFunction: (arg0: T) => string): T[];
    /**
     * This will only delete the currently visible cookies.
     */
    deleteAllItems(): void;
    deleteSelectedItem(): void;
    refreshItems(): void;
    refreshItemsThrottled(): void;
    _onResponseReceived(): void;
    _onLoadingFinished(): void;
}
export {};
