import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class CallStackSidebarPane extends UI.View.SimpleView implements UI.ContextFlavorListener.ContextFlavorListener, UI.ListControl.ListDelegate<Item> {
    _ignoreListMessageElement: Element;
    _notPausedMessageElement: HTMLElement;
    _items: UI.ListModel.ListModel<Item>;
    _list: UI.ListControl.ListControl<Item>;
    _showMoreMessageElement: Element;
    _showIgnoreListed: boolean;
    _locationPool: Bindings.LiveLocation.LiveLocationPool;
    _updateThrottler: Common.Throttler.Throttler;
    _maxAsyncStackChainDepth: number;
    _updateItemThrottler: Common.Throttler.Throttler;
    _scheduledForUpdateItems: Set<Item>;
    _muteActivateItem?: boolean;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): CallStackSidebarPane;
    flavorChanged(_object: Object | null): void;
    _update(): void;
    _doUpdate(): Promise<void>;
    _updatedForTest(): void;
    _refreshItem(item: Item): void;
    createElementForItem(item: Item): Element;
    heightForItem(_item: Item): number;
    isItemSelectable(_item: Item): boolean;
    selectedItemChanged(_from: Item | null, _to: Item | null, fromElement: HTMLElement | null, toElement: HTMLElement | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    _createIgnoreListMessageElement(): Element;
    _createShowMoreMessageElement(): Element;
    _onContextMenu(event: Event): void;
    _onClick(event: Event): void;
    _activateItem(item: Item): void;
    activeCallFrameItem(): Item | null;
    appendIgnoreListURLContextMenuItems(contextMenu: UI.ContextMenu.ContextMenu, uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _selectNextCallFrameOnStack(): void;
    _selectPreviousCallFrameOnStack(): void;
    _copyStackTrace(): void;
}
export declare const elementSymbol: unique symbol;
export declare const defaultMaxAsyncStackChainDepth = 32;
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class Item {
    isIgnoreListed: boolean;
    title: string;
    linkText: string;
    uiLocation: Workspace.UISourceCode.UILocation | null;
    isAsyncHeader: boolean;
    updateDelegate: (arg0: Item) => void;
    static createForDebuggerCallFrame(frame: SDK.DebuggerModel.CallFrame, locationPool: Bindings.LiveLocation.LiveLocationPool, updateDelegate: (arg0: Item) => void): Promise<Item>;
    static createItemsForAsyncStack(title: string, debuggerModel: SDK.DebuggerModel.DebuggerModel | null, frames: Protocol.Runtime.CallFrame[], locationPool: Bindings.LiveLocation.LiveLocationPool, updateDelegate: (arg0: Item) => void): Promise<Item[]>;
    constructor(title: string, updateDelegate: (arg0: Item) => void);
    _update(liveLocation: Bindings.LiveLocation.LiveLocation): Promise<void>;
}
