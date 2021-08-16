import * as Common from '../../core/common/common.js';
export declare const createSettingCheckbox: (name: string, setting: Common.Settings.Setting<boolean>, omitParagraphElement?: boolean | undefined, tooltip?: string | undefined) => Element;
export declare const bindCheckbox: (inputElement: Element, setting: Common.Settings.Setting<boolean>) => void;
export declare const createCustomSetting: (name: string, element: Element) => Element;
export declare const createControlForSetting: (setting: Common.Settings.Setting<unknown>, subtitle?: string | undefined) => Element | null;
export interface SettingUI {
    settingElement(): Element | null;
}
