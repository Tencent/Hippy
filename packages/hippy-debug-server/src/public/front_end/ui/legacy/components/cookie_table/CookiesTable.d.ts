import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
import * as DataGrid from '../data_grid/data_grid.js';
export declare class CookiesTable extends UI.Widget.VBox {
    _saveCallback?: ((arg0: SDK.Cookie.Cookie, arg1: SDK.Cookie.Cookie | null) => Promise<boolean>);
    _refreshCallback?: (() => void) | undefined;
    _deleteCallback?: ((arg0: SDK.Cookie.Cookie, arg1: () => void) => void);
    _dataGrid: DataGrid.DataGrid.DataGridImpl<DataGridNode>;
    _lastEditedColumnId: string | null;
    _data: {
        folderName: string | null;
        cookies: Array<SDK.Cookie.Cookie> | null;
    }[];
    _cookieDomain: string;
    _cookieToBlockedReasons: Map<SDK.Cookie.Cookie, SDK.CookieModel.BlockedReason[]> | null;
    constructor(renderInline?: boolean, saveCallback?: ((arg0: SDK.Cookie.Cookie, arg1: SDK.Cookie.Cookie | null) => Promise<boolean>), refreshCallback?: (() => void), selectedCallback?: (() => void), deleteCallback?: ((arg0: SDK.Cookie.Cookie, arg1: () => void) => void));
    setCookies(cookies: SDK.Cookie.Cookie[], cookieToBlockedReasons?: Map<SDK.Cookie.Cookie, SDK.CookieModel.BlockedReason[]>): void;
    setCookieFolders(cookieFolders: {
        folderName: string | null;
        cookies: Array<SDK.Cookie.Cookie> | null;
    }[], cookieToBlockedReasons?: Map<SDK.Cookie.Cookie, SDK.CookieModel.BlockedReason[]>): void;
    setCookieDomain(cookieDomain: string): void;
    selectedCookie(): SDK.Cookie.Cookie | null;
    _getSelectionCookies(): {
        current: SDK.Cookie.Cookie | null;
        neighbor: SDK.Cookie.Cookie | null;
    };
    willHide(): void;
    _findSelectedCookie(selectionCookies: {
        current: SDK.Cookie.Cookie | null;
        neighbor: SDK.Cookie.Cookie | null;
    }, cookies: SDK.Cookie.Cookie[] | null): SDK.Cookie.Cookie | null;
    _isSameCookie(cookieA: SDK.Cookie.Cookie, cookieB: SDK.Cookie.Cookie | null | undefined): boolean;
    _rebuildTable(): void;
    _populateNode(parentNode: DataGrid.DataGrid.DataGridNode<DataGridNode>, cookies: SDK.Cookie.Cookie[] | null, selectedCookie: SDK.Cookie.Cookie | null, lastEditedColumnId: string | null): void;
    _addInactiveNode(parentNode: DataGrid.DataGrid.DataGridNode<DataGridNode>, cookie: SDK.Cookie.Cookie, editedColumnId: string | null): void;
    _totalSize(cookies: SDK.Cookie.Cookie[] | null): number;
    _sortCookies(cookies: SDK.Cookie.Cookie[]): void;
    _createGridNode(cookie: SDK.Cookie.Cookie): DataGridNode;
    _onDeleteCookie(node: DataGridNode): void;
    _onUpdateCookie(editingNode: DataGridNode, columnIdentifier: string, _oldText: string, _newText: string): void;
    _setDefaults(node: DataGridNode): void;
    _saveNode(node: DataGridNode): void;
    _createCookieFromData(data: {
        [x: string]: string;
    }): SDK.Cookie.Cookie;
    _isValidCookieData(data: {
        [x: string]: string;
    }): boolean;
    _isValidDomain(domain: string): boolean;
    _isValidPath(path: string): boolean;
    _isValidDate(date: string): boolean;
    _refresh(): void;
    _populateContextMenu(contextMenu: UI.ContextMenu.ContextMenu, gridNode: DataGrid.DataGrid.DataGridNode<DataGridNode>): void;
}
export declare class DataGridNode extends DataGrid.DataGrid.DataGridNode<DataGridNode> {
    cookie: SDK.Cookie.Cookie;
    _blockedReasons: SDK.CookieModel.BlockedReason[] | null;
    constructor(data: {
        [x: string]: string | number | boolean;
    }, cookie: SDK.Cookie.Cookie, blockedReasons: SDK.CookieModel.BlockedReason[] | null);
    createCells(element: Element): void;
    createCell(columnId: string): HTMLElement;
}
