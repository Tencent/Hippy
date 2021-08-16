import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as EventListeners from '../event_listeners/event_listeners.js';
export declare class EventListenersWidget extends UI.ThrottledWidget.ThrottledWidget implements UI.Toolbar.ItemsProvider {
    _toolbarItems: (UI.Toolbar.ToolbarButton | UI.Toolbar.ToolbarSettingCheckbox | UI.Toolbar.ToolbarComboBox)[];
    _showForAncestorsSetting: Common.Settings.Setting<boolean>;
    _dispatchFilterBySetting: Common.Settings.Setting<string>;
    _showFrameworkListenersSetting: Common.Settings.Setting<boolean>;
    _eventListenersView: EventListeners.EventListenersView.EventListenersView;
    _lastRequestedNode?: SDK.DOMModel.DOMNode;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): EventListenersWidget;
    doUpdate(): Promise<void>;
    toolbarItems(): UI.Toolbar.ToolbarItem[];
    _onDispatchFilterTypeChanged(event: Event): void;
    _showFrameworkListenersChanged(): void;
    _windowObjectInNodeContext(node: SDK.DOMModel.DOMNode): Promise<SDK.RemoteObject.RemoteObject | null>;
    _eventListenersArrivedForTest(): void;
}
export declare const DispatchFilterBy: {
    All: string;
    Blocking: string;
    Passive: string;
};
export declare const _objectGroupName = "event-listeners-panel";
