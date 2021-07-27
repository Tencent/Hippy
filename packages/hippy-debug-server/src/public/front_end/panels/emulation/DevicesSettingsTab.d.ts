import * as UI from '../../ui/legacy/legacy.js';
import { EmulatedDevice, EmulatedDevicesList } from './EmulatedDevices.js';
export declare class DevicesSettingsTab extends UI.Widget.VBox implements UI.ListWidget.Delegate<EmulatedDevice> {
    containerElement: HTMLElement;
    _addCustomButton: HTMLButtonElement;
    _list: UI.ListWidget.ListWidget<EmulatedDevice>;
    _muteUpdate: boolean;
    _emulatedDevicesList: EmulatedDevicesList;
    _editor?: UI.ListWidget.Editor<EmulatedDevice>;
    private constructor();
    static instance(): DevicesSettingsTab;
    wasShown(): void;
    _devicesUpdated(): void;
    _muteAndSaveDeviceList(custom: boolean): void;
    _addCustomDevice(): void;
    _toNumericInputValue(value: number): string;
    renderItem(device: EmulatedDevice, editable: boolean): Element;
    removeItemRequested(item: EmulatedDevice): void;
    commitEdit(device: EmulatedDevice, editor: UI.ListWidget.Editor<EmulatedDevice>, isNew: boolean): void;
    beginEdit(device: EmulatedDevice): UI.ListWidget.Editor<EmulatedDevice>;
    _createEditor(): UI.ListWidget.Editor<EmulatedDevice>;
}
