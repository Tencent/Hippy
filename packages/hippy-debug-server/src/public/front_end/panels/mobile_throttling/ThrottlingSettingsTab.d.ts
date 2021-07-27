import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ThrottlingSettingsTab extends UI.Widget.VBox implements UI.ListWidget.Delegate<SDK.NetworkManager.Conditions> {
    _list: UI.ListWidget.ListWidget<SDK.NetworkManager.Conditions>;
    _customSetting: Common.Settings.Setting<SDK.NetworkManager.Conditions[]>;
    _editor?: UI.ListWidget.Editor<SDK.NetworkManager.Conditions>;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): ThrottlingSettingsTab;
    wasShown(): void;
    _conditionsUpdated(): void;
    _addButtonClicked(): void;
    renderItem(conditions: SDK.NetworkManager.Conditions, _editable: boolean): Element;
    removeItemRequested(_item: SDK.NetworkManager.Conditions, index: number): void;
    retrieveOptionsTitle(conditions: SDK.NetworkManager.Conditions): string;
    commitEdit(conditions: SDK.NetworkManager.Conditions, editor: UI.ListWidget.Editor<SDK.NetworkManager.Conditions>, isNew: boolean): void;
    beginEdit(conditions: SDK.NetworkManager.Conditions): UI.ListWidget.Editor<SDK.NetworkManager.Conditions>;
    _createEditor(): UI.ListWidget.Editor<SDK.NetworkManager.Conditions>;
}
