import type * as Common from '../../core/common/common.js';
import * as EventListeners from '../event_listeners/event_listeners.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ObjectEventListenersSidebarPane extends UI.Widget.VBox implements UI.Toolbar.ItemsProvider {
    _refreshButton: UI.Toolbar.ToolbarButton;
    _eventListenersView: EventListeners.EventListenersView.EventListenersView;
    _lastRequestedContext?: SDK.RuntimeModel.ExecutionContext;
    private constructor();
    static instance(): ObjectEventListenersSidebarPane;
    toolbarItems(): UI.Toolbar.ToolbarItem[];
    update(): void;
    wasShown(): void;
    willHide(): void;
    _windowObjectInContext(executionContext: SDK.RuntimeModel.ExecutionContext): Promise<SDK.RemoteObject.RemoteObject | null>;
    _refreshClick(event: Common.EventTarget.EventTargetEvent): void;
}
export declare const objectGroupName = "object-event-listeners-sidebar-pane";
