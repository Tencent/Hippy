import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare let blockedURLsPaneInstance: BlockedURLsPane | null;
export declare class BlockedURLsPane extends UI.Widget.VBox implements UI.ListWidget.Delegate<SDK.NetworkManager.BlockedPattern> {
    _manager: SDK.NetworkManager.MultitargetNetworkManager;
    _toolbar: UI.Toolbar.Toolbar;
    _enabledCheckbox: UI.Toolbar.ToolbarCheckbox;
    _list: UI.ListWidget.ListWidget<SDK.NetworkManager.BlockedPattern>;
    _editor: UI.ListWidget.Editor<SDK.NetworkManager.BlockedPattern> | null;
    _blockedCountForUrl: Map<string, number>;
    _updateThrottler: Common.Throttler.Throttler;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): BlockedURLsPane;
    _createEmptyPlaceholder(): Element;
    static reset(): void;
    _addButtonClicked(): void;
    renderItem(pattern: SDK.NetworkManager.BlockedPattern, _editable: boolean): Element;
    _togglePattern(pattern: SDK.NetworkManager.BlockedPattern, event: Event): void;
    _toggleEnabled(): void;
    removeItemRequested(pattern: SDK.NetworkManager.BlockedPattern, index: number): void;
    beginEdit(pattern: SDK.NetworkManager.BlockedPattern): UI.ListWidget.Editor<SDK.NetworkManager.BlockedPattern>;
    commitEdit(item: SDK.NetworkManager.BlockedPattern, editor: UI.ListWidget.Editor<SDK.NetworkManager.BlockedPattern>, isNew: boolean): void;
    _createEditor(): UI.ListWidget.Editor<SDK.NetworkManager.BlockedPattern>;
    _removeAll(): void;
    _update(): Promise<void>;
    _blockedRequestsCount(url: string): number;
    _matches(pattern: string, url: string): boolean;
    reset(): void;
    _onRequestFinished(event: Common.EventTarget.EventTargetEvent): void;
}
