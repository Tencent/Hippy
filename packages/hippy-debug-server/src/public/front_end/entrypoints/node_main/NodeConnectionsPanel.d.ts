import type * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class NodeConnectionsPanel extends UI.Panel.Panel {
    _config: Adb.Config;
    _networkDiscoveryView: NodeConnectionsView;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): NodeConnectionsPanel;
    _devicesDiscoveryConfigChanged(event: Common.EventTarget.EventTargetEvent): void;
}
export declare class NodeConnectionsView extends UI.Widget.VBox implements UI.ListWidget.Delegate<Adb.PortForwardingRule> {
    _callback: (arg0: Adb.NetworkDiscoveryConfig) => void;
    _list: UI.ListWidget.ListWidget<Adb.PortForwardingRule>;
    _editor: UI.ListWidget.Editor<Adb.PortForwardingRule> | null;
    _networkDiscoveryConfig: {
        address: string;
    }[];
    constructor(callback: (arg0: Adb.NetworkDiscoveryConfig) => void);
    _update(): void;
    _addNetworkTargetButtonClicked(): void;
    discoveryConfigChanged(networkDiscoveryConfig: Adb.NetworkDiscoveryConfig): void;
    renderItem(rule: Adb.PortForwardingRule, _editable: boolean): Element;
    removeItemRequested(rule: Adb.PortForwardingRule, index: number): void;
    commitEdit(rule: Adb.PortForwardingRule, editor: UI.ListWidget.Editor<Adb.PortForwardingRule>, isNew: boolean): void;
    beginEdit(rule: Adb.PortForwardingRule): UI.ListWidget.Editor<Adb.PortForwardingRule>;
    _createEditor(): UI.ListWidget.Editor<Adb.PortForwardingRule>;
}
