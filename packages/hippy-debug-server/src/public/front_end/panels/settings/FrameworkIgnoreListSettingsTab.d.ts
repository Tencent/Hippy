import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class FrameworkIgnoreListSettingsTab extends UI.Widget.VBox implements UI.ListWidget.Delegate<Common.Settings.RegExpSettingItem> {
    _ignoreListLabel: Common.UIString.LocalizedString;
    _disabledLabel: Common.UIString.LocalizedString;
    _list: UI.ListWidget.ListWidget<Common.Settings.RegExpSettingItem>;
    _setting: Common.Settings.RegExpSetting;
    _editor?: UI.ListWidget.Editor<Common.Settings.RegExpSettingItem>;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): FrameworkIgnoreListSettingsTab;
    wasShown(): void;
    _settingUpdated(): void;
    _addButtonClicked(): void;
    renderItem(item: Common.Settings.RegExpSettingItem, _editable: boolean): Element;
    removeItemRequested(item: Common.Settings.RegExpSettingItem, index: number): void;
    commitEdit(item: Common.Settings.RegExpSettingItem, editor: UI.ListWidget.Editor<Common.Settings.RegExpSettingItem>, isNew: boolean): void;
    beginEdit(item: Common.Settings.RegExpSettingItem): UI.ListWidget.Editor<Common.Settings.RegExpSettingItem>;
    _createEditor(): UI.ListWidget.Editor<Common.Settings.RegExpSettingItem>;
}
