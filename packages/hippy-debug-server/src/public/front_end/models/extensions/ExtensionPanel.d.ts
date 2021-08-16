import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { ExtensionServer } from './ExtensionServer.js';
import { ExtensionNotifierView, ExtensionView } from './ExtensionView.js';
export declare class ExtensionPanel extends UI.Panel.Panel implements UI.SearchableView.Searchable {
    _server: ExtensionServer;
    _id: string;
    _panelToolbar: UI.Toolbar.Toolbar;
    _searchableView: UI.SearchableView.SearchableView;
    constructor(server: ExtensionServer, panelName: string, id: string, pageURL: string);
    addToolbarItem(item: UI.Toolbar.ToolbarItem): void;
    searchCanceled(): void;
    searchableView(): UI.SearchableView.SearchableView;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, _shouldJump: boolean, _jumpBackwards?: boolean): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
}
export declare class ExtensionButton {
    _id: string;
    _toolbarButton: UI.Toolbar.ToolbarButton;
    constructor(server: ExtensionServer, id: string, iconURL: string, tooltip?: string, disabled?: boolean);
    update(iconURL: string, tooltip?: string, disabled?: boolean): void;
    toolbarButton(): UI.Toolbar.ToolbarButton;
}
export declare class ExtensionSidebarPane extends UI.View.SimpleView {
    _panelName: string;
    _server: ExtensionServer;
    _id: string;
    _extensionView?: ExtensionView;
    _objectPropertiesView?: ExtensionNotifierView;
    constructor(server: ExtensionServer, panelName: string, title: string, id: string);
    id(): string;
    panelName(): string;
    setObject(object: Object, title: string, callback: (arg0?: (string | null) | undefined) => void): void;
    setExpression(expression: string, title: string, evaluateOptions: Object, securityOrigin: string, callback: (arg0?: (string | null) | undefined) => void): void;
    setPage(url: string): void;
    setHeight(height: string): void;
    _onEvaluate(title: string, callback: (arg0?: (string | null) | undefined) => void, error: string | null, result: SDK.RemoteObject.RemoteObject | null, _wasThrown?: boolean): void;
    _createObjectPropertiesView(): void;
    _setObject(object: SDK.RemoteObject.RemoteObject, title: string, callback: (arg0?: (string | null) | undefined) => void): void;
}
