import * as SDK from '../../core/sdk/sdk.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ScopeChainSidebarPane extends UI.Widget.VBox implements UI.ContextFlavorListener.ContextFlavorListener {
    _treeOutline: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeOutline;
    _expandController: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController;
    _linkifier: Components.Linkifier.Linkifier;
    _infoElement: HTMLDivElement;
    private constructor();
    static instance(): ScopeChainSidebarPane;
    flavorChanged(_object: Object | null): void;
    focus(): void;
    _update(): Promise<void>;
    _createScopeSectionTreeElement(scope: SDK.DebuggerModel.ScopeChainEntry, extraProperties: SDK.RemoteObject.RemoteObjectProperty[]): ObjectUI.ObjectPropertiesSection.RootElement;
    _extraPropertiesForScope(scope: SDK.DebuggerModel.ScopeChainEntry, details: SDK.DebuggerModel.DebuggerPausedDetails, callFrame: SDK.DebuggerModel.CallFrame, thisObject: SDK.RemoteObject.RemoteObject | null, isFirstScope: boolean): SDK.RemoteObject.RemoteObjectProperty[];
    _sidebarPaneUpdatedForTest(): void;
}
export declare class OpenLinearMemoryInspector extends UI.Widget.VBox implements UI.ContextMenu.Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): OpenLinearMemoryInspector;
    _isMemoryObjectProperty(obj: SDK.RemoteObject.RemoteObject): boolean;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    _openMemoryInspector(obj: SDK.RemoteObject.RemoteObject): Promise<void>;
}
