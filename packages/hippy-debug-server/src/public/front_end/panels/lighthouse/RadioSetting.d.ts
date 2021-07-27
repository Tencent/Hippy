import type * as Common from '../../core/common/common.js';
export declare class RadioSetting {
    _setting: Common.Settings.Setting<string>;
    _options: {
        value: string;
        label: () => Common.UIString.LocalizedString;
    }[];
    element: HTMLDivElement;
    _radioElements: HTMLInputElement[];
    _ignoreChangeEvents: boolean;
    _selectedIndex: number;
    constructor(options: {
        value: string;
        label: () => Common.UIString.LocalizedString;
    }[], setting: Common.Settings.Setting<string>, description: string);
    _updateUI(): void;
    _settingChanged(): void;
    _valueChanged(_event: Event): void;
}
