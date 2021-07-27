import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class LocationsSettingsTab extends UI.Widget.VBox implements UI.ListWidget.Delegate<Item> {
    _list: UI.ListWidget.ListWidget<any>;
    _customSetting: Common.Settings.Setting<LocationDescription[]>;
    _editor?: UI.ListWidget.Editor<any>;
    private constructor();
    static instance(): LocationsSettingsTab;
    wasShown(): void;
    _locationsUpdated(): void;
    _addButtonClicked(): void;
    renderItem(location: Item, _editable: boolean): Element;
    removeItemRequested(item: any, index: number): void;
    commitEdit(location: Item, editor: UI.ListWidget.Editor<Item>, isNew: boolean): void;
    beginEdit(location: Item): UI.ListWidget.Editor<Item>;
    _createEditor(): UI.ListWidget.Editor<Item>;
}
export interface Item {
    title: string;
    lat: number;
    long: number;
    timezoneId: string;
    locale: string;
}
export interface LocationDescription {
    title?: string;
    lat: number;
    long: number;
    timezoneId: string;
    locale: string;
}
